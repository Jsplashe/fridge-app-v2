import { NextRequest, NextResponse } from 'next/server';
import { verifyOpenAISetup } from '@/lib/api/openai';

export async function GET() {
  try {
    const result = await verifyOpenAISetup();
    
    // Log environment variable (redacted for security)
    const apiKey = process.env.OPENAI_API_KEY || 'Not set';
    console.log('OpenAI API Key configured:', apiKey ? 'Yes (key exists)' : 'No');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('OpenAI Test API error:', error);
    
    return NextResponse.json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
} 