import { useState, FormEvent, useEffect } from 'react';
import type { NextPage } from 'next';
import api from '../lib/api';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import ChatModal from '../components/ChatModal';
// --- TYPE DEFINITIONS ---
type Resource = {
  id: string;
  milestoneText: string;
  title: string;
  url: string;
  type: string;
  description: string;
};

type Roadmap = {
  id: string;
  phases: string; // JSON string of phases
  resources: Resource[];
};

type AnalysisRecord = {
  id: string;
  profileText: string;
  result: string; // JSON string of analysis
  createdAt: string;
  roadmap: Roadmap | null;
};

// --- COMPONENT ---
const DashboardPage: NextPage = () => {
  const { data: session, status } = useSession();

  // --- STATE MANAGEMENT ---
  const [profileText, setProfileText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [loadingMilestone, setLoadingMilestone] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [newAnalysisResult, setNewAnalysisResult] = useState<AnalysisRecord | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<AnalysisRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState('');

  // --- DATA FETCHING & EVENT HANDLERS ---
  const fetchHistory = async () => {
    if (session?.user?.id) {
      setIsHistoryLoading(true);
      try {
        const response = await api.get(`/api/v1/users/${session.user.id}/analyses`);
        setPastAnalyses(response.data);
      } catch (err) {
        setError('Could not load analysis history.');
      } finally {
        setIsHistoryLoading(false);
      }
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status, session]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setIsLoading(true);
    setError('');
    setNewAnalysisResult(null);
    setSelectedAnalysis(null);
    try {
      const response = await api.post('/api/v1/profile/analyze-and-save', {
        profileText,
        userId: session.user.id,
      });
      setNewAnalysisResult(response.data);
      setProfileText('');
      await fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateRoadmap = async (analysisId: string) => {
    if (!analysisId) return;
    setIsRoadmapLoading(true);
    setError('');
    try {
      await api.post(`/api/v1/profile/${analysisId}/roadmap`);
      const updatedAnalyses = await api.get<AnalysisRecord[]>(`/api/v1/users/${session!.user!.id}/analyses`);
      setPastAnalyses(updatedAnalyses.data);

      const currentlyDisplayedAnalysis = newAnalysisResult || selectedAnalysis;
      if (currentlyDisplayedAnalysis?.id === analysisId) {
        const updatedDisplayAnalysis = updatedAnalyses.data.find(a => a.id === analysisId);
        if (newAnalysisResult) setNewAnalysisResult(updatedDisplayAnalysis || null);
        if (selectedAnalysis) setSelectedAnalysis(updatedDisplayAnalysis || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not generate roadmap.');
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  const handleFindResources = async (roadmapId: string, milestoneText: string) => {
    setLoadingMilestone(milestoneText);
    setError('');
    try {
      await api.post(`/api/v1/roadmaps/${roadmapId}/resources`, { milestoneText });
      
      // Re-fetch the entire history to get the new resources
      const updatedAnalysesResponse = await api.get<AnalysisRecord[]>(`/api/v1/users/${session!.user!.id}/analyses`);
      const updatedAnalyses = updatedAnalysesResponse.data;
      setPastAnalyses(updatedAnalyses);

      // --- THIS IS THE FIX ---
      // Find the analysis we are currently viewing in the newly fetched data
      // and update our local state to force a re-render with the new resources.
      const currentlyDisplayedAnalysis = newAnalysisResult || selectedAnalysis;
      if (currentlyDisplayedAnalysis) {
        const updatedDisplayAnalysis = updatedAnalyses.find(a => a.id === currentlyDisplayedAnalysis.id);
        if (updatedDisplayAnalysis) {
            if (newAnalysisResult) setNewAnalysisResult(updatedDisplayAnalysis);
            if (selectedAnalysis) setSelectedAnalysis(updatedDisplayAnalysis);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not find resources.');
    } finally {
      setLoadingMilestone(null);
    }
  };

  const analysisToDisplay = selectedAnalysis || newAnalysisResult;

  if (status === "loading") { /* ... unchanged ... */ }
  if (status === "unauthenticated") { /* ... unchanged ... */ }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Link href="/" className="text-sm text-blue-400 hover:underline">&larr; Back to Home</Link>
        </div>
        
        {error && <div className="p-4 mb-4 bg-red-900 border border-red-700 rounded-md text-red-300">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <form onSubmit={handleSubmit} className="p-6 bg-gray-800 rounded-lg space-y-4">
              <textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder="Paste your resume, LinkedIn profile, or GitHub bio here..."
                required
                rows={10}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
              >
                {isLoading ? 'Analyzing...' : 'Analyze My Profile'}
              </button>
            </form>
            
            <div className="p-6 bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Your Past Analyses</h2>
              {isHistoryLoading ? (
                <p>Loading history...</p>
              ) : pastAnalyses.length === 0 ? (
                <p className="text-gray-400">No past analyses found.</p>
              ) : (
                <ul className="space-y-2">
                  {pastAnalyses.map((analysis) => (
                    <li key={analysis.id}>
                      <button
                        onClick={() => {
                          setSelectedAnalysis(analysis);
                          setNewAnalysisResult(null);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-gray-700"
                      >
                        Analysis from {new Date(analysis.createdAt).toLocaleString()}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {analysisToDisplay ? (
              <div className="p-6 bg-gray-800 rounded-lg sticky top-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>
                  <pre className="whitespace-pre-wrap bg-gray-900 p-4 rounded-md text-gray-300 max-h-60 overflow-y-auto">
                    {JSON.stringify(JSON.parse(analysisToDisplay.result), null, 2)}
                  </pre>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Career Roadmap</h2>
                  {isRoadmapLoading ? (
                     <p>Generating your roadmap...</p>
                  ) : analysisToDisplay.roadmap ? (
                    <div className="space-y-4">
                      {JSON.parse(analysisToDisplay.roadmap.phases).roadmap.map((phase: any) => (
                        <div key={phase.title}>
                          <h3 className="font-semibold text-lg text-blue-300">{phase.title}</h3>
                          <ul className="list-disc list-inside pl-4 text-gray-400 space-y-3 mt-1">
                            {phase.milestones.map((milestone: string) => {
                              const resources = analysisToDisplay.roadmap?.resources.filter(
                                res => res.milestoneText === milestone
                              );
                              const isFindingResources = loadingMilestone === milestone;
                              return (
                                <li key={milestone}>
                                  {milestone}
                                  
                                  {/* --- CHANGES ARE HERE --- */}
                                  <div className="inline-flex items-center align-middle ml-2 space-x-2">
                                    
                                    {/* Find Resources Button (only shows if no resources exist yet) */}
                                    {(!resources || resources.length === 0) && (
                                      <button
                                        onClick={() => handleFindResources(analysisToDisplay.roadmap!.id, milestone)}
                                        disabled={isFindingResources}
                                        className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-2 rounded-full disabled:opacity-50"
                                      >
                                        {isFindingResources ? 'Finding...' : 'Find Resources'}
                                      </button>
                                    )}

                                    {/* NEW: Get Help Button */}
                                    <button
                                      onClick={() => {
                                        setActiveMilestone(milestone);
                                        setIsChatOpen(true);
                                      }}
                                      title="Get help from the AI Coach"
                                      className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold py-1 px-2 rounded-full"
                                    >
                                      Get Help
                                    </button>
                                  </div>

                                  {/* Resource List (only shows if resources exist) */}
                                  {resources && resources.length > 0 ? (
                                    <ul className="pl-6 mt-2 space-y-2">
                                      {resources.map(res => (
                                        <li key={res.id} className="text-sm">
                                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                            [{res.type}] {res.title}
                                          </a>
                                          <p className="text-gray-500 italic">{res.description}</p>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateRoadmap(analysisToDisplay.id)}
                      disabled={isRoadmapLoading}
                      className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-500"
                    >
                      {isRoadmapLoading ? 'Generating...' : '✨ Generate My Roadmap'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-800 rounded-lg flex items-center justify-center h-full">
                <p className="text-gray-400">Submit a profile on the left to see the analysis here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        milestoneText={activeMilestone}
        userId={session!.user!.id}
      />
    </main>
  );
};

export default DashboardPage;