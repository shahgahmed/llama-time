import { AppConfig } from './config';
import https from 'https';

export class DatadogClient {
  private baseUrl: string;

  constructor(private config: AppConfig) {
    this.baseUrl = `https://api.${this.config.datadog.site}`;
  }

  async request<T = unknown>(path: string, options?: RequestInit): Promise<T> {
    const url = new URL(path, this.baseUrl);
    
    // For internal Datadog (dd.datad0g.com), we need to handle self-signed certificates
    const isInternalDatadog = this.config.datadog.site === 'dd.datad0g.com';
    
    // Create custom headers
    const headers: Record<string, string> = {
      'DD-API-KEY': this.config.datadog.apiKey,
      'DD-APPLICATION-KEY': this.config.datadog.appKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Add any additional headers from options
    if (options?.headers) {
      const optHeaders = options.headers as Record<string, string>;
      Object.assign(headers, optHeaders);
    }

    try {
      let responseData: { ok: boolean; status: number; statusText: string; text: () => Promise<string>; json: () => Promise<unknown> };
      
      if (isInternalDatadog && typeof window === 'undefined') {
        // Server-side: Use Node's https module which allows us to ignore SSL
        // Import node-fetch dynamically for server-side
        const nodeFetch = (await import('node-fetch')).default;
        const agent = new https.Agent({
          rejectUnauthorized: false
        });

        // Convert body if it exists
        let body: string | undefined;
        if (options?.body) {
          body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }

        const response = await nodeFetch(url.toString(), {
          method: options?.method || 'GET',
          headers,
          body,
          agent,
        });

        responseData = response;
      } else {
        // Client-side or external Datadog: Use regular fetch
        const response = await fetch(url.toString(), {
          ...options,
          headers,
        });
        
        responseData = response;
      }
      
      if (!responseData.ok) {
        const errorBody = await responseData.text();
        throw new DatadogApiError(responseData.status, responseData.statusText, errorBody);
      }

      return await responseData.json() as T;
    } catch (error) {
      if (error instanceof DatadogApiError) {
        throw error;
      }
      
      // Provide more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Datadog API request failed:', {
        url: url.toString(),
        error: errorMessage,
        site: this.config.datadog.site,
      });
      
      throw new DatadogApiError(0, 'Network Error', errorMessage);
    }
  }
}

export class DatadogApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string
  ) {
    super(`Datadog API Error: ${status} ${statusText} - ${body}`);
    this.name = 'DatadogApiError';
  }
} 