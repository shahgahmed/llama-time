// Datadog API response types

export interface DatadogMetricQueryResponse {
  status: string;
  res_type: string;
  series: DatadogMetricSeries[];
  from_date: number;
  to_date: number;
  query: string;
  message?: string;
}

export interface DatadogMetricSeries {
  metric: string;
  display_name?: string;
  unit?: [string, string];
  pointlist: Array<[number, number | null]>;
  scope: string;
  expression?: string;
  attributes?: Record<string, unknown>;
}

export interface DatadogLogSearchResponse {
  data: DatadogLogEntry[];
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

export interface DatadogLogEntry {
  id: string;
  type: string;
  attributes: {
    timestamp: string;
    status?: string;
    service?: string;
    message?: string;
    [key: string]: unknown;
  };
}

export interface DatadogMonitorResponse {
  id: number;
  org_id?: number;
  name: string;
  type: string;
  query: string;
  message: string;
  tags: string[];
  created: string;
  modified: string;
  overall_state: string;
  options: Record<string, unknown>;
} 