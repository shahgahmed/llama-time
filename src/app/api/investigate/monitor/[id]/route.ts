import { NextRequest, NextResponse } from 'next/server';
import { AIOperator } from '@/lib/ai-operator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if Llama API key is configured
    if (!process.env.LLAMA_API_KEY) {
      return NextResponse.json(
        { error: 'Llama API key not configured. Please set LLAMA_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Check if Datadog API keys are configured
    if (!process.env.DATADOG_API_KEY || !process.env.DATADOG_APP_KEY) {
      return NextResponse.json(
        { error: 'Datadog API keys not configured. Please set DATADOG_API_KEY and DATADOG_APP_KEY environment variables.' },
        { status: 500 }
      );
    }

    // Get the monitor ID from the route parameter
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Monitor ID is required' },
        { status: 400 }
      );
    }

    const monitorId = parseInt(id, 10);
    if (isNaN(monitorId)) {
      return NextResponse.json(
        { error: 'Monitor ID must be a number' },
        { status: 400 }
      );
    }

    // Create AI operator and investigate
    const aiOperator = new AIOperator();
    const result = await aiOperator.investigateAndCreateDashboard(monitorId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      investigation: result.investigation,
      dashboard: result.dashboard,
    });

  } catch (error) {
    console.error('Error investigating monitor:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 