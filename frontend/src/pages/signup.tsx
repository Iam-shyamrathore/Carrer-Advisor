import { useState, FormEvent } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import api from '../lib/api';

const SignupPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/api/v1/users/signup', { email });
      setMessage(`Success! User created with ID: ${response.data.id}. You can now use this ID on the dashboard.`);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        {message && <p className="text-green-400 text-center">{message}</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}
        <div className="text-center">
            <Link href="/dashboard" className="text-blue-400 hover:underline">
             Go to Dashboard
            </Link>
        </div>
      </div>
    </main>
  );
};

export default SignupPage;