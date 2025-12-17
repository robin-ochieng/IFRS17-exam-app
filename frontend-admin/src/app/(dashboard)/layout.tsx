'use client';

import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isCollapsed={sidebarCollapsed} />

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div
          className={cn(
            'min-h-screen transition-all duration-300',
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          )}
        >
          {/* Fixed Header */}
          <div 
            className={cn(
              'fixed top-0 right-0 z-20',
              sidebarCollapsed ? 'lg:left-16' : 'lg:left-64',
              'left-0'
            )}
          >
            <Header onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          </div>
          
          {/* Scrollable main content with top padding for fixed header */}
          <main className="pt-20 p-4 lg:p-6 lg:pt-20">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
