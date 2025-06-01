import { defineTool } from './framework';
import { MetricQueryResponse } from '@/types/datadog';

interface QueryMetricsArgs {
  query: string;
  from: number;
  to: number;
}

export const queryMetrics = defineTool<QueryMetricsArgs, MetricQueryResponse>({
  name: 'query_metrics',
  description: 'Query time series metrics data. Essential for analyzing performance trends and identifying anomalies.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Metric query (e.g., "avg:system.cpu.user{service:api}" or "sum:aws.elb.request_count{*}.as_rate()")',
      },
      from: {
        type: 'number',
        description: 'Start timestamp (Unix epoch in seconds)',
      },
      to: {
        type: 'number',
        description: 'End timestamp (Unix epoch in seconds)',
      },
    },
    required: ['query', 'from', 'to'],
  },
  async run({ query, from, to }, client) {
    const params = new URLSearchParams({
      query,
      from: String(from),
      to: String(to),
    });
    
    return await client.request<MetricQueryResponse>(`/api/v1/query?${params}`);
  },
});

export const createMetricTools = () => [
  queryMetrics,
]; 