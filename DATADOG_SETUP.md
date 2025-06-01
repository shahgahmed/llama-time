# Datadog Monitor Viewer Setup

This application includes a Datadog Monitor Viewer that allows you to query monitor information using a monitor ID.

## Setup Instructions

### 1. Get Your Datadog API Keys

You'll need two keys from your internal Datadog instance:

1. **API Key**: 
   - Go to [https://dd.datad0g.com/organization-settings/api-keys](https://dd.datad0g.com/organization-settings/api-keys)
   - Click "New Key" if you don't have one
   - Copy the API key value

2. **Application Key**:
   - Go to [https://dd.datad0g.com/organization-settings/application-keys](https://dd.datad0g.com/organization-settings/application-keys)
   - Click "New Key" if you don't have one
   - Copy the Application key value

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```bash
# Datadog API Configuration
DATADOG_API_KEY=your_api_key_here
DATADOG_APP_KEY=your_application_key_here
DATADOG_SITE=dd.datad0g.com  # Internal Datadog system
```

Replace `your_api_key_here` and `your_application_key_here` with your actual keys.

### 3. Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
npm run dev
```

### 4. Using the Datadog Monitor Viewer

1. Navigate to `/datadog` in your application
2. Enter a valid Datadog monitor ID in the input field
3. Click "Fetch Monitor" to retrieve the monitor information
4. The page will display:
   - Monitor name and ID
   - Monitor type and status
   - Query configuration
   - Alert message
   - Associated tags
   - Creation date
   - Raw JSON data (expandable)

## Finding Monitor IDs

To find monitor IDs in your internal Datadog:

1. Go to [https://dd.datad0g.com/monitors/manage](https://dd.datad0g.com/monitors/manage)
2. Click on any monitor
3. The monitor ID will be in the URL: `https://dd.datad0g.com/monitors/{MONITOR_ID}`
4. You can also see the ID in the monitor details page

## API Endpoint

The application exposes an API endpoint at:

```
GET /api/datadog/monitor/[id]
```

This endpoint returns the full monitor data in JSON format.

## Troubleshooting

- **"Datadog API keys not configured" error**: Make sure you've created the `.env.local` file with both required keys
- **"Authentication failed" error**: Verify that your API keys are correct and have the necessary permissions
- **"Monitor not found" error**: Check that the monitor ID exists in your internal Datadog account

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API keys secure and rotate them regularly
- Consider implementing additional authentication for production use 