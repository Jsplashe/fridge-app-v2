import { NextRequest, NextResponse } from 'next/server';
import { searchRecipeByName } from '@/lib/api/spoonacular';
import { ApiError, ErrorCode } from '@/lib/api/apiErrors';

export async function POST(request: NextRequest) {
  try {
    // Debug API key
    const apiKey = process.env.RAPIDAPI_KEY || '';
    console.log('API key check in find-real-recipes:');
    console.log('- RAPIDAPI_KEY configured:', apiKey ? `Yes (length: ${apiKey.length})` : 'No');
    if (apiKey) {
      console.log('- Key first 5 chars:', apiKey.substring(0, 5));
      console.log('- Key last 5 chars:', apiKey.substring(apiKey.length - 5));
    }
    
    // Parse the request body
    const body = await request.json().catch(error => {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid request body format');
    });
    
    console.log('Request body received:', JSON.stringify(body));
    
    const { mealName } = body;

    // Validate input
    if (!mealName || typeof mealName !== 'string' || !mealName.trim()) {
      console.log('Validation failed: mealName is required');
      return NextResponse.json(
        { error: 'mealName is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Optional parameters
    const limit = body.limit && !isNaN(Number(body.limit)) ? Number(body.limit) : 10;
    
    console.log(`Searching for recipes with mealName: "${mealName}", limit: ${limit}`);

    // Call Spoonacular API to search for recipes
    try {
      const recipes = await searchRecipeByName(mealName, { limit });
      
      console.log(`Found ${recipes.length} recipes for "${mealName}"`);
      
      return NextResponse.json(recipes);
    } catch (error) {
      console.error('Error searching for recipes:', error);
      
      // Handle specific API errors
      if (error instanceof ApiError) {
        if (error.code === ErrorCode.UNAUTHORIZED) {
          return NextResponse.json(
            { 
              error: 'API key configuration error', 
              details: error.message,
              apiKeyInfo: apiKey ? {
                length: apiKey.length,
                firstFive: apiKey.substring(0, 5),
                lastFive: apiKey.substring(apiKey.length - 5)
              } : 'No API key found'
            },
            { status: 500 }
          );
        }
        
        if (error.code === ErrorCode.VALIDATION_ERROR) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }
      }
      
      // Generic error response
      return NextResponse.json(
        { error: 'Failed to fetch recipes', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing find-real-recipes request:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 