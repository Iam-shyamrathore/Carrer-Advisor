import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-5xl font-bold">
        Career Advisor MVP
      </h1>
      <p className="mt-4 text-lg text-gray-400">Your personalized career roadmap starts here.</p>
    </main>
  );
};

export default Home;