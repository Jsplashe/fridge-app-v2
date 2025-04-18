import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/api/openai';

interface MealSuggestion {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions?: string[];
  preparationTime?: string;
  imageUrl?: string;
}

export async function POST(request: NextRequest) {
  console.log('Meal suggestions API route called');
  
  // Log environment variable (redacted for security)
  const apiKey = process.env.OPENAI_API_KEY || 'Not set';
  console.log('OpenAI API Key configured:', apiKey ? 'Yes (key length: ' + apiKey.length + ')' : 'No');
  
  try {
    // Parse the request body
    const body = await request.json().catch(error => {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid request body format');
    });
    
    console.log('Request body received:', JSON.stringify(body));
    
    const { fridgeItems, mealCount = 5, mealTypes = [] } = body;

    // Validate input
    if (!fridgeItems || !Array.isArray(fridgeItems) || fridgeItems.length === 0) {
      console.log('Validation failed: fridgeItems invalid', fridgeItems);
      return NextResponse.json(
        { error: 'fridgeItems must be a non-empty array of strings' },
        { status: 400 }
      );
    }

    // Create hardcoded meal suggestions for testing
    if (process.env.NODE_ENV === 'development' && fridgeItems.includes('test')) {
      console.log('Returning test meal suggestions');
      return NextResponse.json([{
        id: 'test-1',
        name: 'Test Chicken Rice Bowl',
        description: 'A simple test recipe with chicken and rice',
        ingredients: ['chicken', 'rice', 'vegetables'],
        preparationTime: '20 mins',
        instructions: ['Cook rice', 'Cook chicken', 'Combine and serve']
      }]);
    }

    // Create the prompt for OpenAI with specific output format instructions
    const systemPrompt = `You are a helpful culinary assistant that generates recipe ideas based on available ingredients.
Always respond with valid JSON that follows this exact structure:
[
  {
    "name": "Recipe Name",
    "description": "Brief description of the recipe",
    "ingredients": ["ingredient1", "ingredient2", "..."],
    "instructions": ["step1", "step2", "..."],
    "preparationTime": "30 mins"
  },
  ...more recipes
]
Your response must be a valid JSON array with ${mealCount} recipe objects.`;

    // Base user prompt
    let userPrompt = `I have these ingredients: ${fridgeItems.join(', ')}.`;
    
    // Add meal type specifications if provided
    if (mealTypes && mealTypes.length > 0) {
      userPrompt += `\nPlease suggest ${mealCount} meal ideas specifically for these meal types: ${mealTypes.join(', ')}.`;
      
      // Add specific instructions for breakfast, lunch, dinner if specified
      if (mealTypes.includes('breakfast')) {
        userPrompt += '\nFor breakfast, suggest appropriate morning meals.';
      }
      if (mealTypes.includes('lunch')) {
        userPrompt += '\nFor lunch, suggest lighter meals suitable for midday.';
      }
      if (mealTypes.includes('dinner')) {
        userPrompt += '\nFor dinner, suggest more substantial evening meals.';
      }
    } else {
      userPrompt += `\nPlease suggest ${mealCount} meal ideas I could make with some of these ingredients.`;
    }
    
    userPrompt += '\nReturn ONLY a JSON array containing the recipe objects.';

    console.log('Calling OpenAI API with prompt');

    // Call OpenAI API
    try {
      const completion = await createChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 1500
        }
      );

      console.log('OpenAI API response received');

      // Extract the response
      const responseContent = completion.choices[0]?.message?.content.trim();
      
      if (!responseContent) {
        console.error('No content in OpenAI response');
        throw new Error('No response content received from OpenAI');
      }

      // Parse the JSON response, handling any formatting issues
      let mealSuggestions: MealSuggestion[];
      try {
        console.log('Parsing OpenAI response');
        // Log first 100 chars of response for debugging
        console.log('Response preview:', responseContent.substring(0, 100) + '...');
        
        // Attempt to parse as-is first
        try {
          mealSuggestions = JSON.parse(responseContent);
        } catch (parseError) {
          // If direct parsing fails, try to extract JSON array
          console.log('Direct parsing failed, trying to extract JSON array');
          const jsonMatch = responseContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            mealSuggestions = JSON.parse(jsonMatch[0]);
          } else {
            // Try a more aggressive approach - look for array brackets
            const startBracket = responseContent.indexOf('[');
            const endBracket = responseContent.lastIndexOf(']');
            
            if (startBracket !== -1 && endBracket !== -1 && startBracket < endBracket) {
              const jsonContent = responseContent.substring(startBracket, endBracket + 1);
              mealSuggestions = JSON.parse(jsonContent);
            } else {
              throw new Error('Could not extract valid JSON array from response');
            }
          }
        }
        
        // If the result isn't an array, fail
        if (!Array.isArray(mealSuggestions)) {
          throw new Error('Parsed response is not an array');
        }
        
        console.log('Successfully parsed meal suggestions:', mealSuggestions.length);
      } catch (error) {
        console.error('Failed to parse OpenAI response:', error);
        console.log('Full response content:', responseContent);
        
        // Create emergency fallback suggestion in case of parsing failure
        mealSuggestions = [{
          id: `fallback-${Date.now()}-0`,
          name: "Simple " + fridgeItems[0].charAt(0).toUpperCase() + fridgeItems[0].slice(1) + " Dish",
          description: `A simple dish using ${fridgeItems[0]} with other basic ingredients.`,
          ingredients: [...fridgeItems],
          instructions: ["Combine ingredients", "Cook until done", "Serve hot"],
          preparationTime: "20 mins"
        }];
        
        console.log('Created fallback suggestion due to parsing error');
      }

      // Add unique IDs to each suggestion
      const suggestionsWithIds = mealSuggestions.map((suggestion, index) => ({
        ...suggestion,
        id: `meal-${Date.now()}-${index}`
      }));

      console.log('Returning meal suggestions:', suggestionsWithIds.length);
      
      // Return the suggestions
      return NextResponse.json(suggestionsWithIds);
    } catch (openaiError) {
      console.error('Error during OpenAI API call:', openaiError);
      throw openaiError;
    }
  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    
    // Determine appropriate error response
    if (error instanceof Error && error.message.includes('OpenAI API key')) {
      console.error('API key error detected');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured properly' },
        { status: 500 }
      );
    }
    
    if (error instanceof Error && error.message.includes('OpenAI API error')) {
      console.error('OpenAI API connection error detected');
      return NextResponse.json(
        { error: 'Failed to connect to OpenAI service: ' + error.message },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch meal suggestions: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 