import { useState, FormEvent } from 'react';
import type { NextPage } from 'next';
import api from '../lib/api';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

const DashboardPage: NextPage = () => {
  const { data: session, status } = useSession();
  const [profileText, setProfileText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError('You must be signed in to submit an analysis.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const response = await api.post('/api/v1/profile/analyze-and-save', {
        profileText,
        userId: session.user.id,
      });
      setAnalysisResult(response.data);
    } catch (err: any) { // <-- THE FIX IS HERE: Added the opening {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
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
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Link href="/" className="text-sm text-blue-400 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
        <div className="space-y-6">
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

          {error && <div className="p-4 bg-red-900 border border-red-700 rounded-md text-red-300">{error}</div>}
          
          {analysisResult && (
            <div className="p-6 bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>
              <pre className="whitespace-pre-wrap bg-gray-900 p-4 rounded-md text-gray-300 overflow-x-auto">
                {JSON.stringify(JSON.parse(analysisResult.result), null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;