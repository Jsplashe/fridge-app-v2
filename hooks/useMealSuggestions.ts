import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { HookError } from '@/lib/api/types'
import { ApiError, ErrorCode } from '@/lib/api/apiErrors'

/**
 * Type for a meal suggestion returned from the API
 * 
 * The API returns an array of these objects, each representing
 * a recipe suggestion based on the provided fridge items.
 */
export type MealSuggestion = {
  id?: string
  name: string
  description: string
  ingredients: string[]
  instructions?: string[]
  preparationTime?: string
  imageUrl?: string
}

/**
 * Custom hook for fetching meal suggestions based on fridge items
 * 
 * @example
 * ```tsx
 * const { suggestions, loading, error, fetchSuggestions } = useMealSuggestions();
 * 
 * // Call this when you want to get recipe suggestions
 * useEffect(() => {
 *   const fridgeItems = ['chicken', 'rice', 'broccoli'];
 *   fetchSuggestions(fridgeItems);
 * }, [fetchSuggestions]);
 * 
 * // Use the suggestions in your UI
 * if (loading) return <p>Loading...</p>;
 * if (error) return <p>Error: {error.message}</p>;
 * 
 * return (
 *   <div>
 *     {suggestions.map(suggestion => (
 *       <div key={suggestion.id}>
 *         <h2>{suggestion.name}</h2>
 *         <p>{suggestion.description}</p>
 *         <ul>
 *           {suggestion.ingredients.map(ingredient => (
 *             <li key={ingredient}>{ingredient}</li>
 *           ))}
 *         </ul>
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMealSuggestions() {
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<HookError>(null)

  /**
   * Fetch meal suggestions from the API
   * 
   * @param fridgeItems - Array of strings representing items in the fridge
   * @returns Promise resolving to an array of meal suggestions
   */
  const fetchSuggestions = useCallback(async (fridgeItems: string[]) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching meal suggestions with items:', fridgeItems);
      
      // Make API request to get meal suggestions
      const response = await fetch('/api/meal-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fridgeItems }),
      })

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch((parseError) => {
          console.error('Error parsing error response:', parseError);
          return { message: 'Failed to parse error response' };
        });
        
        console.error('API error response data:', errorData);
        
        throw new ApiError(
          errorData.error || 'Failed to fetch meal suggestions',
          errorData.code || ErrorCode.UNKNOWN_ERROR
        )
      }

      const data = await response.json().catch((parseError) => {
        console.error('Error parsing success response:', parseError);
        throw new Error('Failed to parse response from meal suggestions API');
      });
      
      console.log('API success response received:', data);
      
      setSuggestions(data)
      return data
    } catch (err) {
      console.error('Error fetching meal suggestions:', err);
      if (err instanceof Response) {
        console.error('Response error status:', err.status);
        try {
          const text = await err.text();
          console.error('Response error text:', text);
        } catch (textError) {
          console.error('Could not get error text:', textError);
        }
      }
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to fetch meal suggestions'
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        // Set specific error title based on error code
        switch(err.code) {
          case ErrorCode.AUTH_REQUIRED:
          case ErrorCode.UNAUTHORIZED:
            errorTitle = 'Authentication Error'
            break
          case ErrorCode.RESOURCE_NOT_FOUND:
            errorTitle = 'Not Found'
            break
          case ErrorCode.UNKNOWN_ERROR:
            errorTitle = 'API Error'
            break
          case ErrorCode.VALIDATION_ERROR:
            errorTitle = 'Validation Error'
            break
        }
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage))
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      })
      
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
  }
} 