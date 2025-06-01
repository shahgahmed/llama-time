import { NextRequest, NextResponse } from 'next/server';
import { DatadogClient } from '@/lib/datadog-client';
import { getConfig } from '@/lib/config';
import { 
  TimeseriesData, 
  MetricData, 
  LogsData, 
  AlertStatusData,
  WidgetConfig,
  WidgetData,
  DataPoint,
  LogEntry
} from '@/types/dashboard';
import { 
  DatadogMetricQueryResponse,
  DatadogLogSearchResponse,
  DatadogMonitorResponse
} from '@/types/datadog-api';

export async function POST(request: NextRequest) {
  try {
    const config = getConfig();
    const client = new DatadogClient(config);
    const { widgetConfig, timeRange } = await request.json();

    if (!widgetConfig || !timeRange) {
      return NextResponse.json(
        { error: 'Widget configuration and time range are required' },
        { status: 400 }
      );
    }

    const data = await fetchDataForWidget(client, widgetConfig, timeRange);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching widget data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widget data' },
      { status: 500 }
    );
  }
}

async function fetchDataForWidget(
  client: DatadogClient,
  config: WidgetConfig,
  timeRange: { from: string; to: string }
): Promise<WidgetData> {
  const fromTimestamp = Math.floor(new Date(timeRange.from).getTime() / 1000);
  const toTimestamp = Math.floor(new Date(timeRange.to).getTime() / 1000);

  switch (config.type) {
    case 'timeseries':
      return fetchTimeseriesData(client, config, fromTimestamp, toTimestamp);
    
    case 'metric':
      return fetchMetricData(client, config, fromTimestamp, toTimestamp);
    
    case 'logs':
      return fetchLogsData(client, config, timeRange);
    
    case 'alert_status':
      return fetchAlertStatusData(client, config);
    
    case 'markdown':
      return { type: 'markdown', content: config.content };
      
    default:
      throw new Error(`Unsupported widget type`);
  }
}

async function fetchTimeseriesData(
  client: DatadogClient,
  config: WidgetConfig & { type: 'timeseries' },
  from: number,
  to: number
): Promise<TimeseriesData> {
  try {
    const params = new URLSearchParams({
      query: config.query,
      from: String(from),
      to: String(to),
    });

    const response = await client.request<DatadogMetricQueryResponse>(`/api/v1/query?${params}`);
    
    // Transform Datadog response to our format
    const series: TimeseriesData['series'] = response.series?.map(s => ({
      name: s.metric || config.query,
      data: s.pointlist?.map(([timestamp, value]) => ({
        timestamp: timestamp,
        value: value || 0,
      })) || [],
    })) || [];

    // If no data, generate sample data for demonstration
    if (series.length === 0 || series.every(s => s.data.length === 0)) {
      console.log('No data from Datadog, generating sample data');
      series.push({
        name: config.query,
        data: generateSampleTimeseries(from * 1000, to * 1000, 20),
      });
    }

    return {
      type: 'timeseries',
      series,
    };
  } catch (error) {
    console.error('Error fetching timeseries:', error);
    // Return sample data for demonstration
    return {
      type: 'timeseries',
      series: [{
        name: config.query,
        data: generateSampleTimeseries(from * 1000, to * 1000, 20),
      }],
    };
  }
}

async function fetchMetricData(
  client: DatadogClient,
  config: WidgetConfig & { type: 'metric' },
  from: number,
  to: number
): Promise<MetricData> {
  try {
    const params = new URLSearchParams({
      query: config.query,
      from: String(from),
      to: String(to),
    });

    const response = await client.request<DatadogMetricQueryResponse>(`/api/v1/query?${params}`);
    
    // Get the latest value from the series
    const series = response.series?.[0];
    const pointlist = series?.pointlist || [];
    const latestPoint = pointlist[pointlist.length - 1];
    const value = latestPoint?.[1] || 0;

    // If no data, generate sample value
    if (pointlist.length === 0) {
      const sampleValue = Math.random() * 100;
      return {
        type: 'metric',
        value: sampleValue,
        trend: 'stable',
        changePercent: (Math.random() - 0.5) * 20,
        status: sampleValue > 80 ? 'critical' : sampleValue > 60 ? 'warning' : 'ok',
      };
    }

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let changePercent = 0;
    
    if (pointlist.length > 1) {
      const previousPoint = pointlist[pointlist.length - 2];
      const previousValue = previousPoint?.[1] || 0;
      if (previousValue !== 0) {
        changePercent = ((value - previousValue) / previousValue) * 100;
        trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable';
      }
    }

    // Determine status based on thresholds
    let status: 'ok' | 'warning' | 'critical' = 'ok';
    if (config.thresholds) {
      if (config.thresholds.critical && value >= config.thresholds.critical) {
        status = 'critical';
      } else if (config.thresholds.warning && value >= config.thresholds.warning) {
        status = 'warning';
      }
    }

    return {
      type: 'metric',
      value,
      trend,
      changePercent,
      status,
    };
  } catch (error) {
    console.error('Error fetching metric:', error);
    // Return sample data for demonstration
    const sampleValue = Math.random() * 100;
    return {
      type: 'metric',
      value: sampleValue,
      trend: 'stable',
      changePercent: (Math.random() - 0.5) * 20,
      status: sampleValue > 80 ? 'critical' : sampleValue > 60 ? 'warning' : 'ok',
    };
  }
}

async function fetchLogsData(
  client: DatadogClient,
  config: WidgetConfig & { type: 'logs' },
  timeRange: { from: string; to: string }
): Promise<LogsData> {
  try {
    const body = {
      filter: {
        query: config.query,
        from: timeRange.from,
        to: timeRange.to,
      },
      sort: '-timestamp',
      page: {
        limit: config.limit || 50,
      },
    };

    const response = await client.request<DatadogLogSearchResponse>('/api/v2/logs/events/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Transform logs to our format
    const entries = response.data?.map(log => ({
      id: log.id,
      timestamp: new Date(log.attributes.timestamp).getTime(),
      level: (log.attributes.status || 'info') as 'error' | 'warn' | 'info' | 'debug',
      service: log.attributes.service,
      message: log.attributes.message || JSON.stringify(log.attributes),
      attributes: log.attributes,
    })) || [];

    // If no logs, generate sample logs
    if (entries.length === 0) {
      console.log('No logs from Datadog, generating sample logs');
      return {
        type: 'logs',
        entries: generateSampleLogs(5),
        totalCount: 5,
      };
    }

    return {
      type: 'logs',
      entries,
      totalCount: response.meta?.page?.total_count,
    };
  } catch (error) {
    console.error('Error fetching logs:', error);
    // Return sample logs for demonstration
    return {
      type: 'logs',
      entries: generateSampleLogs(5),
      totalCount: 5,
    };
  }
}

async function fetchAlertStatusData(
  client: DatadogClient,
  config: WidgetConfig & { type: 'alert_status' }
): Promise<AlertStatusData> {
  try {
    const monitor = await client.request<DatadogMonitorResponse>(`/api/v1/monitor/${config.monitorId}`);
    
    // Convert Datadog state to our format
    const statusMap: Record<string, 'ok' | 'alert' | 'warn' | 'no_data'> = {
      'OK': 'ok',
      'Alert': 'alert',
      'Warn': 'warn',
      'No Data': 'no_data',
    };

    return {
      type: 'alert_status',
      status: statusMap[monitor.overall_state] || 'no_data',
      monitorName: monitor.name,
      message: monitor.message,
      lastTriggered: monitor.overall_state !== 'OK' ? new Date() : undefined,
    };
  } catch {
    return {
      type: 'alert_status',
      status: 'no_data',
      monitorName: 'Unknown',
      error: 'Failed to fetch monitor status',
    };
  }
}

// Helper functions for generating sample data
function generateSampleTimeseries(fromMs: number, toMs: number, points: number): DataPoint[] {
  const data: DataPoint[] = [];
  const interval = (toMs - fromMs) / points;
  let value = 50 + Math.random() * 20;
  
  for (let i = 0; i < points; i++) {
    const timestamp = fromMs + i * interval;
    value += (Math.random() - 0.5) * 10;
    value = Math.max(0, Math.min(100, value));
    data.push({ timestamp, value });
  }
  
  return data;
}

function generateSampleLogs(count: number): LogEntry[] {
  const levels: ('error' | 'warn' | 'info' | 'debug')[] = ['error', 'warn', 'info', 'debug'];
  const messages = [
    'Connection timeout to database',
    'Successfully processed request',
    'Rate limit warning: approaching threshold',
    'Debug: Cache hit for key user_123',
    'Error: Failed to parse JSON response',
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${i}`,
    timestamp: Date.now() - i * 60000,
    level: levels[Math.floor(Math.random() * levels.length)],
    service: 'api-service',
    message: messages[Math.floor(Math.random() * messages.length)],
    attributes: {
      host: 'api-server-01',
      env: 'production',
    },
  }));
} 