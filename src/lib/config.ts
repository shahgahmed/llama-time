export type AppConfig = {
  datadog: {
    apiKey: string;
    appKey: string;
    site: string;
  };
};

// Simple validation function
function validateEnv(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`${key} is required but not set`);
  }
  return value;
}

export function getConfig(): AppConfig {
  try {
    return {
      datadog: {
        apiKey: validateEnv('DATADOG_API_KEY', process.env.DATADOG_API_KEY),
        appKey: validateEnv('DATADOG_APP_KEY', process.env.DATADOG_APP_KEY),
        site: process.env.DATADOG_SITE || 'dd.datad0g.com',
      },
    };
  } catch (error) {
    console.error('Configuration error:', error);
    throw error;
  }
} 