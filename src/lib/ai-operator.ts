import { getConfig } from './config';
import { DatadogClient } from './datadog-client';
import { Monitor, Dashboard } from '@/types/datadog';
import { LlamaApiResponse } from '@/types/llama';

export class AIOperator {
  private datadogClient: DatadogClient;
  private llamaApiKey: string;

  constructor() {
    const config = getConfig();
    this.llamaApiKey = process.env.LLAMA_API_KEY || '';
    this.datadogClient = new DatadogClient(config);
  }

  async investigateAndCreateDashboard(monitorId: number): Promise<{
    investigation: string;
    dashboard?: Dashboard;
    error?: string;
  }> {
    try {
      // First, get the monitor details
      const monitor = await this.datadogClient.request<Monitor>(`/api/v1/monitor/${monitorId}`);
      
      // Generate a dashboard based on the monitor
      const dashboard = await this.generateDashboardFromMonitor(monitor);
      
      // Create investigation notes using Llama
      const investigationPrompt = `You are an expert Site Reliability Engineer investigating a firing monitor.

Monitor Details:
- Name: ${monitor.name}
- Type: ${monitor.type}
- Status: ${monitor.overall_state}
- Query: ${monitor.query}
- Message: ${monitor.message}
- Tags: ${monitor.tags.join(', ')}

Based on this monitor, provide:
1. A brief analysis of what this monitor is checking
2. Potential causes for why it might be firing
3. Recommended investigation steps
4. Key metrics to watch during recovery`;

      const llamaResponse = await this.callLlamaAPI(investigationPrompt);
      const investigationNotes = llamaResponse.completion_message?.content?.text || 'Unable to generate investigation notes';

      // Create the dashboard in Datadog
      const createdDashboard = await this.datadogClient.request<Dashboard>('/api/v1/dashboard', {
        method: 'POST',
        body: JSON.stringify(dashboard),
      });

      return {
        investigation: investigationNotes,
        dashboard: createdDashboard,
      };
    } catch (error) {
      console.error('Error in AI investigation:', error);
      return {
        investigation: 'Failed to complete investigation',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async callLlamaAPI(prompt: string): Promise<LlamaApiResponse> {
    const response = await fetch('https://api.llama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.llamaApiKey}`,
      },
      body: JSON.stringify({
        model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
        messages: [
          { 
            role: "system", 
            content: "You are an expert Site Reliability Engineer helping to investigate and resolve incidents."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Llama API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async generateDashboardFromMonitor(monitor: Monitor): Promise<Dashboard> {
    // Extract key information from the monitor
    const service = this.extractServiceFromMonitor(monitor);
    const timeRange = '1h'; // Default to last hour
    
    // Create a dashboard tailored to the monitor type
    const dashboard: Dashboard = {
      title: `Investigation: ${monitor.name}`,
      description: `Auto-generated dashboard for investigating monitor ${monitor.id}`,
      layout_type: 'ordered',
      widgets: [],
    };

    // Add monitor status widget
    dashboard.widgets.push({
      definition: {
        type: 'alert_graph',
        title: 'Monitor Status',
        alert_id: String(monitor.id),
        viz_type: 'timeseries',
        time: { live_span: timeRange },
      },
    });

    // Add widgets based on monitor type
    if (monitor.type === 'metric alert') {
      // Add the metric being monitored
      dashboard.widgets.push({
        definition: {
          type: 'timeseries',
          title: 'Monitored Metric',
          requests: [{
            q: monitor.query,
            display_type: 'line',
          }],
          time: { live_span: timeRange },
        },
      });
    }

    // Add log stream if there's a service
    if (service) {
      dashboard.widgets.push({
        definition: {
          type: 'log_stream',
          title: `Logs for ${service}`,
          query: `service:${service} status:error`,
          columns: ['timestamp', 'service', 'status', 'message'],
          show_date_column: true,
          show_message_column: true,
          message_display: 'expanded-md',
          time: { live_span: timeRange },
        },
      });

      // Add service metrics
      dashboard.widgets.push({
        definition: {
          type: 'timeseries',
          title: `${service} Request Rate`,
          requests: [{
            q: `sum:trace.servlet.request{service:${service}}.as_rate()`,
            display_type: 'bars',
          }],
          time: { live_span: timeRange },
        },
      });

      dashboard.widgets.push({
        definition: {
          type: 'timeseries',
          title: `${service} Error Rate`,
          requests: [{
            q: `sum:trace.servlet.request.errors{service:${service}}.as_rate() / sum:trace.servlet.request{service:${service}}.as_rate() * 100`,
            display_type: 'line',
            style: {
              palette: 'warm',
            },
          }],
          yaxis: {
            label: 'Error Rate (%)',
            include_zero: true,
          },
          time: { live_span: timeRange },
        },
      });

      dashboard.widgets.push({
        definition: {
          type: 'query_value',
          title: `${service} P99 Latency`,
          requests: [{
            q: `avg:trace.servlet.request.duration.99p{service:${service}}`,
            conditional_formats: [
              { comparator: '>', value: 1000, palette: 'red' },
              { comparator: '>', value: 500, palette: 'yellow' },
              { comparator: '<=', value: 500, palette: 'green' },
            ],
          }],
          autoscale: true,
          precision: 2,
          time: { live_span: timeRange },
        },
      });
    }

    // Add related monitors widget
    if (service || monitor.tags.length > 0) {
      const searchQuery = service ? `service:${service}` : monitor.tags[0];
      dashboard.widgets.push({
        definition: {
          type: 'note',
          content: `## Related Monitors

Search for monitors with query: \`${searchQuery}\`

This will help identify other potentially affected systems.`,
          background_color: 'yellow',
          font_size: '14',
          text_align: 'left',
          vertical_align: 'top',
          show_tick: true,
          tick_pos: '50%',
          tick_edge: 'left',
        },
      });
    }

    // Add investigation notes
    dashboard.widgets.push({
      definition: {
        type: 'note',
        content: `## Investigation Notes

**Monitor:** ${monitor.name}
**Type:** ${monitor.type}
**Status:** ${monitor.overall_state}
**Tags:** ${monitor.tags.join(', ')}

### Query
\`\`\`
${monitor.query}
\`\`\`

### Message
${monitor.message}

### Next Steps
1. Check the service logs for error patterns
2. Review recent deployments or changes
3. Verify downstream dependencies
4. Check resource utilization (CPU, memory, disk)`,
        background_color: 'gray',
        font_size: '14',
        text_align: 'left',
        vertical_align: 'top',
        show_tick: false,
      },
    });

    return dashboard;
  }

  private extractServiceFromMonitor(monitor: Monitor): string | null {
    // Try to extract service from tags
    const serviceTag = monitor.tags.find(tag => tag.startsWith('service:'));
    if (serviceTag) {
      return serviceTag.split(':')[1];
    }

    // Try to extract from query
    const serviceMatch = monitor.query.match(/service:([a-zA-Z0-9_-]+)/);
    if (serviceMatch) {
      return serviceMatch[1];
    }

    return null;
  }
} 