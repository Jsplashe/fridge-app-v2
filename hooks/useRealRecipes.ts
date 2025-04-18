import { useState, useCallback } from 'react'
import { Recipe } from '@/lib/api/spoonacular'
import { toast } from '@/hooks/use-toast'

/**
 * Error interface for the useRealRecipes hook
 */
interface RealRecipesError {
  /** Error message */
  message: string;
  /** Additional error details */
  details?: string;
  /** API key information for troubleshooting */
  apiKeyInfo?: any;
}

/**
 * Options for the findRecipe function
 */
interface FindRecipeOptions {
  /** Maximum number of recipes to return */
  limit?: number;
}

/**
 * Hook for searching real recipes using the Spoonacular API
 * 
 * @returns Object containing recipes state, loading state, error state, and functions to find and clear recipes
 */
export function useRealRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<RealRecipesError | null>(null)

  /**
   * Search for recipes based on a meal name
   * 
   * @param mealName - The name of the meal to search for
   * @param options - Optional parameters like limit
   * @returns Promise resolving to an array of recipes
   */
  const findRecipe = useCallback(async (mealName: string, options?: FindRecipeOptions) => {
    if (!mealName?.trim()) {
      const error = new Error('Meal name is required')
      setError({ message: error.message })
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/find-real-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mealName, 
          ...(options?.limit ? { limit: options.limit } : {})
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Special handling for API key configuration errors
        if (data.error === 'API key configuration error') {
          const apiError = {
            message: data.error,
            details: data.details,
            apiKeyInfo: data.apiKeyInfo
          }
          
          setError(apiError)
          
          toast({
            variant: "destructive",
            title: "API Key Error",
            description: "The Spoonacular API key is not configured correctly.",
          })
          
          console.error('API Key Error:', data)
          return []
        }
        
        throw new Error(data.error || 'Failed to fetch recipes')
      }

      setRecipes(data)
      
      if (data.length === 0) {
        toast({
          title: "No results",
          description: `No recipes found for "${mealName}"`,
        })
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      
      setError({ message: errorMessage })
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
      
      console.error('Failed to find recipes:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Clear the recipes state
   */
  const clearRecipes = useCallback(() => {
    setRecipes([])
  }, [])

  return {
    recipes,
    loading,
    error,
    findRecipe,
    clearRecipes
  }
} 