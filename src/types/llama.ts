export interface LlamaTextContent {
  type: 'text';
  text: string;
}

export interface LlamaImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

export type LlamaContent = LlamaTextContent | LlamaImageContent;

export interface LlamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | LlamaContent[];
}

export interface LlamaMetric {
  metric: string;
  value: number;
  unit: string;
}

export interface LlamaCompletionMessage {
  role: string;
  stop_reason: string;
  content: {
    type: string;
    text: string;
  };
}

export interface LlamaApiResponse {
  id: string;
  completion_message: LlamaCompletionMessage;
  metrics: LlamaMetric[];
}

export interface LlamaApiError {
  title: string;
  detail: string;
  status: number;
}

export interface ChatApiResponse {
  success: boolean;
  response: string;
  metrics: LlamaMetric[];
  id: string;
}

export interface ChatApiError {
  error: string;
  details?: LlamaApiError;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string; // base64 image data
  metrics?: Array<{
    metric: string;
    value: number;
    unit: string;
  }>;
} 