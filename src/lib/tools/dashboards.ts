import { defineTool } from './framework';
import { Dashboard } from '@/types/datadog';

interface CreateDashboardArgs {
  dashboard: Dashboard;
}

interface GetDashboardArgs {
  id: string;
}

export const createDashboard = defineTool<CreateDashboardArgs, Dashboard>({
  name: 'create_dashboard',
  description: 'Create a new dashboard with custom widgets for incident investigation',
  parameters: {
    type: 'object',
    properties: {
      dashboard: {
        type: 'object',
        description: 'Dashboard configuration including title, widgets, and layout',
      },
    },
    required: ['dashboard'],
  },
  async run({ dashboard }, client) {
    return await client.request<Dashboard>('/api/v1/dashboard', {
      method: 'POST',
      body: JSON.stringify(dashboard),
    });
  },
});

export const getDashboard = defineTool<GetDashboardArgs, Dashboard>({
  name: 'get_dashboard',
  description: 'Get an existing dashboard by ID',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Dashboard ID',
      },
    },
    required: ['id'],
  },
  async run({ id }, client) {
    return await client.request<Dashboard>(`/api/v1/dashboard/${id}`);
  },
});

export const createDashboardTools = () => [
  createDashboard,
  getDashboard,
]; 