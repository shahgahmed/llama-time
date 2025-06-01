'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Dashboard } from '@/types/dashboard';

interface InvestigationResult {
  success: boolean;
  investigation: string;
  dashboard?: Dashboard;
  tokenUsage?: {
    contextTokens: number;
    responseTokens: number;
    totalTokens: number;
    contextSources: string[];
  };
}

export default function InvestigatePage() {
  const [monitorId, setMonitorId] = useState('20829685');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useManualContext, setUseManualContext] = useState(true);
  const router = useRouter();

  const investigateMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monitorId.trim()) {
      setError('Please enter a monitor ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/investigate/monitor/${monitorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useManualContext,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to investigate monitor');
      }

      setResult(data);
      
      // Store dashboard in localStorage for viewing
      if (data.dashboard) {
        // Add token usage to dashboard if available
        const dashboardWithTokens = {
          ...data.dashboard,
          tokenUsage: data.tokenUsage
        };
        localStorage.setItem(`dashboard-${data.dashboard.id}`, JSON.stringify(dashboardWithTokens));
        
        // Automatically redirect to the dashboard
        router.push(`/dashboard/${data.dashboard.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const viewDashboard = () => {
    if (result?.dashboard) {
      router.push(`/dashboard/${result.dashboard.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <Navigation />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            AI Monitor Investigation
          </h1>
          <p className="text-gray-400 mb-8">
            Enter a monitor ID to investigate the issue and create a bespoke dashboard for incident resolution.
          </p>

          {/* Search Form */}
          <form onSubmit={investigateMonitor} className="mb-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={monitorId}
                  onChange={(e) => setMonitorId(e.target.value)}
                  placeholder="Enter Monitor ID"
                  className="flex-1 px-4 py-2 bg-[#0d1117] border border-gray-700 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[#FEC601] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#FEC601] hover:bg-[#E6B301] disabled:bg-gray-700 disabled:text-gray-400 text-black rounded-md font-semibold transition-all duration-200 min-w-[160px] shadow-sm hover:shadow-md disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Investigating...
                    </span>
                  ) : (
                    'Investigate & Create Dashboard'
                  )}
                </button>
              </div>
              
              {/* Beautiful Toggle for Manual Context */}
              <div className="flex items-center justify-between p-4 bg-[#161b22] border border-gray-800 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-[#FEC601]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-100">Include Runbooks & Playbooks</div>
                    <div className="text-xs text-gray-400">Add local context for enhanced AI analysis</div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setUseManualContext(!useManualContext)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FEC601] focus:ring-offset-2 focus:ring-offset-[#0d1117] ${
                    useManualContext ? 'bg-[#FEC601]' : 'bg-gray-600'
                  }`}
                >
                  <span className="sr-only">Include manual context</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      useManualContext ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Investigation Notes */}
              <div className="bg-[#161b22] border border-gray-800 rounded-md p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Investigation Analysis</h2>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                    {result.investigation}
                  </pre>
                </div>
              </div>

              {/* Dashboard Info */}
              {result.dashboard && (
                <div className="bg-[#161b22] border border-gray-800 rounded-md p-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Generated Dashboard</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Dashboard Title</h3>
                      <p className="mt-1 text-lg text-gray-100">{result.dashboard.title}</p>
                    </div>
                    
                    {result.dashboard.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">Description</h3>
                        <p className="mt-1 text-gray-300">{result.dashboard.description}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Widgets</h3>
                      <p className="mt-1 text-gray-300">
                        {result.dashboard.widgets.length} widgets created
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={viewDashboard}
                        className="inline-flex items-center px-4 py-2 bg-[#FEC601] hover:bg-[#E6B301] text-black rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        View Dashboard
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Widget Details */}
              {result.dashboard && (
                <details className="bg-[#161b22] border border-gray-800 rounded-md">
                  <summary className="px-6 py-4 cursor-pointer text-gray-300 hover:text-gray-100">
                    View Dashboard Configuration
                  </summary>
                  <div className="px-6 pb-6">
                    <pre className="mt-2 p-4 bg-[#0d1117] border border-gray-800 rounded-md text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(result.dashboard, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 p-6 bg-[#161b22] border border-gray-800 rounded-md">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">How it works</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
              <li>Enter a Datadog monitor ID from a firing alert</li>
              <li>The AI analyzes the monitor configuration and context</li>
              <li>It creates a custom dashboard with relevant metrics, logs, and visualizations</li>
              <li>View the dashboard with real-time data from Datadog</li>
              <li>Use the dashboard to investigate and resolve the incident</li>
            </ol>
            
            <div className="mt-4 p-3 bg-[#FEC601]/10 border border-[#FEC601]/30 rounded-md">
              <p className="text-[#FEC601] text-sm">
                <strong>Note:</strong> Dashboards are displayed within this application, giving you full control over the visualization and the ability to aggregate data from multiple sources in the future.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 