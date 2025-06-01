'use client';

import { MetricData, MetricConfig } from '@/types/dashboard';

interface MetricWidgetProps {
  title: string;
  data?: MetricData;
  config: MetricConfig;
}

export default function MetricWidget({ title, data, config }: MetricWidgetProps) {
  if (data?.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading metric...</span>
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
          <div className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load metric</div>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(data?.status);
  const trendIcon = getTrendIcon(data?.trend);

  return (
    <div className="h-full flex flex-col">
      {/* Widget Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h3>
          <StatusIndicator status={data?.status} />
        </div>
      </div>

      {/* Metric Value */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="space-y-1">
            <div className={`text-4xl font-bold font-mono tracking-tight ${statusColor}`}>
              {formatValue(data?.value || 0)}
              {data?.unit && <span className="text-2xl font-normal ml-2 opacity-75">{data.unit}</span>}
            </div>
            
            {data?.changePercent !== undefined && (
              <div className="flex items-center justify-center gap-2">
                {trendIcon}
                <span className={`text-sm font-medium font-mono ${getTrendColor(data.trend)}`}>
                  {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thresholds */}
      {config.thresholds && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50 dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600 dark:text-gray-400">Thresholds</span>
            <div className="flex items-center gap-4 font-mono">
              {config.thresholds.warning && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{config.thresholds.warning}</span>
                </div>
              )}
              {config.thresholds.critical && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{config.thresholds.critical}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIndicator({ status }: { status?: 'ok' | 'warning' | 'critical' }) {
  const configs = {
    critical: {
      bg: 'bg-red-100 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      dot: 'bg-red-500'
    },
    warning: {
      bg: 'bg-amber-100 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500'
    },
    ok: {
      bg: 'bg-green-100 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500'
    }
  };

  if (!status || status === 'ok') {
    return (
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    );
  }

  const config = configs[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
      {status.toUpperCase()}
    </div>
  );
}

function getStatusColor(status?: 'ok' | 'warning' | 'critical') {
  switch (status) {
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400';
    case 'ok':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-900 dark:text-gray-100';
  }
}

function getTrendIcon(trend?: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'down':
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14" />
        </svg>
      );
  }
}

function getTrendColor(trend?: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return 'text-green-600 dark:text-green-400';
    case 'down':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

function formatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else if (value < 1 && value > 0) {
    return value.toFixed(3);
  } else {
    return value.toFixed(1);
  }
} 