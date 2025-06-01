'use client';

import { useState, useEffect } from 'react';
import { Widget, WidgetData, TimeRange } from '@/types/dashboard';

export function useWidgetData(widget: Widget, timeRange: TimeRange) {
  const [data, setData] = useState<WidgetData | undefined>(widget.data);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Skip if widget doesn't need data (like markdown)
      if (widget.config.type === 'markdown' || widget.config.type === 'service_map') {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/dashboard/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            widgetConfig: widget.config,
            timeRange: {
              from: timeRange.from.toISOString(),
              to: timeRange.to.toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch widget data');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error('Error fetching widget data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Set error data for the widget
        const errorData = getErrorDataForType(widget.config.type);
        setData(errorData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [widget.config, timeRange]);

  return { data, loading, error };
}

function getErrorDataForType(type: string): WidgetData {
  switch (type) {
    case 'timeseries':
      return { type: 'timeseries', series: [], error: 'Failed to fetch data' };
    case 'metric':
      return { type: 'metric', value: 0, error: 'Failed to fetch data' };
    case 'logs':
      return { type: 'logs', entries: [], error: 'Failed to fetch data' };
    case 'alert_status':
      return { type: 'alert_status', status: 'no_data', monitorName: 'Unknown', error: 'Failed to fetch data' };
    default:
      return { type: 'markdown', content: 'Error loading widget' };
  }
} 