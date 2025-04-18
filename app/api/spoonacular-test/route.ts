import { NextRequest, NextResponse } from 'next/server';
import { searchRecipeByName, verifySpoonacularSetup } from '@/lib/api/spoonacular';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query') || 'pasta';
    
    // Log environment variables for debugging (redacted for security)
    console.log('API ENV check:');
    const rapidApiKey = process.env.RAPIDAPI_KEY || '';
    console.log('- RAPIDAPI_KEY set:', rapidApiKey ? `Yes (length: ${rapidApiKey.length})` : 'No');
    console.log('- RAPIDAPI_HOST:', process.env.RAPIDAPI_HOST || 'not set');
    
    // Check if we should just verify the API connection
    if (request.nextUrl.searchParams.get('verify') === 'true') {
      console.log('Performing API verification...');
      const result = await verifySpoonacularSetup();
      console.log('Verification result:', result);
      return NextResponse.json(result);
    }
    
    // Perform a recipe search
    const recipes = await searchRecipeByName(query, {
      limit: parseInt(request.nextUrl.searchParams.get('limit') || '10')
    });
    
    return NextResponse.json({
      success: true,
      query,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Spoonacular API test error:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 