import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import ChatModal from '@/components/ChatModal';

type Resource = { id: string; milestoneText: string; title: string; url: string; type: string; description: string; };
type Roadmap = { id: string; phases: string; resources: Resource[]; };
type AnalysisRecord = { id: string; result: string; createdAt: string; roadmap: Roadmap | null; };

const AnalysisDetailPage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { analysisId } = router.query;

  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [loadingMilestone, setLoadingMilestone] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState('');

const fetchAnalysis = async () => {
    if (typeof analysisId === 'string') {
      setIsLoading(true);
      try {
        // Change the URL here from '/analyses/' to '/profile/'
        const response = await api.get(`/api/v1/profile/${analysisId}`);
        setAnalysis(response.data);
      } catch (err) { setError('Failed to load analysis.'); }
      finally { setIsLoading(false); }
    }
};

  useEffect(() => {
    if (router.isReady) {
      fetchAnalysis();
    }
  }, [router.isReady, analysisId]);
  
  const handleGenerateRoadmap = async () => {
    if (!analysis) return;
    setIsRoadmapLoading(true);
    setError('');
    try {
      await api.post(`/api/v1/profile/${analysis.id}/roadmap`);
      await fetchAnalysis(); // Refetch the single analysis to get roadmap
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
      await fetchAnalysis(); // Refetch the single analysis to get new resources
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not find resources.');
    } finally {
      setLoadingMilestone(null);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-black">
        <div className="relative z-10 flex items-center space-x-3 text-slate-300">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
          <p className="text-lg">Loading analysis...</p>
        </div>
      </main>
    );
  }

  if (!analysis) { 
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-black text-center p-4">
            <h2 className="text-3xl font-bold text-red-400">Analysis Not Found</h2>
            <p className="text-slate-400 mt-2">{error}</p>
            <Button variant="ghost" asChild className="mt-6 text-blue-400 hover:text-blue-300"><Link href="/dashboard"> &larr; Back to Dashboard</Link></Button>
        </main>
    )
  }
const parsedResult = JSON.parse(analysis.result);
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 relative overflow-hidden p-4 md:p-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Analysis Details</h1>
            <p className="text-slate-400">Generated on {new Date(analysis.createdAt).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" asChild className="text-slate-400 hover:text-slate-200">
            <Link href="/dashboard"> &larr; Back to Dashboard</Link>
          </Button>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Analysis Result</h2>
            <div>
            <h4 className="text-lg font-semibold text-slate-100 mb-2">Summary</h4>
            <p className="leading-relaxed">{parsedResult.analysis}</p>
            </div>
            <div>
            <h4 className="text-lg font-semibold text-slate-100 mb-2">Suggestions</h4>
            <ul className="list-disc list-inside space-y-2 pl-2">
                {parsedResult.suggestions.map((suggestion: string, index: number) => (
                <li key={index}>{suggestion}</li>
                ))}
            </ul>
            </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Career Roadmap</h2>
              {isRoadmapLoading ? (<p className="text-slate-300">Generating your roadmap...</p>) : 
               analysis.roadmap ? (
                <div className="space-y-6">
                  {JSON.parse(analysis.roadmap.phases).roadmap.map((phase: any) => (
                    <div key={phase.title}>
                      <h3 className="text-xl font-bold text-cyan-400 mb-3">{phase.title}</h3>
                      <ul className="list-disc list-inside pl-4 text-slate-300 space-y-4">
                        {phase.milestones.map((milestone: string) => {
                          const resources = analysis.roadmap?.resources.filter(res => res.milestoneText === milestone);
                          const isFindingResources = loadingMilestone === milestone;
                          return (
                            <li key={milestone}>
                              {milestone}
                              <div className="inline-flex items-center align-middle ml-2 space-x-2">
                                {(!resources || resources.length === 0) && (
                                  <Button size="sm" variant="outline" onClick={() => handleFindResources(analysis.roadmap!.id, milestone)} disabled={isFindingResources}>
                                    {isFindingResources ? 'Finding...' : 'Find Resources'}
                                  </Button>
                                )}
                                <Button size="sm" variant="secondary" onClick={() => { setActiveMilestone(milestone); setIsChatOpen(true); }}>
                                  Get Help
                                </Button>
                              </div>
                              {resources && resources.length > 0 && (
                                <ul className="pl-6 mt-2 space-y-2">
                                  {resources.map(res => (
                                    <li key={res.id} className="text-sm"><a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">[{res.type}] {res.title}</a><p className="text-slate-400 italic">{res.description}</p></li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <Button onClick={handleGenerateRoadmap} disabled={isRoadmapLoading} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                  ✨ Generate My Roadmap
                </Button>
              )}
            </div>
        </div>
      </div>
      {session?.user?.id && (
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} milestoneText={activeMilestone} userId={session.user.id}/>
      )}
    </main>
  );
};

export default AnalysisDetailPage;