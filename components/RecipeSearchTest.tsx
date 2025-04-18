'use client'

import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { Recipe } from '@/lib/api/spoonacular'
import { useMealPlans, DAYS_OF_WEEK } from '@/hooks/useMealPlans'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { CalendarPlus, Clock, Users, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export function RecipeSearchTest() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [error, setError] = useState<{ message: string; details?: string; apiKeyInfo?: any } | null>(null)
  
  const { addMealPlan } = useMealPlans()
  const [isAddingToMealPlan, setIsAddingToMealPlan] = useState(false)
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a search term",
      })
      return
    }
    
    setIsLoading(true)
    setRecipes([])
    setError(null)
    
    try {
      const response = await fetch('/api/find-real-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mealName: searchTerm }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Special handling for API key configuration errors
        if (data.error === 'API key configuration error') {
          toast({
            variant: "destructive",
            title: "API Key Error",
            description: "The Spoonacular API key is not configured correctly.",
          })
          
          setError({
            message: data.error,
            details: data.details,
            apiKeyInfo: data.apiKeyInfo
          })
          
          console.error('API Key Error:', data)
          return
        }
        
        throw new Error(data.error || 'Failed to fetch recipes')
      }
      
      setRecipes(data)
      
      if (data.length === 0) {
        toast({
          title: "No results",
          description: `No recipes found for "${searchTerm}"`,
        })
      } else {
        toast({
          title: "Success",
          description: `Found ${data.length} recipes`,
        })
      }
    } catch (error) {
      console.error('Recipe search error:', error)
      setError({
        message: error instanceof Error ? error.message : 'Failed to search recipes'
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to search recipes',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToMealPlan = async (recipe: Recipe, day: string) => {
    setIsAddingToMealPlan(true)
    try {
      await addMealPlan({
        meal_name: recipe.title,
        day_of_week: day
      })
      
      toast({
        title: "Recipe Added",
        description: `Added "${recipe.title}" to ${day}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add recipe to meal plan",
      })
      console.error('Failed to add recipe to meal plan:', error)
    } finally {
      setIsAddingToMealPlan(false)
    }
  }
  
  const openRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsRecipeDialogOpen(true)
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-medium mb-4">Recipe Search</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a meal name (e.g., pasta, pizza, chicken)"
            className="flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 rounded">
          <h3 className="font-medium text-red-800">Error</h3>
          <p className="text-red-700">{error.message}</p>
          {error.details && <p className="text-red-700 text-sm">{error.details}</p>}
          {error.apiKeyInfo && (
            <div className="mt-2 text-sm text-red-700">
              <p>API Key Status:</p>
              <ul className="list-disc list-inside">
                <li>Length: {error.apiKeyInfo.length}</li>
                <li>First 5 chars: {error.apiKeyInfo.firstFive}</li>
                <li>Last 5 chars: {error.apiKeyInfo.lastFive}</li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      {recipes.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="border rounded overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {recipe.image && (
                  <div className="relative overflow-hidden h-48 cursor-pointer group" onClick={() => openRecipeDetails(recipe)}>
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                      <div className="bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium cursor-pointer hover:text-blue-600" onClick={() => openRecipeDetails(recipe)}>
                      {recipe.title}
                    </h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 ml-2 flex items-center gap-1"
                          disabled={isAddingToMealPlan}
                        >
                          <CalendarPlus className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:inline-block md:whitespace-nowrap">
                            Add to plan
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {DAYS_OF_WEEK.map(day => (
                          <DropdownMenuItem 
                            key={day}
                            onClick={() => handleAddToMealPlan(recipe, day)}
                          >
                            {day}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex mt-2 text-gray-600 text-sm">
                    {recipe.readyInMinutes && (
                      <div className="flex items-center mr-4">
                        <Clock className="h-3 w-3 mr-1" />
                        {recipe.readyInMinutes} min
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {recipe.servings} servings
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isLoading && !error && recipes.length === 0 && searchTerm && (
        <div className="text-center p-8 border border-dashed rounded">
          <p className="text-gray-500">No recipes found. Try a different search term.</p>
        </div>
      )}
      
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecipe.title}</DialogTitle>
                <DialogDescription>
                  Recipe ID: {selectedRecipe.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                {selectedRecipe.image && (
                  <img 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.title} 
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                )}
                
                <div className="flex gap-4 mb-4 justify-center">
                  {selectedRecipe.readyInMinutes && (
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-100 p-2 rounded-full mb-1">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">Ready in</span>
                      <span className="font-medium">{selectedRecipe.readyInMinutes} min</span>
                    </div>
                  )}
                  
                  {selectedRecipe.servings && (
                    <div className="flex flex-col items-center">
                      <div className="bg-green-100 p-2 rounded-full mb-1">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">Serves</span>
                      <span className="font-medium">{selectedRecipe.servings}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center mt-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="flex items-center gap-1"
                        disabled={isAddingToMealPlan}
                      >
                        <CalendarPlus className="h-4 w-4 mr-1" />
                        Add to Meal Plan
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      {DAYS_OF_WEEK.map(day => (
                        <DropdownMenuItem 
                          key={day}
                          onClick={() => {
                            handleAddToMealPlan(selectedRecipe, day)
                            setIsRecipeDialogOpen(false)
                          }}
                        >
                          {day}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 