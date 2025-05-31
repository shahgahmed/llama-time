import { NextRequest, NextResponse } from 'next/server';
import { LlamaContent } from '@/types/llama';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, image } = body;

    if (!message && !image) {
      return NextResponse.json(
        { error: 'Message or image is required' },
        { status: 400 }
      );
    }

    // Build content array for Llama API
    const content: LlamaContent[] = [];
    
    if (message) {
      content.push({
        type: 'text',
        text: message
      });
    }
    
    if (image) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${image}`
        }
      });
    }

    const llamaResponse = await fetch('https://api.llama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
        messages: [
          { role: "user", content: content }
        ]
      }),
    });

    if (!llamaResponse.ok) {
      const errorData = await llamaResponse.json();
      console.error('Llama API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from Llama API', details: errorData },
        { status: llamaResponse.status }
      );
    }

    const data = await llamaResponse.json();
    
    return NextResponse.json({
      success: true,
      response: data.completion_message?.content?.text || 'No response received',
      metrics: data.metrics || [],
      id: data.id
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 