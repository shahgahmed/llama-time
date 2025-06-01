import { defineTool } from './framework';
import { Monitor } from '@/types/datadog';

interface SearchMonitorsArgs {
  query: string;
  page?: number;
  per_page?: number;
}

interface GetMonitorArgs {
  id: number;
}

interface GetMonitorHistoryArgs {
  id: number;
  from_ts: number;
  to_ts: number;
}

interface MonitorSearchResponse {
  monitors: Monitor[];
  metadata?: {
    page?: number;
    page_count?: number;
    per_page?: number;
    total_count?: number;
  };
}

interface MonitorStateHistory {
  status: string;
  to_ts: number;
  from_ts: number;
}

export const searchMonitors = defineTool<SearchMonitorsArgs, MonitorSearchResponse>({
  name: 'search_monitors',
  description: 'Search monitors by query. Critical for finding related alerts and understanding the alert landscape around an incident.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query using Datadog monitor search syntax (e.g., "service:api" or "tag:production")',
      },
      page: {
        type: 'number',
        description: 'Page number for pagination (default: 0)',
      },
      per_page: {
        type: 'number',
        description: 'Number of results per page (default: 30, max: 1000)',
      },
    },
    required: ['query'],
  },
  async run({ query, page = 0, per_page = 30 }, client) {
    const params = new URLSearchParams({
      query,
      page: String(page),
      per_page: String(per_page),
    });
    
    return await client.request<MonitorSearchResponse>(`/api/v1/monitor/search?${params}`);
  },
});

export const getMonitor = defineTool<GetMonitorArgs, Monitor>({
  name: 'get_monitor',
  description: 'Get detailed monitor information by ID. Essential for understanding alert configuration, thresholds, and query details.',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Monitor ID',
      },
    },
    required: ['id'],
  },
  async run({ id }, client) {
    return await client.request<Monitor>(`/api/v1/monitor/${id}`);
  },
});

export const getMonitorHistory = defineTool<GetMonitorHistoryArgs, MonitorStateHistory[]>({
  name: 'get_monitor_history',
  description: 'Get state history for a monitor - crucial for understanding incident timeline and patterns',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Monitor ID',
      },
      from_ts: {
        type: 'number',
        description: 'Start timestamp (Unix epoch in seconds)',
      },
      to_ts: {
        type: 'number',
        description: 'End timestamp (Unix epoch in seconds)',
      },
    },
    required: ['id', 'from_ts', 'to_ts'],
  },
  async run({ id, from_ts, to_ts }, client) {
    const params = new URLSearchParams({
      from_ts: String(from_ts),
      to_ts: String(to_ts),
    });
    
    return await client.request<MonitorStateHistory[]>(`/api/v1/monitor/${id}/state_history?${params}`);
  },
});

export const createMonitorTools = () => [
  searchMonitors,
  getMonitor,
  getMonitorHistory,
]; 