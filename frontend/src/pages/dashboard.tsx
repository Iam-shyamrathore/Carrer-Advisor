import { useState, FormEvent } from 'react';
import type { NextPage } from 'next';
import api from '../lib/api';

const DashboardPage: NextPage = () => {
  const [profileText, setProfileText] = useState('');
  const [userId, setUserId] = useState(''); // User will paste their ID here
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    if (!userId) {
      setError('Please provide a User ID. You can get one from the Signup page.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/profile/analyze-and-save', {
        profileText,
        userId,
    });
      setAnalysisResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">Career Advisor Dashboard</h1>
      <div className="w-full max-w-2xl space-y-6">
        <form onSubmit={handleSubmit} className="p-6 bg-gray-800 rounded-lg space-y-4">
          <p className='text-gray-400 text-sm'>First, <a href="/signup" className='underline'>sign up</a> to get a User ID, then paste it below.</p>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Paste your User ID here"
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
              {JSON.stringify(analysisResult.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
};

export default DashboardPage;