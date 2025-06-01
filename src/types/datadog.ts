// Monitor related types
export interface Monitor {
  id: number;
  org_id?: number;
  name: string;
  type: MonitorType;
  query: string;
  message: string;
  tags: string[];
  created: string;
  modified: string;
  overall_state: MonitorState;
  options: MonitorOptions;
  priority?: number;
}

export type MonitorType = 
  | 'metric alert'
  | 'service check'
  | 'event alert'
  | 'log alert'
  | 'process alert'
  | 'synthetics alert'
  | 'rum alert'
  | 'audit alert'
  | 'trace-analytics alert'
  | 'slo alert'
  | 'composite';

export type MonitorState = 'OK' | 'Alert' | 'Warn' | 'No Data' | 'Unknown';

export interface MonitorOptions {
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
  silenced?: Record<string, number | null>;
  include_tags?: boolean;
  require_full_window?: boolean;
  locked?: boolean;
}

// Service dependency types
export interface ServiceDependency {
  service: string;
  env: string;
  type: 'web' | 'db' | 'cache' | 'broker' | 'custom';
  dependencies: string[];
  metrics?: ServiceMetrics;
}

export interface ServiceMetrics {
  latency_p99?: number;
  error_rate?: number;
  request_rate?: number;
}

// Log types
export interface LogSearch {
  logs: LogEntry[];
  nextPageCursor?: string;
  metadata?: {
    elapsed: number;
    request_id: string;
    page?: {
      after?: string;
    };
  };
}

export interface LogEntry {
  id: string;
  content: {
    timestamp: string;
    message: string;
    service?: string;
    status?: string;
    host?: string;
    attributes?: Record<string, unknown>;
  };
}

// Metric query types
export interface MetricQueryRequest {
  from: number;
  to: number;
  query: string;
}

export interface MetricQueryResponse {
  status: string;
  res_type: string;
  series: MetricSeries[];
  from_date: number;
  to_date: number;
  query: string;
  message?: string;
}

export interface MetricSeries {
  metric: string;
  display_name?: string;
  unit?: [string, string];
  pointlist: Array<[number, number | null]>;
  scope: string;
  expression?: string;
  attributes?: Record<string, unknown>;
}

// Dashboard types
export interface Dashboard {
  id?: string;
  title: string;
  description?: string;
  layout_type: 'ordered' | 'free';
  widgets: Widget[];
  template_variables?: TemplateVariable[];
  notify_list?: string[];
  reflow_type?: 'auto' | 'fixed';
}

export interface Widget {
  id?: number;
  definition: WidgetDefinition;
  layout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type WidgetDefinition = 
  | TimeseriesWidgetDefinition
  | QueryValueWidgetDefinition
  | TopListWidgetDefinition
  | HeatMapWidgetDefinition
  | LogStreamWidgetDefinition
  | AlertGraphWidgetDefinition
  | GroupWidgetDefinition
  | NoteWidgetDefinition;

export interface TimeseriesWidgetDefinition {
  type: 'timeseries';
  title?: string;
  show_legend?: boolean;
  legend_layout?: 'auto' | 'horizontal' | 'vertical';
  legend_columns?: string[];
  requests: TimeseriesRequest[];
  yaxis?: YAxis;
  markers?: Marker[];
  time?: WidgetTime;
}

export interface TimeseriesRequest {
  q?: string;
  queries?: MetricQuery[];
  formulas?: Formula[];
  response_format?: 'timeseries' | 'scalar';
  style?: RequestStyle;
  display_type?: 'line' | 'area' | 'bars';
}

export interface MetricQuery {
  query: string;
  data_source: 'metrics' | 'logs' | 'rum' | 'security_signals';
  name?: string;
}

export interface Formula {
  formula: string;
  alias?: string;
}

export interface RequestStyle {
  palette?: string;
  line_type?: 'solid' | 'dashed' | 'dotted';
  line_width?: 'normal' | 'thick' | 'thin';
}

export interface YAxis {
  label?: string;
  scale?: 'linear' | 'log' | 'sqrt' | 'pow';
  include_zero?: boolean;
  min?: string;
  max?: string;
}

export interface Marker {
  value: string;
  display_type?: 'ok' | 'error' | 'warning' | 'info';
  label?: string;
}

export interface WidgetTime {
  live_span?: string;
}

export interface QueryValueWidgetDefinition {
  type: 'query_value';
  title?: string;
  requests: QueryValueRequest[];
  autoscale?: boolean;
  precision?: number;
  text_align?: 'left' | 'center' | 'right';
  time?: WidgetTime;
}

export interface QueryValueRequest {
  q?: string;
  queries?: MetricQuery[];
  formulas?: Formula[];
  conditional_formats?: ConditionalFormat[];
  aggregator?: 'avg' | 'last' | 'max' | 'min' | 'sum';
}

export interface ConditionalFormat {
  comparator: '<' | '<=' | '>' | '>=' | '=' | '!=';
  value: number;
  palette: 'green' | 'yellow' | 'red' | 'white_on_green' | 'white_on_yellow' | 'white_on_red';
}

export interface TopListWidgetDefinition {
  type: 'toplist';
  title?: string;
  requests: TopListRequest[];
  time?: WidgetTime;
}

export interface TopListRequest {
  q?: string;
  queries?: MetricQuery[];
  formulas?: Formula[];
  conditional_formats?: ConditionalFormat[];
  limit?: number;
  order?: 'asc' | 'desc';
}

export interface HeatMapWidgetDefinition {
  type: 'heatmap';
  title?: string;
  requests: HeatMapRequest[];
  yaxis?: YAxis;
  time?: WidgetTime;
}

export interface HeatMapRequest {
  q?: string;
  queries?: MetricQuery[];
  formulas?: Formula[];
  style?: RequestStyle;
}

export interface LogStreamWidgetDefinition {
  type: 'log_stream';
  title?: string;
  query?: string;
  columns?: string[];
  show_date_column?: boolean;
  show_message_column?: boolean;
  message_display?: 'inline' | 'expanded-md' | 'expanded-lg';
  time?: WidgetTime;
}

export interface AlertGraphWidgetDefinition {
  type: 'alert_graph';
  title?: string;
  alert_id: string;
  viz_type: 'timeseries' | 'toplist';
  time?: WidgetTime;
}

export interface GroupWidgetDefinition {
  type: 'group';
  title?: string;
  layout_type: 'ordered';
  widgets: Widget[];
  background_color?: string;
  show_title?: boolean;
}

export interface NoteWidgetDefinition {
  type: 'note';
  content: string;
  background_color?: string;
  font_size?: string;
  text_align?: 'left' | 'center' | 'right';
  vertical_align?: 'top' | 'center' | 'bottom';
  show_tick?: boolean;
  tick_pos?: string;
  tick_edge?: 'top' | 'right' | 'bottom' | 'left';
}

export interface TemplateVariable {
  name: string;
  prefix?: string;
  available_values?: string[];
  default?: string;
} 