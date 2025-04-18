/**
 * Spoonacular API client
 * 
 * This module provides functions to interact with the Spoonacular API via RapidAPI
 */

import { ApiError, ErrorCode } from './apiErrors';

// API configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com';
const API_BASE_URL = `https://${RAPIDAPI_HOST}`;

// Check for API key
if (!RAPIDAPI_KEY) {
  console.warn('Missing RapidAPI key. The Spoonacular API will not function correctly.');
}

// Helper function to get headers for Spoonacular API
const getApiHeaders = () => {
  // Ensure we have a string, even if empty
  const apiKey = RAPIDAPI_KEY || '';
  
  return {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': RAPIDAPI_HOST
  };
};

// Recipe response type from Spoonacular API
interface SpoonacularRecipeSearchResponse {
  results: {
    id: number;
    title: string;
    image: string;
    imageType: string;
    readyInMinutes?: number;
    servings?: number;
  }[];
  offset: number;
  number: number;
  totalResults: number;
}

// Clean recipe type returned by our functions
export interface Recipe {
  id: string;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
}

/**
 * Search recipes by name/query
 * @param mealName The query to search for
 * @param options Optional parameters for the search
 * @returns Promise resolving to an array of recipes
 */
export async function searchRecipeByName(
  mealName: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<Recipe[]> {
  if (!RAPIDAPI_KEY) {
    throw new ApiError(
      'RapidAPI key is not configured. Please add RAPIDAPI_KEY to your .env.local file.',
      ErrorCode.UNAUTHORIZED
    );
  }

  if (!mealName || mealName.trim() === '') {
    throw new ApiError(
      'Meal name is required for recipe search',
      ErrorCode.VALIDATION_ERROR
    );
  }

  const limit = options?.limit || 10;
  const offset = options?.offset || 0;

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/recipes/complexSearch`);
    url.searchParams.append('query', mealName);
    url.searchParams.append('number', limit.toString());
    url.searchParams.append('offset', offset.toString());
    
    // Make the request to Spoonacular API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      let errorCode = ErrorCode.UNKNOWN_ERROR;
      if (response.status === 401 || response.status === 403) {
        errorCode = ErrorCode.UNAUTHORIZED;
      } else if (response.status === 404) {
        errorCode = ErrorCode.RESOURCE_NOT_FOUND;
      }
      
      throw new ApiError(
        errorData.message || `Failed to search recipes: ${response.statusText}`,
        errorCode,
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json() as SpoonacularRecipeSearchResponse;
    
    // Map the response to our clean Recipe type
    return data.results.map(recipe => ({
      id: recipe.id.toString(),
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings
    }));
  } catch (error) {
    // Handle fetch or parsing errors
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('Error searching recipes:', error);
    throw new ApiError(
      `Failed to search recipes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.UNKNOWN_ERROR,
      { originalError: error }
    );
  }
}

/**
 * Verify Spoonacular API setup with a simple test request
 * @returns A success message if verification passes
 */
export async function verifySpoonacularSetup(): Promise<{ success: boolean; message: string }> {
  try {
    // Log API configuration
    console.log('API setup verification:');
    console.log('- RAPIDAPI_KEY configured:', RAPIDAPI_KEY ? `Yes (length: ${RAPIDAPI_KEY.length})` : 'No');
    console.log('- RAPIDAPI_HOST:', RAPIDAPI_HOST);
    
    // Direct API test instead of using searchRecipeByName
    const url = new URL(`${API_BASE_URL}/recipes/complexSearch`);
    url.searchParams.append('query', 'pasta');
    url.searchParams.append('number', '1');
    
    console.log('- Test URL:', url.toString());
    
    try {
      // Make sure to properly structure the fetch call with a RequestInit object
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      });
      
      console.log('- Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('- Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.log('- Parsed error:', errorData);
          return {
            success: false,
            message: `API verification failed: ${errorData.message || 'Unknown error'}`
          };
        } catch (parseError) {
          return {
            success: false,
            message: `API verification failed: ${response.statusText} (${response.status})`
          };
        }
      }
      
      const data = await response.json();
      console.log('- Success response:', data);
      
      return {
        success: true,
        message: `API verification successful. Found ${data.results?.length || 0} recipes.`
      };
    } catch (fetchError) {
      console.error('- Fetch error:', fetchError);
      return {
        success: false,
        message: `API request failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
      };
    }
  } catch (error) {
    console.error('- Top level error:', error);
    return {
      success: false,
      message: `API verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get recipe details by ID
 * This is a placeholder for future expansion
 */
export async function getRecipeById(recipeId: string): Promise<any> {
  // This method would be implemented in a similar pattern to searchRecipeByName
  // It would fetch detailed information about a specific recipe by ID
  throw new ApiError('Method not implemented', ErrorCode.UNKNOWN_ERROR);
} 