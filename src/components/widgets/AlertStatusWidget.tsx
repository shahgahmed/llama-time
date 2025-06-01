'use client';

import { formatDistanceToNow } from 'date-fns';
import { AlertStatusData, AlertStatusConfig } from '@/types/dashboard';

interface AlertStatusWidgetProps {
  title: string;
  data?: AlertStatusData;
  config: AlertStatusConfig;
}

export default function AlertStatusWidget({ title, data }: AlertStatusWidgetProps) {
  if (data?.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading status...</span>
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
          <div className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load status</div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(data?.status);

  return (
    <div className="h-full flex flex-col">
      {/* Widget Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h3>
          <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
            Monitor ID: {data?.monitorName ? data.monitorName.split(' ')[0] : 'N/A'}
          </div>
        </div>
      </div>
      
      {/* Status Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          {/* Status Indicator */}
          <div className="flex items-center justify-center">
            <StatusIndicator status={data?.status} />
          </div>

          {/* Status Text */}
          <div className="space-y-1">
            <div className={`text-lg font-semibold tracking-tight ${statusConfig.textColor}`}>
              {statusConfig.label}
            </div>
            
            {data?.lastTriggered && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last triggered {formatDistanceToNow(data.lastTriggered, { addSuffix: true })}
              </div>
            )}
          </div>

          {/* Monitor Name */}
          {data?.monitorName && (
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                {data.monitorName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {data?.message && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50 dark:bg-[#0a0a0a]">
          <div className="text-xs font-mono text-gray-700 dark:text-gray-300 leading-relaxed">
            {data.message}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIndicator({ status }: { status?: 'ok' | 'alert' | 'warn' | 'no_data' }) {
  const config = getStatusConfig(status);
  
  return (
    <div className={`relative w-12 h-12 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center transition-all duration-300 hover:scale-105`}>
      <div className={`w-6 h-6 rounded-full ${config.dotColor}`} />
      {status === 'alert' && (
        <div className={`absolute inset-0 rounded-full ${config.dotColor} opacity-20 animate-pulse`} />
      )}
    </div>
  );
}

function getStatusConfig(status?: 'ok' | 'alert' | 'warn' | 'no_data') {
  switch (status) {
    case 'alert':
      return {
        label: 'ALERT',
        textColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800',
        dotColor: 'bg-red-500'
      };
    case 'warn':
      return {
        label: 'WARNING',
        textColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950',
        borderColor: 'border-amber-200 dark:border-amber-800',
        dotColor: 'bg-amber-500'
      };
    case 'ok':
      return {
        label: 'OK',
        textColor: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950',
        borderColor: 'border-green-200 dark:border-green-800',
        dotColor: 'bg-green-500'
      };
    default:
      return {
        label: 'NO DATA',
        textColor: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900',
        borderColor: 'border-gray-200 dark:border-gray-700',
        dotColor: 'bg-gray-400'
      };
  }
} 