'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Dashboard } from '@/types/datadog';

interface InvestigationResult {
  success: boolean;
  investigation: string;
  dashboard?: Dashboard;
  dashboardUrl?: string;
}

export default function InvestigatePage() {
  const [monitorId, setMonitorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to investigate monitor');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
            <div className="flex gap-4">
              <input
                type="text"
                value={monitorId}
                onChange={(e) => setMonitorId(e.target.value)}
                placeholder="Enter Monitor ID"
                className="flex-1 px-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[#238636] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg transition-colors min-w-[160px]"
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
              <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Investigation Analysis</h2>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                    {result.investigation}
                  </pre>
                </div>
              </div>

              {/* Dashboard Info */}
              {result.dashboard && (
                <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
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

                    {result.dashboardUrl && (
                      <div className="pt-4">
                        <a
                          href={result.dashboardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
                        >
                          View Dashboard in Datadog
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Widget Details */}
              {result.dashboard && (
                <details className="bg-[#161b22] border border-gray-800 rounded-lg">
                  <summary className="px-6 py-4 cursor-pointer text-gray-300 hover:text-gray-100">
                    View Dashboard Configuration
                  </summary>
                  <div className="px-6 pb-6">
                    <pre className="mt-2 p-4 bg-[#0d1117] border border-gray-800 rounded text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(result.dashboard, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 p-6 bg-[#161b22] border border-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">How it works</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
              <li>Enter a Datadog monitor ID from a firing alert</li>
              <li>The AI analyzes the monitor configuration and context</li>
              <li>It creates a custom dashboard with relevant metrics, logs, and visualizations</li>
              <li>The dashboard is automatically created in your Datadog account</li>
              <li>Use the dashboard to investigate and resolve the incident</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 