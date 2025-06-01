export interface AIDashboardDesign {
  investigation: string;
  widgets: AIWidgetDesign[];
  layout_strategy: string;
  time_range: string;
}

export interface AIWidgetDesign {
  type: 'timeseries' | 'metric' | 'logs' | 'alert_status' | 'markdown';
  title: string;
  query?: string;
  visualization?: string;
  width?: number;
  height?: number;
  reasoning?: string;
  yAxisLabel?: string;
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'last';
  thresholds?: {
    warning?: number;
    critical?: number;
  };
  limit?: number;
  content?: string;
} 