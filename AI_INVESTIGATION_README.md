# AI-Powered Monitor Investigation System

This system uses Llama AI to automatically investigate Datadog monitors and create bespoke dashboards for incident resolution. Dashboards are rendered within the application, allowing for custom visualizations and future integration with multiple observability platforms.

## Overview

When a monitor fires, SREs need to quickly understand:
- What's broken
- What's the impact
- How to fix it

This system automates the initial investigation by:
1. Analyzing the firing monitor
2. Understanding the context and dependencies
3. Creating a custom dashboard with real-time data from Datadog
4. Providing AI-generated investigation notes

## Key Features

- **In-App Dashboards**: Dashboards are rendered within the application using React components
- **Real-Time Data**: Widgets fetch live data from Datadog APIs
- **Custom Visualizations**: Full control over how data is displayed
- **Extensible**: Designed to support multiple data sources (Sentry, New Relic, etc.)

## Setup

### Prerequisites

1. **Datadog API Keys** (already configured if you followed DATADOG_SETUP.md)
   - API Key: For reading monitor data
   - Application Key: For accessing metrics and logs

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
   - Fetch monitor details from Datadog
   - Generate an AI analysis
   - Create a custom dashboard configuration
   - Display the dashboard with live data

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
    "id": "uuid-here",
    "title": "Investigation: High CPU Alert",
    "widgets": [...],
    "timeRange": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-01-01T01:00:00Z",
      "display": "Last 1 hour"
    }
  }
}
```

## Dashboard Components

The system creates dashboards with various widget types:

### 1. Alert Status Widget
- Shows current monitor status (OK, Alert, Warning, No Data)
- Displays when the alert was last triggered
- Includes the monitor message

### 2. Time Series Widgets
- Line charts, area charts, or bar charts
- Displays metrics over time
- Supports multiple series
- Auto-scaling and customizable axes

### 3. Metric Widgets
- Single value display with trend indicators
- Color-coded status based on thresholds
- Shows percentage change

### 4. Log Stream Widget
- Displays relevant log entries
- Filterable by service and severity
- Shows timestamps and expandable attributes

### 5. Markdown Widget
- Investigation notes and documentation
- Checklists and runbooks
- Formatted text with code blocks

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web UI        │────▶│   AI Operator   │────▶│  Datadog API    │
│   (React)       │     │   (Llama)       │     │ (dd.datad0g.com)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                        ┌─────────────────┐
│  Dashboard      │◀───────────────────────│   Widget Data   │
│  Components     │      Real-time data    │   Fetcher       │
└─────────────────┘                        └─────────────────┘
```

### Key Components

1. **AI Operator** (`src/lib/ai-operator.ts`)
   - Analyzes monitor configuration
   - Generates dashboard layout
   - Creates investigation notes

2. **Dashboard Viewer** (`src/components/DashboardViewer.tsx`)
   - Renders dashboard grid layout
   - Manages widget placement
   - Handles refresh operations

3. **Widget Components** (`src/components/widgets/`)
   - TimeseriesWidget: Charts for metrics over time
   - MetricWidget: Single value displays
   - LogsWidget: Log entry viewer
   - AlertStatusWidget: Monitor status display
   - MarkdownWidget: Rich text content

4. **Data Fetcher** (`src/app/api/dashboard/data/route.ts`)
   - Fetches real-time data from Datadog
   - Transforms data for visualization
   - Handles authentication and errors

## Widget Types

### Time Series Configuration
```typescript
{
  type: 'timeseries',
  query: 'avg:system.cpu.user{service:api}',
  lineType: 'line' | 'area' | 'bar',
  yAxisLabel: 'CPU %'
}
```

### Metric Configuration
```typescript
{
  type: 'metric',
  query: 'avg:custom.api.latency{*}',
  aggregation: 'avg',
  thresholds: {
    warning: 500,
    critical: 1000
  }
}
```

### Logs Configuration
```typescript
{
  type: 'logs',
  query: 'service:api status:error',
  limit: 50,
  showTimestamp: true
}
```

## Example Dashboard

When investigating a high CPU alert, the system might create:

1. **Alert Status** - Shows the monitor is in Alert state
2. **CPU Usage Chart** - Time series of CPU usage
3. **Error Logs** - Recent error messages from the service
4. **Request Rate** - Bar chart showing request volume
5. **Error Rate** - Line chart showing error percentage
6. **P99 Latency** - Single metric showing response time
7. **Investigation Notes** - Markdown with checklist and monitor details

## Extending the System

### Adding New Data Sources

1. Create a new client in `src/lib/`
2. Add new widget data fetchers
3. Update the data route to handle new sources
4. Configure source selection in widget configs

### Creating Custom Widgets

1. Create a new component in `src/components/widgets/`
2. Add the widget type to `src/types/dashboard.ts`
3. Update `DashboardViewer` to render the new widget
4. Add data fetching logic

### Custom Dashboard Templates

The AI operator can be extended to create different dashboard layouts based on:
- Monitor type (metric, log, synthetic, etc.)
- Service type (API, database, queue, etc.)
- Alert severity
- Team preferences

## Best Practices

1. **Monitor Tags**: Use consistent tags for better dashboard generation
2. **Query Optimization**: Keep widget queries efficient
3. **Time Ranges**: Adjust based on incident timeline
4. **Widget Layout**: Place most important widgets at the top

## Troubleshooting

### "Failed to fetch widget data"
- Check Datadog API keys have proper permissions
- Verify the query syntax is correct
- Check network connectivity to dd.datad0g.com

### Widgets show "No data available"
- Verify the time range includes data
- Check if the metric/log query returns results in Datadog
- Ensure service names and tags are correct

### Dashboard layout issues
- Clear browser cache
- Check browser console for errors
- Verify widget dimensions are valid

## Future Enhancements

- [x] Multi-source dashboards (Datadog + other platforms)
- [ ] Dashboard persistence and sharing
- [ ] Real-time data streaming
- [ ] Collaborative annotations
- [ ] Alert correlation across platforms
- [ ] Mobile-responsive layouts
- [ ] Export to PDF/image for reports 