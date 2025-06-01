import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Datadog API configuration
const DATADOG_API_URL = 'https://dd.datad0g.com/api/v1';
const DD_API_KEY = process.env.DATADOG_API_KEY;
const DD_APP_KEY = process.env.DATADOG_APP_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if API keys are configured
    if (!DD_API_KEY || !DD_APP_KEY) {
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

    // Make request to Datadog API
    const response = await axios.get(
      `${DATADOG_API_URL}/monitor/${id}`,
      {
        headers: {
          'DD-API-KEY': DD_API_KEY,
          'DD-APPLICATION-KEY': DD_APP_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return the monitor data
    return NextResponse.json(response.data);

  } catch (error) {
    console.error('Error fetching monitor from Datadog:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle specific Datadog API errors
      if (error.response?.status === 404) {
        return NextResponse.json(
          { error: 'Monitor not found' },
          { status: 404 }
        );
      } else if (error.response?.status === 403) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check your API keys.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.response?.data?.errors || 'Failed to fetch monitor data' },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 