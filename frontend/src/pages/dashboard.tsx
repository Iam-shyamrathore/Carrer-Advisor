import { useState, FormEvent, useEffect } from 'react';
import type { NextPage } from 'next';
import api from '../lib/api';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

type Roadmap = {
  id: string;
  phases: string; // JSON string of phases
};

type AnalysisRecord = {
  id: string;
  profileText: string;
  result: string; // JSON string of analysis
  createdAt: string;
  roadmap: Roadmap | null;
};

const DashboardPage: NextPage = () => {
  const { data: session, status } = useSession();

  const [profileText, setProfileText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [newAnalysisResult, setNewAnalysisResult] = useState<AnalysisRecord | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<AnalysisRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

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
  
  const analysisToDisplay = selectedAnalysis || newAnalysisResult;

  const handleGenerateRoadmap = async (analysisId: string) => {
    if (!analysisId) return;
    setIsRoadmapLoading(true);
    setError('');
    try {
      const response = await api.post(`/api/v1/profile/${analysisId}/roadmap`);
      await fetchHistory();
      
      const updatedAnalysis = { ...analysisToDisplay, roadmap: response.data } as AnalysisRecord;

      if (newAnalysisResult?.id === analysisId) setNewAnalysisResult(updatedAnalysis);
      if (selectedAnalysis?.id === analysisId) setSelectedAnalysis(updatedAnalysis);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not generate roadmap.');
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  if (status === "loading") {
    return <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><p>Loading...</p></main>;
  }

  if (status === "unauthenticated") {
    return (
       <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white space-y-4">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p>You must be signed in to view this page.</p>
        <button
          onClick={() => signIn("github")}
          className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Sign in with GitHub
        </button>
      </main>
    );
  }

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
                      {JSON.parse(analysisToDisplay.roadmap.phases).roadmap.map((phase: any, index: number) => (
                        <div key={index}>
                          <h3 className="font-semibold text-lg text-blue-300">{phase.title}</h3>
                          <ul className="list-disc list-inside pl-4 text-gray-400 space-y-1 mt-1">
                            {phase.milestones.map((milestone: string, mIndex: number) => (
                              <li key={mIndex}>{milestone}</li>
                            ))}
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
    </main>
  );
};

export default DashboardPage;