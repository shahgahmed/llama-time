'use client';

import { Dashboard, Widget } from '@/types/dashboard';
import { useWidgetData } from '@/hooks/useWidgetData';
import TimeseriesWidget from './widgets/TimeseriesWidget';
import MetricWidget from './widgets/MetricWidget';
import LogsWidget from './widgets/LogsWidget';
import AlertStatusWidget from './widgets/AlertStatusWidget';
import MarkdownWidget from './widgets/MarkdownWidget';

interface DashboardViewerProps {
  dashboard: Dashboard;
  onRefresh?: () => void;
}

export default function DashboardViewer({ dashboard, onRefresh }: DashboardViewerProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Dashboard Header */}
      <div className="px-8 py-6 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
              {dashboard.title}
            </h1>
            {dashboard.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal max-w-2xl">
                {dashboard.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-mono">{dashboard.timeRange.display}</span>
            </div>
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-12 gap-6 auto-rows-[200px]">
          {dashboard.widgets.map((widget) => (
            <div
              key={widget.id}
              className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 min-h-0"
              style={{
                gridColumn: `span ${Math.min(widget.layout.width, 12)}`,
                gridRow: `span ${widget.layout.height}`,
              }}
            >
              <WidgetWithData widget={widget} timeRange={dashboard.timeRange} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WidgetWithData({ widget, timeRange }: { widget: Widget; timeRange: Dashboard['timeRange'] }) {
  const { data, loading } = useWidgetData(widget, timeRange);
  
  // Show loading state for data-dependent widgets
  if (loading && widget.config.type !== 'markdown') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return <WidgetRenderer widget={widget} data={data} />;
}

function WidgetRenderer({ widget, data }: { widget: Widget; data?: Widget['data'] }) {
  switch (widget.config.type) {
    case 'timeseries':
      return (
        <TimeseriesWidget
          title={widget.title}
          data={data?.type === 'timeseries' ? data : undefined}
          config={widget.config}
        />
      );
    
    case 'metric':
      return (
        <MetricWidget
          title={widget.title}
          data={data?.type === 'metric' ? data : undefined}
          config={widget.config}
        />
      );
    
    case 'logs':
      return (
        <LogsWidget
          title={widget.title}
          data={data?.type === 'logs' ? data : undefined}
          config={widget.config}
        />
      );
    
    case 'alert_status':
      return (
        <AlertStatusWidget
          title={widget.title}
          data={data?.type === 'alert_status' ? data : undefined}
          config={widget.config}
        />
      );
    
    case 'markdown':
      return (
        <MarkdownWidget
          title={widget.title}
          data={data?.type === 'markdown' ? data : undefined}
          config={widget.config}
        />
      );
    
    default:
      return (
        <div className="p-6">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Unsupported widget type: {widget.type}
          </div>
        </div>
      );
  }
} 