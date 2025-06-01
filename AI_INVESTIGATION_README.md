# AI-Powered Monitor Investigation System

This system uses Llama AI to automatically investigate Datadog monitors and create bespoke dashboards for incident resolution.

## Overview

When a monitor fires, SREs need to quickly understand:
- What's broken
- What's the impact
- How to fix it

This system automates the initial investigation by:
1. Analyzing the firing monitor
2. Understanding the context and dependencies
3. Creating a custom dashboard with relevant metrics, logs, and visualizations
4. Providing AI-generated investigation notes

## Setup

### Prerequisites

1. **Datadog API Keys** (already configured if you followed DATADOG_SETUP.md)
   - API Key: For reading monitor data
   - Application Key: For creating dashboards

2. **Llama API Key** (already configured if the chat feature works)
   - Add to `.env.local`: `LLAMA_API_KEY=your_key_here`

### Environment Variables

Your `.env.local` should contain:
```bash
# Datadog API Configuration
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_app_key
DATADOG_SITE=dd.datad0g.com  # For internal Datadog system

# Llama API Configuration
LLAMA_API_KEY=your_llama_api_key
```

## Usage

### Via Web Interface

1. Navigate to `/investigate` in your application
2. Enter the Monitor ID of a firing alert
3. Click "Investigate & Create Dashboard"
4. The system will:
   - Fetch monitor details
   - Generate an AI analysis
   - Create a custom dashboard
   - Provide a link to view it in Datadog

### Via API

```bash
POST /api/investigate/monitor/{monitorId}
```

Example:
```bash
curl -X POST http://localhost:3000/api/investigate/monitor/12345678
```

Response:
```json
{
  "success": true,
  "investigation": "AI-generated investigation notes...",
  "dashboard": {
    "id": "abc-def-ghi",
    "title": "Investigation: High CPU Alert",
    "widgets": [...]
  },
  "dashboardUrl": "https://dd.datad0g.com/dashboard/abc-def-ghi"
}
```

## Generated Dashboard Components

The AI creates dashboards with:

### 1. Monitor Status Widget
- Shows the alert graph for the specific monitor
- Helps track when the issue started and if it's recovering

### 2. Metric Visualizations
- For metric alerts: displays the monitored metric
- Automatic time range selection based on incident timeline

### 3. Service-Specific Widgets (if applicable)
- **Error Logs**: Filtered for the affected service
- **Request Rate**: To understand traffic patterns
- **Error Rate**: To see the impact percentage
- **P99 Latency**: To monitor performance degradation

### 4. Investigation Notes
- Monitor configuration details
- AI-generated analysis
- Recommended next steps

### 5. Related Monitors
- Helps identify cascading failures
- Shows other potentially affected systems

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web UI/API    │────▶│   AI Operator   │────▶│  Datadog API    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                    (dd.datad0g.com)
                               ▼
                        ┌─────────────────┐
                        │   Llama API     │
                        └─────────────────┘
```

### Key Components

1. **AI Operator** (`src/lib/ai-operator.ts`)
   - Orchestrates the investigation process
   - Calls Llama API for analysis
   - Generates dashboard configuration

2. **Datadog Client** (`src/lib/datadog-client.ts`)
   - Handles API authentication
   - Provides typed requests to Datadog (internal system at dd.datad0g.com)

3. **Investigation Tools** (`src/lib/tools/`)
   - Monitor tools: Search and analyze monitors
   - Log tools: Query error patterns
   - Metric tools: Analyze performance data
   - Dashboard tools: Create visualizations

## Example Scenarios

### High CPU Alert
The system will create a dashboard with:
- CPU usage over time
- Process-level CPU breakdown
- Memory usage correlation
- Recent deployment markers

### API Error Rate Spike
The system will create a dashboard with:
- Error rate percentage
- Error log stream
- Request volume
- Response time distribution
- Upstream service health

### Database Connection Errors
The system will create a dashboard with:
- Connection pool metrics
- Query performance
- Database CPU/memory
- Slow query logs
- Connection error patterns

## Customization

You can extend the system by:

1. **Adding new widget types** in `generateDashboardFromMonitor()`
2. **Enhancing the AI prompt** for better analysis
3. **Creating monitor-type-specific templates**
4. **Adding more investigation tools**

## Best Practices

1. **Monitor Naming**: Use descriptive names with service tags
2. **Monitor Messages**: Include runbook links and context
3. **Tags**: Use consistent tagging (service, team, env)
4. **Time Ranges**: The system defaults to 1 hour, adjust as needed

## Troubleshooting

### "Datadog API keys not configured"
- Ensure your `.env.local` has both `DATADOG_API_KEY` and `DATADOG_APP_KEY`
- Restart your development server

### "Failed to create dashboard"
- Check your Application Key has dashboard creation permissions
- Verify the generated dashboard JSON is valid
- Ensure you're connecting to the correct internal Datadog instance (dd.datad0g.com)

### "Monitor not found"
- Ensure the monitor ID exists in your internal Datadog account
- Verify you're using the internal Datadog system (dd.datad0g.com)

## Future Enhancements

- [ ] Multi-monitor investigation (for related alerts)
- [ ] Automatic runbook generation
- [ ] Slack/PagerDuty integration
- [ ] Historical incident pattern matching
- [ ] Suggested remediation actions
- [ ] Dashboard templates by alert type 