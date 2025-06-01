// Dashboard types for our own visualization system
export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  monitorId?: number;
  widgets: Widget[];
  timeRange: TimeRange;
}

export interface TimeRange {
  from: Date;
  to: Date;
  display: string; // e.g., "Last 1 hour", "Last 24 hours"
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  layout: WidgetLayout;
  data?: WidgetData;
  config: WidgetConfig;
}

export type WidgetType = 
  | 'timeseries'
  | 'metric'
  | 'logs'
  | 'alert_status'
  | 'markdown'
  | 'service_map';

export interface WidgetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type WidgetData = 
  | TimeseriesData
  | MetricData
  | LogsData
  | AlertStatusData
  | MarkdownData
  | ServiceMapData;

export interface TimeseriesData {
  type: 'timeseries';
  series: SeriesData[];
  loading?: boolean;
  error?: string;
}

export interface SeriesData {
  name: string;
  color?: string;
  data: DataPoint[];
}

export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface MetricData {
  type: 'metric';
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  status?: 'ok' | 'warning' | 'critical';
  loading?: boolean;
  error?: string;
}

export interface LogsData {
  type: 'logs';
  entries: LogEntry[];
  totalCount?: number;
  loading?: boolean;
  error?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  service?: string;
  message: string;
  attributes?: Record<string, unknown>;
}

export interface AlertStatusData {
  type: 'alert_status';
  status: 'ok' | 'alert' | 'warn' | 'no_data';
  monitorName: string;
  lastTriggered?: Date;
  message?: string;
  loading?: boolean;
  error?: string;
}

export interface MarkdownData {
  type: 'markdown';
  content: string;
}

export interface ServiceMapData {
  type: 'service_map';
  services: ServiceNode[];
  connections: ServiceConnection[];
  loading?: boolean;
  error?: string;
}

export interface ServiceNode {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  metrics?: {
    requestRate?: number;
    errorRate?: number;
    latency?: number;
  };
}

export interface ServiceConnection {
  source: string;
  target: string;
  status: 'healthy' | 'degraded' | 'down';
}

export type WidgetConfig = 
  | TimeseriesConfig
  | MetricConfig
  | LogsConfig
  | AlertStatusConfig
  | MarkdownConfig
  | ServiceMapConfig;

export interface TimeseriesConfig {
  type: 'timeseries';
  query: string;
  dataSource: DataSource;
  yAxisLabel?: string;
  showLegend?: boolean;
  lineType?: 'line' | 'area' | 'bar';
}

export interface MetricConfig {
  type: 'metric';
  query: string;
  dataSource: DataSource;
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'last';
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

export interface LogsConfig {
  type: 'logs';
  query: string;
  dataSource: DataSource;
  limit?: number;
  showTimestamp?: boolean;
  showService?: boolean;
}

export interface AlertStatusConfig {
  type: 'alert_status';
  monitorId: number;
  dataSource: DataSource;
}

export interface MarkdownConfig {
  type: 'markdown';
  content: string;
}

export interface ServiceMapConfig {
  type: 'service_map';
  service?: string;
  dataSource: DataSource;
  depth?: number;
}

export interface DataSource {
  type: 'datadog' | 'sentry' | 'newrelic' | 'prometheus';
  // Additional config specific to each data source
} 