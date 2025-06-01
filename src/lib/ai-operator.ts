import { getConfig } from './config';
import { DatadogClient } from './datadog-client';
import { Monitor } from '@/types/datadog';
import { Dashboard, TimeRange, Widget } from '@/types/dashboard';
import { LlamaApiResponse } from '@/types/llama';
import { AIDashboardDesign, AIWidgetDesign } from '@/types/ai-dashboard';
import { v4 as uuidv4 } from 'uuid';

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
      
      // Use AI to design a bespoke dashboard
      const dashboardDesign = await this.designDashboardWithAI(monitor);
      
      // Generate the dashboard based on AI recommendations
      const dashboard = await this.createDashboardFromAIDesign(monitor, dashboardDesign);
      
      // Create investigation notes
      const investigationNotes = dashboardDesign.investigation || 'Investigation in progress...';

      return {
        investigation: investigationNotes,
        dashboard,
      };
    } catch (error) {
      console.error('Error in AI investigation:', error);
      return {
        investigation: 'Failed to complete investigation',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async designDashboardWithAI(monitor: Monitor): Promise<AIDashboardDesign> {
    const designPrompt = `You are an expert Site Reliability Engineer designing a dashboard to investigate a firing monitor.

Monitor Details:
- Name: ${monitor.name}
- Type: ${monitor.type}
- Status: ${monitor.overall_state}
- Query: ${monitor.query}
- Message: ${monitor.message}
- Tags: ${monitor.tags.join(', ')}

Available Widget Types:
1. timeseries - Line/area/bar charts for metrics over time
2. metric - Single value displays with trend indicators
3. logs - Log stream viewer with filtering
4. alert_status - Monitor status display
5. markdown - Rich text for notes and documentation

For each widget, you can specify:
- Query patterns (for metrics, logs)
- Visualization preferences (line vs bar chart, etc.)
- Size and position (width: 1-12, height: 1-4)
- Thresholds and alerts

Based on this monitor, design a dashboard that will help investigate the issue. Consider:
1. What metrics are most relevant to this alert?
2. What logs would help diagnose the problem?
3. What related systems should be monitored?
4. What's the best way to visualize each piece of data?

Respond with a JSON object containing:
{
  "investigation": "Brief analysis of the issue and investigation approach",
  "widgets": [
    {
      "type": "widget_type",
      "title": "Widget Title",
      "query": "datadog query string",
      "visualization": "specific viz type if applicable",
      "width": 4,
      "height": 2,
      "reasoning": "why this widget is important"
    }
  ],
  "layout_strategy": "how widgets should be arranged",
  "time_range": "recommended time range (e.g., '1h', '24h', '7d')"
}`;

    try {
      const response = await this.callLlamaAPI(designPrompt);
      const content = response.completion_message?.content?.text || '{}';
      
      // Try to parse the JSON response
      try {
        return JSON.parse(content);
      } catch {
        // If parsing fails, extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback to a default design
        return this.getDefaultDashboardDesign(monitor);
      }
    } catch (error) {
      console.error('Error getting AI dashboard design:', error);
      return this.getDefaultDashboardDesign(monitor);
    }
  }

  private async createDashboardFromAIDesign(monitor: Monitor, design: AIDashboardDesign): Promise<Dashboard> {
    const now = Date.now();
    const timeRangeMap: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '3h': 3 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '2d': 2 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };
    
    const rangeMs = timeRangeMap[design.time_range] || 60 * 60 * 1000;
    const fromTime = now - rangeMs;
    
    const timeRange: TimeRange = {
      from: new Date(fromTime),
      to: new Date(now),
      display: this.getTimeRangeDisplay(design.time_range || '1h'),
    };

    const dashboard: Dashboard = {
      id: uuidv4(),
      title: `AI Investigation: ${monitor.name}`,
      description: design.layout_strategy || `AI-designed dashboard for investigating monitor ${monitor.id}`,
      createdAt: new Date(),
      monitorId: monitor.id,
      widgets: [],
      timeRange,
    };

    // Always add the monitor status first
    dashboard.widgets.push({
      id: uuidv4(),
      type: 'alert_status',
      title: 'Monitor Status',
      layout: { x: 0, y: 0, width: 3, height: 2 },
      config: {
        type: 'alert_status',
        monitorId: monitor.id,
        dataSource: { type: 'datadog' },
      },
    });

    // Process AI-designed widgets with better layout logic
    let currentY = 0;
    let currentX = 3; // Start after the monitor status widget
    
    if (design.widgets && Array.isArray(design.widgets)) {
      design.widgets.forEach((widgetDesign: AIWidgetDesign) => {
        const widget = this.createWidgetFromDesign(widgetDesign, currentX, currentY);
        if (widget) {
          dashboard.widgets.push(widget);
          
          // Update position for next widget with better wrapping logic
          currentX += widget.layout.width;
          if (currentX >= 12) {
            currentX = 0;
            currentY = Math.max(currentY + 1, 2); // Move to next row, accounting for monitor status
          }
        }
      });
    }

    // Add investigation notes at the bottom with better positioning
    const maxY = Math.max(...dashboard.widgets.map(w => w.layout.y + w.layout.height), 3);
    dashboard.widgets.push({
      id: uuidv4(),
      type: 'markdown',
      title: 'Investigation Guide',
      layout: { x: 0, y: maxY, width: 12, height: 3 },
      config: {
        type: 'markdown',
        content: this.formatInvestigationNotes(monitor, design),
      },
    });

    return dashboard;
  }

  private createWidgetFromDesign(design: AIWidgetDesign, x: number, y: number): Widget | null {
    const id = uuidv4();
    
    // Better default sizing based on widget type
    let defaultWidth: number;
    let defaultHeight: number;
    
    switch (design.type) {
      case 'timeseries':
        defaultWidth = 6; // Charts need more space
        defaultHeight = 3;
        break;
      case 'metric':
        defaultWidth = 3; // Metrics are compact
        defaultHeight = 2;
        break;
      case 'logs':
        defaultWidth = 6; // Logs need width for readability
        defaultHeight = 4; // And height for multiple entries
        break;
      case 'markdown':
        defaultWidth = 6;
        defaultHeight = 3;
        break;
      default:
        defaultWidth = 4;
        defaultHeight = 2;
    }
    
    // Use design width/height if provided, otherwise use smart defaults
    const width = Math.min(design.width || defaultWidth, 12 - x);
    const height = design.height || defaultHeight;

    switch (design.type) {
      case 'timeseries':
        return {
          id,
          type: 'timeseries',
          title: design.title || 'Metric',
          layout: { x, y, width, height },
          config: {
            type: 'timeseries',
            query: design.query || 'system.cpu.user{*}',
            dataSource: { type: 'datadog' },
            lineType: this.getLineType(design.visualization),
            yAxisLabel: design.yAxisLabel,
            showLegend: true,
          },
        };

      case 'metric':
        return {
          id,
          type: 'metric',
          title: design.title || 'Metric Value',
          layout: { x, y, width, height },
          config: {
            type: 'metric',
            query: design.query || 'avg:system.cpu.user{*}',
            dataSource: { type: 'datadog' },
            aggregation: design.aggregation || 'avg',
            thresholds: design.thresholds,
          },
        };

      case 'logs':
        return {
          id,
          type: 'logs',
          title: design.title || 'Logs',
          layout: { x, y, width, height },
          config: {
            type: 'logs',
            query: design.query || 'status:error',
            dataSource: { type: 'datadog' },
            limit: design.limit || 50,
            showTimestamp: true,
            showService: true,
          },
        };

      case 'markdown':
        return {
          id,
          type: 'markdown',
          title: design.title || 'Notes',
          layout: { x, y, width, height },
          config: {
            type: 'markdown',
            content: design.content || design.reasoning || '',
          },
        };

      default:
        return null;
    }
  }

  private getLineType(visualization?: string): 'line' | 'area' | 'bar' {
    switch (visualization?.toLowerCase()) {
      case 'area':
        return 'area';
      case 'bar':
        return 'bar';
      default:
        return 'line';
    }
  }

  private getTimeRangeDisplay(range: string): string {
    const displays: Record<string, string> = {
      '1h': 'Last 1 hour',
      '3h': 'Last 3 hours',
      '6h': 'Last 6 hours',
      '12h': 'Last 12 hours',
      '24h': 'Last 24 hours',
      '2d': 'Last 2 days',
      '7d': 'Last 7 days',
    };
    return displays[range] || 'Last 1 hour';
  }

  private formatInvestigationNotes(monitor: Monitor, design: AIDashboardDesign): string {
    const serviceName = this.extractServiceFromMonitor(monitor);
    
    let notes = `# 🔍 Investigation Guide\n\n`;
    
    // Add AI analysis if available
    if (design.investigation && design.investigation !== "Using default dashboard template. AI analysis unavailable.") {
      notes += `## AI Analysis\n`;
      notes += `${design.investigation}\n\n`;
    }

    // Monitor summary
    notes += `## Monitor Overview\n\n`;
    notes += `**Monitor:** ${monitor.name}\n`;
    notes += `**Status:** \`${monitor.overall_state}\`\n`;
    notes += `**Type:** ${monitor.type}\n`;
    if (serviceName) {
      notes += `**Service:** ${serviceName}\n`;
    }
    notes += `**Query:** \`${monitor.query}\`\n\n`;

    // Alert details
    if (monitor.message) {
      notes += `**Alert Message:** ${monitor.message}\n\n`;
    }

    // Investigation steps based on monitor type and service
    notes += `## Investigation Steps\n\n`;
    
    if (monitor.type === 'metric alert') {
      notes += `### 1. Analyze Metric Trends\n`;
      notes += `- Check the main metric chart above for spikes or anomalies\n`;
      notes += `- Look for patterns in the time series data\n`;
      notes += `- Compare current values to historical baselines\n\n`;
    }

    if (serviceName) {
      notes += `### 2. Service Health Check\n`;
      notes += `- Review error rates and latency metrics\n`;
      notes += `- Check request volume for traffic spikes\n`;
      notes += `- Examine error logs for specific failure patterns\n\n`;
      
      notes += `### 3. Infrastructure Investigation\n`;
      notes += `- Verify CPU, memory, and disk usage\n`;
      notes += `- Check network connectivity and latency\n`;
      notes += `- Review recent deployments or configuration changes\n\n`;
    } else {
      notes += `### 2. System Investigation\n`;
      notes += `- Check related system metrics\n`;
      notes += `- Review application logs for errors\n`;
      notes += `- Verify infrastructure health\n\n`;
    }

    notes += `### 3. Root Cause Analysis\n`;
    notes += `- **Recent Changes:** Check for deployments, config updates, or infrastructure changes\n`;
    notes += `- **Dependencies:** Verify health of upstream and downstream services\n`;
    notes += `- **External Factors:** Consider third-party service issues, traffic spikes, or network problems\n`;
    notes += `- **Correlation:** Look for patterns with other alerts or incidents\n\n`;

    // Widget explanations
    if (design.widgets && design.widgets.length > 0) {
      notes += `## Dashboard Widgets\n\n`;
      design.widgets.forEach((widget: AIWidgetDesign) => {
        if (widget.reasoning) {
          notes += `**${widget.title}:** ${widget.reasoning}\n\n`;
        }
      });
    }

    // Action items
    notes += `## Action Items\n\n`;
    notes += `- [ ] Review all metrics above for anomalies\n`;
    notes += `- [ ] Check error logs for specific failure messages\n`;
    notes += `- [ ] Verify recent deployments or changes\n`;
    notes += `- [ ] Check dependencies and external services\n`;
    if (serviceName) {
      notes += `- [ ] Consider scaling ${serviceName} if needed\n`;
    }
    notes += `- [ ] Document findings and resolution steps\n\n`;

    // Quick links
    if (serviceName) {
      notes += `## Quick Links\n\n`;
      notes += `- [Service Logs](https://dd.datad0g.com/logs?query=service%3A${serviceName})\n`;
      notes += `- [APM Dashboard](https://dd.datad0g.com/apm/services/${serviceName})\n`;
      notes += `- [Infrastructure](https://dd.datad0g.com/infrastructure/map?filter=service%3A${serviceName})\n`;
    }

    return notes;
  }

  private getDefaultDashboardDesign(monitor: Monitor): AIDashboardDesign {
    // Extract service if possible
    const service = this.extractServiceFromMonitor(monitor);
    
    return {
      investigation: `This dashboard was generated to investigate **${monitor.name}** which is currently in **${monitor.overall_state}** state. The investigation focuses on the key metrics and logs that can help identify the root cause of this alert.`,
      widgets: [
        {
          type: "timeseries" as const,
          title: "Monitored Metric",
          query: monitor.query,
          width: 9,
          height: 3,
          reasoning: "Primary metric that triggered the alert. Look for spikes, drops, or unusual patterns that correlate with the alert timing."
        },
        ...(service ? [
          {
            type: "metric" as const,
            title: "Current Error Rate",
            query: `sum:trace.servlet.request{service:${service},resource_name:*,http.status_class:5xx}.as_rate()/sum:trace.servlet.request{service:${service},resource_name:*}.as_rate()*100`,
            width: 3,
            height: 2,
            reasoning: "Error percentage indicates service health. High error rates often correlate with performance alerts."
          },
          {
            type: "metric" as const,
            title: "P99 Latency",
            query: `p99:trace.servlet.request.duration{service:${service}}`,
            width: 3,
            height: 2,
            reasoning: "Response time performance. Increased latency can indicate resource constraints or downstream issues."
          },
          {
            type: "timeseries" as const,
            title: "Request Rate",
            query: `sum:trace.servlet.request{service:${service}}.as_rate()`,
            visualization: "bar",
            width: 6,
            height: 3,
            reasoning: "Traffic volume trends. Sudden spikes can cause resource exhaustion, while drops may indicate upstream failures."
          },
          {
            type: "logs" as const,
            title: `Error Logs - ${service}`,
            query: `service:${service} status:error`,
            width: 6,
            height: 4,
            reasoning: "Recent error messages provide specific details about failures. Look for patterns, stack traces, and error frequencies."
          }
        ] : [
          {
            type: "timeseries" as const,
            title: "System Metrics",
            query: "avg:system.cpu.user{*}",
            width: 6,
            height: 3,
            reasoning: "General system performance indicators. Useful when specific service metrics are not available."
          },
          {
            type: "logs" as const,
            title: "Error Logs",
            query: "status:error",
            width: 6,
            height: 4,
            reasoning: "System-wide error logs. Look for patterns and timestamps that correlate with the alert."
          }
        ]),
      ],
      layout_strategy: "Critical metrics at top for immediate assessment, followed by supporting data for detailed investigation",
      time_range: "1h"
    };
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
            content: "You are an expert Site Reliability Engineer helping to investigate and resolve incidents. Always respond with valid JSON when asked."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Llama API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
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