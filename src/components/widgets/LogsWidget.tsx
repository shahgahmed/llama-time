'use client';

import { format } from 'date-fns';
import { LogsData, LogsConfig } from '@/types/dashboard';

interface LogsWidgetProps {
  title: string;
  data?: LogsData;
  config: LogsConfig;
}

export default function LogsWidget({ title, data, config }: LogsWidgetProps) {
  if (data?.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading logs...</span>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-center mx-auto">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load logs</div>
        </div>
      </div>
    );
  }

  const entries = data?.entries || [];

  return (
    <div className="h-full flex flex-col">
      {/* Widget Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            {data?.totalCount && (
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {entries.length.toLocaleString()}/{data.totalCount.toLocaleString()}
              </span>
            )}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Live</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logs Content */}
      <div className="flex-1 overflow-hidden">
        {entries.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">No logs found</div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="divide-y divide-gray-200 dark:divide-gray-800/50">
              {entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="group px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors duration-150"
                >
                  <div className="flex items-start gap-3">
                    <LogLevelBadge level={entry.level} />
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Timestamp and Service */}
                      <div className="flex items-center gap-3 text-xs">
                        {config.showTimestamp !== false && (
                          <span className="font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {format(new Date(entry.timestamp), 'HH:mm:ss.SSS')}
                          </span>
                        )}
                        {config.showService !== false && entry.service && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {entry.service}
                          </span>
                        )}
                      </div>
                      
                      {/* Log Message */}
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 leading-relaxed break-words">
                        {entry.message}
                      </div>
                      
                      {/* Attributes */}
                      {entry.attributes && Object.keys(entry.attributes).length > 0 && (
                        <details className="group-hover:opacity-100 opacity-75 transition-opacity">
                          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none font-medium">
                            View attributes
                          </summary>
                          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(entry.attributes, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LogLevelBadge({ level }: { level: 'error' | 'warn' | 'info' | 'debug' }) {
  const configs = {
    error: {
      bg: 'bg-red-100 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      label: 'ERR'
    },
    warn: {
      bg: 'bg-amber-100 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      label: 'WRN'
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'INF'
    },
    debug: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-600 dark:text-gray-400',
      label: 'DBG'
    }
  };

  const config = configs[level];

  return (
    <div className={`inline-flex items-center justify-center w-12 h-6 rounded-md text-xs font-mono font-semibold border ${config.bg} ${config.border} ${config.text} flex-shrink-0`}>
      {config.label}
    </div>
  );
} 