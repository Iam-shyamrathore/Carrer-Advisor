import type { NextPage } from 'next';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white space-y-6">
      <h1 className="text-5xl font-bold">Career Advisor MVP</h1>
      <p className="text-lg text-gray-400">Your personalized career roadmap starts here.</p>
      <div className="flex space-x-4">
        <Link href="/signup" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Sign Up
        </Link>
        <Link href="/dashboard" className="px-6 py-2 font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-600">
            Go to Dashboard
        </Link>
      </div>
    </main>
  );
};

export default Home;