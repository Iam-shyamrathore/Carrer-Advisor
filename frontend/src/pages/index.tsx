import type { NextPage } from 'next';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Main content container */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Hero section */}
          <div className="space-y-6">
            <div className="inline-block">
              <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-400/30 mb-6 backdrop-blur-sm">
                ✨ Your Future Starts Here
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
              Career
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Advisor
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
              Discover your path with AI-powered insights and personalized roadmaps
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {session ? (
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                  Continue Journey
                </Link>
              </Button>
            ) : null}
            
            <div className="transform hover:-translate-y-0.5 transition-all duration-300">
              <AuthButton />
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto">
            <div className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">AI-Powered</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Smart recommendations tailored to your unique profile and goals</p>
            </div>

            <div className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Roadmaps</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Clear, actionable paths to achieve your career objectives</p>
            </div>

            <div className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Personalized</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Custom advice based on your skills, interests, and aspirations</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #00000010 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>
    </main>
  );
};

export default Home;