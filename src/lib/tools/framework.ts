import { DatadogClient } from '../datadog-client';

export interface ToolDefinition<TArgs, TResult> {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  run: (args: TArgs, client: DatadogClient) => Promise<TResult>;
}

export class Tool<TArgs, TResult> {
  constructor(private definition: ToolDefinition<TArgs, TResult>) {}

  get name() {
    return this.definition.name;
  }

  get description() {
    return this.definition.description;
  }

  async invoke(args: TArgs, client: DatadogClient): Promise<TResult> {
    return await this.definition.run(args, client);
  }

  // Convert to OpenAI function calling format
  toChatCompletionTool() {
    return {
      type: 'function' as const,
      function: {
        name: this.definition.name,
        description: this.definition.description,
        parameters: this.definition.parameters,
      },
    };
  }
}

export function defineTool<TArgs, TResult>(
  definition: ToolDefinition<TArgs, TResult>
): Tool<TArgs, TResult> {
  return new Tool(definition);
}

export type Tools = Array<Tool<unknown, unknown>>; 