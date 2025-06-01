'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DashboardViewer from '@/components/DashboardViewer';
import { Dashboard } from '@/types/dashboard';

export default function DashboardPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load dashboard from localStorage (in a real app, this would be from a database)
    const storedDashboard = localStorage.getItem(`dashboard-${resolvedParams.id}`);
    if (storedDashboard) {
      try {
        const parsed = JSON.parse(storedDashboard);
        // Convert date strings back to Date objects
        parsed.createdAt = new Date(parsed.createdAt);
        parsed.timeRange.from = new Date(parsed.timeRange.from);
        parsed.timeRange.to = new Date(parsed.timeRange.to);
        setDashboard(parsed);
      } catch (error) {
        console.error('Failed to parse dashboard:', error);
      }
    }
    setLoading(false);
  }, [resolvedParams.id]);

  const handleRefresh = () => {
    // In a real implementation, this would refresh the data from Datadog
    console.log('Refreshing dashboard data...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-100">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-73px)]">
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-100">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-73px)]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Dashboard not found</h2>
            <p className="text-gray-400 mb-4">The dashboard you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.push('/investigate')}
              className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
            >
              Back to Investigation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <Navigation />
      <div className="h-[calc(100vh-73px)]">
        <DashboardViewer dashboard={dashboard} onRefresh={handleRefresh} />
      </div>
    </div>
  );
} 