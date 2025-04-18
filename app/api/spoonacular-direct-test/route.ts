import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Log environment variables for debugging
    console.log('Direct API ENV check:');
    const rapidApiKey = process.env.RAPIDAPI_KEY || '';
    console.log('- RAPIDAPI_KEY set:', rapidApiKey ? `Yes (length: ${rapidApiKey.length})` : 'No');
    console.log('- Key first 5 chars:', rapidApiKey.substring(0, 5));
    
    const rapidApiHost = process.env.RAPIDAPI_HOST || 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com';
    console.log('- RAPIDAPI_HOST:', rapidApiHost);
    
    // Simple direct API test
    const apiUrl = `https://${rapidApiHost}/recipes/complexSearch?query=pasta&number=1`;
    console.log('- Test URL:', apiUrl);
    
    // Make a direct API call without any helper functions
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost
      }
    });
    
    console.log('- Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('- Error response:', errorText);
      
      return NextResponse.json({
        success: false,
        message: `API call failed: ${response.statusText} (${response.status})`,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log('- Success response:', JSON.stringify(data).substring(0, 100) + '...');
    
    return NextResponse.json({
      success: true,
      message: `API call successful. Found ${data.results?.length || 0} recipes.`,
      data
    });
  } catch (error) {
    console.error('Direct API test error:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 