'use client'

import { useState, useEffect } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { useRealRecipes } from '@/hooks/useRealRecipes'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChefHat, Loader2, AlertCircle, Sparkles, Clock, Users, Info } from 'lucide-react'

// Interface for AI-generated meal suggestions
interface MealSuggestion {
  id: string
  name: string
  description: string
  ingredients: string[]
  instructions?: string[]
  preparationTime?: string
  imageUrl?: string
}

// Interface for suggestions with recipe match status
interface EnhancedMealSuggestion extends MealSuggestion {
  recipeMatched: boolean
  recipeDetails?: any // Any recipe details from Spoonacular
  isCheckingRecipe: boolean
}

export function AISuggestions() {
  const { items: inventoryItems, loading: inventoryLoading } = useInventory()
  const { findRecipe } = useRealRecipes()
  const [suggestions, setSuggestions] = useState<EnhancedMealSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<EnhancedMealSuggestion | null>(null)

  // Generate meal suggestions based on inventory items
  const generateSuggestions = async () => {
    if (!inventoryItems || inventoryItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Inventory",
        description: "You need items in your inventory to generate meal suggestions.",
      })
      return
    }

    setIsGenerating(true)
    setSuggestions([])

    try {
      toast({
        title: "Generating Suggestions",
        description: "Analyzing your inventory to create meal ideas...",
      })

      // Extract item names from inventory
      const fridgeItems = inventoryItems.map(item => item.item_name)

      // Call the meal-suggestions API
      const response = await fetch('/api/meal-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fridgeItems }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate meal suggestions')
      }

      const mealSuggestions: MealSuggestion[] = await response.json()

      // Initialize enhanced suggestions with recipe match status as false
      const enhancedSuggestions = mealSuggestions.map(suggestion => ({
        ...suggestion,
        recipeMatched: false,
        isCheckingRecipe: false
      }))

      setSuggestions(enhancedSuggestions)

      toast({
        title: "Suggestions Ready",
        description: `Generated ${mealSuggestions.length} meal ideas from your inventory.`,
      })

      // For each suggestion, try to find a matching real recipe
      enhancedSuggestions.forEach((suggestion, index) => {
        findMatchingRecipe(suggestion, index)
      })
    } catch (error) {
      console.error('Error generating meal suggestions:', error)
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate meal suggestions',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Find a matching real recipe for a suggestion
  const findMatchingRecipe = async (suggestion: EnhancedMealSuggestion, index: number) => {
    try {
      // Update suggestion to show we're checking for recipes
      setSuggestions(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], isCheckingRecipe: true }
        return updated
      })

      // Try to find a real recipe match
      const recipes = await findRecipe(suggestion.name, { limit: 1 })

      // Update with recipe match result
      setSuggestions(prev => {
        const updated = [...prev]
        if (recipes && recipes.length > 0) {
          updated[index] = { 
            ...updated[index], 
            recipeMatched: true, 
            recipeDetails: recipes[0],
            isCheckingRecipe: false 
          }
        } else {
          updated[index] = { ...updated[index], recipeMatched: false, isCheckingRecipe: false }
        }
        return updated
      })
    } catch (error) {
      console.error(`Error finding recipe for ${suggestion.name}:`, error)
      // Update to show recipe matching failed
      setSuggestions(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], recipeMatched: false, isCheckingRecipe: false }
        return updated
      })
    }
  }

  // Open modal with suggestion details
  const viewSuggestionDetails = (suggestion: EnhancedMealSuggestion) => {
    setSelectedSuggestion(suggestion)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Meal Suggestions</h2>
          <p className="text-gray-600">Generate meal ideas based on what's in your fridge</p>
        </div>
        <Button 
          onClick={generateSuggestions} 
          disabled={isGenerating || inventoryLoading}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate Meal Ideas'}
        </Button>
      </div>

      {inventoryLoading && (
        <div className="p-8 border rounded-lg">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
          <p className="text-center mt-4 text-gray-500">Loading your inventory...</p>
        </div>
      )}

      {!inventoryLoading && inventoryItems.length === 0 && (
        <div className="p-8 border border-dashed rounded-lg">
          <div className="flex justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <p className="text-center mt-2 font-medium">Your inventory is empty</p>
          <p className="text-center mt-1 text-gray-500">
            Add some ingredients to your inventory first to generate meal suggestions.
          </p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg cursor-pointer hover:text-blue-600" onClick={() => viewSuggestionDetails(suggestion)}>
                    {suggestion.name}
                  </CardTitle>
                  <div>
                    {suggestion.isCheckingRecipe ? (
                      <Badge variant="outline" className="flex gap-1 items-center">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Checking...
                      </Badge>
                    ) : suggestion.recipeMatched ? (
                      <Badge className="bg-green-100 text-green-800">Recipe Found</Badge>
                    ) : (
                      <Badge variant="outline" className="flex gap-1 items-center">
                        <Sparkles className="h-3 w-3" />
                        AI only
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-1">
                  {suggestion.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-1">Main Ingredients:</h4>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.ingredients.slice(0, 5).map((ingredient, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                    {suggestion.ingredients.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{suggestion.ingredients.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
                {suggestion.preparationTime && (
                  <div className="flex items-center mt-3 text-xs text-gray-600">
                    <Clock className="h-3 w-3 mr-1" /> {suggestion.preparationTime}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant={suggestion.recipeMatched ? "default" : "secondary"} 
                  className="w-full flex items-center gap-2"
                  onClick={() => viewSuggestionDetails(suggestion)}
                >
                  {suggestion.recipeMatched ? (
                    <>
                      <ChefHat className="h-4 w-4" />
                      View Recipe
                    </>
                  ) : (
                    <>
                      <Info className="h-4 w-4" />
                      View Details
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {isGenerating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex gap-1 flex-wrap">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-16 rounded-full" />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedSuggestion && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle>{selectedSuggestion.name}</DialogTitle>
                  {selectedSuggestion.recipeMatched ? (
                    <Badge className="bg-green-100 text-green-800">Recipe Found</Badge>
                  ) : (
                    <Badge variant="outline" className="flex gap-1 items-center">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </Badge>
                  )}
                </div>
                <DialogDescription>{selectedSuggestion.description}</DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                {/* Show recipe image if available */}
                {selectedSuggestion.recipeMatched && selectedSuggestion.recipeDetails?.image && (
                  <div className="w-full h-48 relative overflow-hidden rounded-md">
                    <img 
                      src={selectedSuggestion.recipeDetails.image} 
                      alt={selectedSuggestion.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Recipe details section */}
                <div className="flex justify-center gap-8 my-4">
                  {selectedSuggestion.preparationTime && (
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-50 p-2 rounded-full mb-1">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-sm text-gray-600">Prep Time</span>
                      <span className="font-medium">{selectedSuggestion.preparationTime}</span>
                    </div>
                  )}
                  
                  {selectedSuggestion.recipeMatched && selectedSuggestion.recipeDetails?.servings && (
                    <div className="flex flex-col items-center">
                      <div className="bg-green-50 p-2 rounded-full mb-1">
                        <Users className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="text-sm text-gray-600">Servings</span>
                      <span className="font-medium">{selectedSuggestion.recipeDetails.servings}</span>
                    </div>
                  )}
                </div>
                
                {/* Ingredients section */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedSuggestion.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="text-gray-700">{ingredient}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Instructions section if available */}
                {selectedSuggestion.instructions && selectedSuggestion.instructions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2">
                      {selectedSuggestion.instructions.map((instruction, idx) => (
                        <li key={idx} className="text-gray-700">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {/* Source attribution for matched recipes */}
                {selectedSuggestion.recipeMatched && (
                  <div className="text-xs text-gray-500 mt-4">
                    Recipe information powered by Spoonacular API
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 