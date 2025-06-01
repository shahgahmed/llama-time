'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

interface MonitorData {
  id: number;
  name: string;
  type: string;
  query: string;
  message: string;
  tags: string[];
  options: {
    notify_no_data?: boolean;
    no_data_timeframe?: number;
    timeout_h?: number;
    renotify_interval?: number;
    escalation_message?: string;
    thresholds?: {
      critical?: number;
      warning?: number;
      ok?: number;
    };
    [key: string]: unknown;
  };
  overall_state: string;
  created: string;
  modified: string;
  [key: string]: unknown;
}

export default function DatadogMonitorPage() {
  const [monitorId, setMonitorId] = useState('');
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitorData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monitorId.trim()) {
      setError('Please enter a monitor ID');
      return;
    }

    setLoading(true);
    setError(null);
    setMonitorData(null);

    try {
      const response = await fetch(`/api/datadog/monitor/${monitorId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch monitor data');
      }

      setMonitorData(data);
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
          <h1 className="text-3xl font-bold text-gray-100 mb-8">
            Datadog Monitor Viewer
          </h1>

          {/* Search Form */}
          <form onSubmit={fetchMonitorData} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={monitorId}
                onChange={(e) => setMonitorId(e.target.value)}
                placeholder="Enter Monitor ID"
                className="flex-1 px-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Fetch Monitor'}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Monitor Data Display */}
          {monitorData && (
            <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">{monitorData.name}</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Monitor ID</h3>
                    <p className="mt-1 text-lg text-gray-100">{monitorData.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Type</h3>
                    <p className="mt-1 text-lg text-gray-100">{monitorData.type}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Status</h3>
                    <p className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-sm rounded-full ${
                          monitorData.overall_state === 'OK'
                            ? 'bg-green-900/30 text-green-300 border border-green-800/30'
                            : monitorData.overall_state === 'Alert'
                            ? 'bg-red-900/30 text-red-300 border border-red-800/30'
                            : 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/30'
                        }`}
                      >
                        {monitorData.overall_state}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Created</h3>
                    <p className="mt-1 text-lg text-gray-100">
                      {new Date(monitorData.created).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400">Query</h3>
                  <pre className="mt-1 p-3 bg-[#0d1117] border border-gray-800 rounded text-sm text-gray-200 overflow-x-auto">
                    {monitorData.query}
                  </pre>
                </div>

                {monitorData.message && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Message</h3>
                    <div className="mt-1 p-3 bg-[#0d1117] border border-gray-800 rounded text-gray-200">
                      {monitorData.message}
                    </div>
                  </div>
                )}

                {monitorData.tags && monitorData.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Tags</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {monitorData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON Display */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-200">
                    View Raw JSON
                  </summary>
                  <pre className="mt-2 p-4 bg-[#0d1117] border border-gray-800 rounded text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(monitorData, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 