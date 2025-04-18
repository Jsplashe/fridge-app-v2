import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get environment variables (sanitized for security)
  const apiKey = process.env.RAPIDAPI_KEY || '';
  const apiKeyInfo = apiKey 
    ? {
        length: apiKey.length,
        firstFive: apiKey.substring(0, 5),
        lastFive: apiKey.substring(apiKey.length - 5)
      } 
    : 'Not set';
  
  const apiHost = process.env.RAPIDAPI_HOST || 'Not set';
  
  // Get all environment variables (sanitized)
  const envKeys = Object.keys(process.env).filter(key => 
    !key.includes('KEY') && !key.includes('SECRET') && !key.includes('PASSWORD')
  );
  
  return NextResponse.json({
    apiKeyInfo,
    apiHost,
    envKeys,
    nodeEnv: process.env.NODE_ENV,
    envFileLoaded: process.env.NEXT_PUBLIC_SUPABASE_URL ? true : false
  });
} 