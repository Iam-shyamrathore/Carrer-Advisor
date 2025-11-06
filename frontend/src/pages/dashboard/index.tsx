import { useState, FormEvent, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
type AnalysisRecord = { 
  id: string; 
  createdAt: string; 
};
const getTextFromPdf = async (file: File): Promise<string> => {
  // Dynamically import the library here to ensure it's client-side only.
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
    fullText += '\n';
  }
  return fullText;
};

const DashboardHomePage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pastAnalyses, setPastAnalyses] = useState<AnalysisRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Helper function to extract text from a PDF file in the browser
 
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
    if (!session?.user?.id || (!resumeFile && !githubUrl)) {
      setError('Please provide a resume PDF or a GitHub URL.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      let resumeText = '';
      if (resumeFile) {
        resumeText = await getTextFromPdf(resumeFile);
      }

      const payload = {
        userId: session.user.id,
        resumeText: resumeText,
        githubUrl: githubUrl,
      };

      const response = await api.post('/api/v1/profile/analyze-and-save', payload);
      router.push(`/analysis/${response.data.id}`);

    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };
  
  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="relative z-10 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-black text-slate-300 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="relative z-10 text-center">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Access Denied</h1>
            <p className="text-slate-400 mb-6">You must be signed in to view your dashboard.</p>
            <Button onClick={() => signIn("github")}>Sign in with GitHub</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 relative overflow-hidden p-4 md:p-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-slate-400 text-lg">Welcome back, {session?.user?.name || 'Explorer'}</p>
          </div>
          <Button variant="ghost" asChild className="text-slate-400 hover:text-slate-200">
            <Link href="/" className="flex items-center gap-2">&larr; Back to Home</Link>
          </Button>
        </div>
        {error && <div className="mb-6 p-4 bg-red-900/40 border border-red-700/50 rounded-xl text-red-200">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-slate-100">Start a New Analysis</CardTitle>
              <CardDescription className="text-slate-400">Upload a resume and/or provide a GitHub profile URL.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="resume-upload" className="text-sm font-medium text-slate-300">Resume (PDF only)</label>
                  <Input 
                    id="resume-upload"
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)}
                    className="mt-1 file:text-white bg-slate-900/50 border-slate-600/50"
                  />
                </div>
                <div>
                  <label htmlFor="github-url" className="text-sm font-medium text-slate-300">GitHub Profile URL (Optional)</label>
                  <Input
                    id="github-url"
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="mt-1 bg-slate-900/50 border-slate-600/50"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  {isLoading ? 'Processing...' : 'Analyze My Profile'}
                </Button>
              </form>
            </CardContent>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-slate-100">Past Analyses</CardTitle>
              <CardDescription className="text-slate-400">View your previously generated reports.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
              {isHistoryLoading ? (<p className="text-slate-400">Loading history...</p>) : 
               pastAnalyses.length === 0 ? (<p className="text-slate-400 text-center py-8">No past analyses found.</p>) : (
                <div className="space-y-2">
                  {pastAnalyses.map((analysis) => (
                    <Button key={analysis.id} variant="ghost" className="w-full justify-between text-left h-auto p-3" asChild>
                      <Link href={`/analysis/${analysis.id}`}>
                        <div>
                          <p className="text-slate-200 font-medium">Analysis from {new Date(analysis.createdAt).toLocaleDateString()}</p>
                          <p className="text-slate-400 text-xs">{new Date(analysis.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <span>&rarr;</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardHomePage;