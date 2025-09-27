import type { NextPage } from 'next';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import { useSession } from 'next-auth/react';

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white space-y-6">
      <h1 className="text-5xl font-bold">Career Advisor MVP</h1>
      <p className="text-lg text-gray-400">Your personalized career roadmap starts here.</p>
      <div className="flex items-center">
        {session && (
          <Link href="/dashboard" className="px-6 py-2 mr-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Go to Dashboard
          </Link>
        )}
        <AuthButton />
      </div>
    </main>
  );
};

export default Home;