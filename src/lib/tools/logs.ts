import { defineTool } from './framework';
import { LogSearch } from '@/types/datadog';

interface SearchLogsArgs {
  query: string;
  from: string;
  to: string;
  limit?: number;
  sort?: 'timestamp' | '-timestamp';
}

export const searchLogs = defineTool<SearchLogsArgs, LogSearch>({
  name: 'search_logs',
  description: 'Search logs for error patterns and debugging information. Essential for root cause analysis during incidents.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Log search query (e.g., "service:api status:error" or "@http.status_code:>=500")',
      },
      from: {
        type: 'string',
        description: 'Start time (e.g., "now-1h" or ISO timestamp)',
      },
      to: {
        type: 'string',
        description: 'End time (e.g., "now" or ISO timestamp)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of log entries to return (default: 50, max: 1000)',
      },
      sort: {
        type: 'string',
        enum: ['timestamp', '-timestamp'],
        description: 'Sort order (default: "-timestamp" for newest first)',
      },
    },
    required: ['query', 'from', 'to'],
  },
  async run({ query, from, to, limit = 50, sort = '-timestamp' }, client) {
    const body = {
      filter: {
        query,
        from,
        to,
      },
      sort,
      page: {
        limit,
      },
    };
    
    return await client.request<LogSearch>('/api/v2/logs/events/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
});

export const createLogTools = () => [
  searchLogs,
]; 