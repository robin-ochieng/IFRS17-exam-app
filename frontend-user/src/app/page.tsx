import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Image
                src="/IRA logo.png"
                alt="IRA IFRS 17 Exam"
                width={220}
                height={56}
                className="h-14 w-auto"
                priority
              />
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-semibold">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow relative overflow-hidden flex items-center">
        {/* Background decoration - covers entire main area */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50"></div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-200/40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-100/30 to-cyan-100/30 blur-3xl"></div>
        
        {/* Hero */}
        <section className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-gray-900">IFRS 17</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Online Examination
                </span>
              </h1>
              
              {/* Description */}
              <p className="mt-8 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Assess your understanding of the IFRS 17 Insurance Contracts standard. 
                Designed for insurers under Insurance Regulatory Authority supervision.
              </p>
              
              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/25 text-base font-semibold transition-all hover:scale-105">
                    Start Your Assessment
                    <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-base font-semibold transition-all hover:bg-gray-50">
                    Sign In to Continue
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Insurance Regulatory Authority. All rights reserved.
          </p>
          <p className="text-center text-gray-400 text-xs mt-2">
            Powered by <span className="font-semibold text-blue-600">Kenbright AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
