'use client'

import { useState, FormEvent } from 'react'
import { useMealPlans, DAYS_OF_WEEK } from '@/hooks/useMealPlans'
import { MealPlan } from '@/lib/api/mealPlans'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { NewMealPlan } from '@/lib/api/types'
import { useRealRecipes } from '@/hooks/useRealRecipes'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Sparkles, Loader2, RefreshCw, Info, Plus, Trash2, Clock } from 'lucide-react'
import { CategoryBadge } from '@/components/ui/category-badge'
import { useInventory } from '@/hooks/useInventory'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from '@/components/ui/badge'
import { Recipe as BaseRecipe } from '@/lib/api/spoonacular'
import { Input } from "@/components/ui/input"

// Extend the Recipe type to include dishTypes
interface Recipe extends BaseRecipe {
  dishTypes?: string[];
}

// Initialize daily input state
const initialDailyInputs = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = '';
  return acc;
}, {} as Record<string, string>);

const initialDailySubmitting = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = false;
  return acc;
}, {} as Record<string, boolean>);

export default function MealPlanner() {
  const {
    meals,
    mealsByDay = {}, // Provide default empty object to avoid null errors
    loading,
    error,
    fetchMealPlans,
    addMealPlan,
    deleteMealPlan,
    clearMealsByDay
  } = useMealPlans()

  const { items: inventoryItems = [], loading: inventoryLoading } = useInventory() // Default to empty array
  const { recipes = [], loading: loadingRecipes, error: recipeError, findRecipe } = useRealRecipes()
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('')
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0])

  // Add state to track which day is currently being generated
  const [generatingDay, setGeneratingDay] = useState<string | null>(null)

  // State for daily manual inputs and submissions
  const [dailyNewMealInputs, setDailyNewMealInputs] = useState<Record<string, string>>(initialDailyInputs);
  const [dailySubmitting, setDailySubmitting] = useState<Record<string, boolean>>(initialDailySubmitting);

  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)
  const [realRecipeMatches, setRealRecipeMatches] = useState<Record<string, boolean>>({})

  // Function to generate meals for a specific day using AI
  const generateMealsForDay = async (day: string) => {
    // Check inventory first
    if (!inventoryItems || inventoryItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Fridge Empty",
        description: "You must have items in your fridge to generate a meal plan.",
      })
      return
    }

    setGeneratingDay(day)
    
    toast({
      title: "Generating Meals",
      description: `Generating meals for ${day}...`,
    })

    try {
      const fridgeItems = inventoryItems.map(item => item.item_name) // Extract item names
      
      const response = await fetch("/api/meal-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fridgeItems,
          mealCount: 3,
          mealTypes: ["breakfast", "lunch", "dinner"]
        }), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.statusText} - ${errorData?.error || 'Unknown error'}`);
      }

      const mealSuggestions: { name: string }[] = await response.json();

      if (!Array.isArray(mealSuggestions) || mealSuggestions.length < 3) {
        console.warn("API returned fewer than 3 meal suggestions:", mealSuggestions);
        while (mealSuggestions.length < 3) {
          mealSuggestions.push({ name: "AI Placeholder Meal" });
        }
      }

      // Clear existing meals for the day BEFORE adding new ones
      await clearMealsByDay(day);

      // Add the three meal suggestions to the day
      for (let i = 0; i < 3; i++) {
        const mealType = i === 0 ? "Breakfast" : i === 1 ? "Lunch" : "Dinner";
        const newGeneratedMeal: NewMealPlan = {
            meal_name: `${mealSuggestions[i].name} (${mealType})`,
            day_of_week: day
        };
        await addMealPlan(newGeneratedMeal);
         // Assume AI generated meals don't have a real recipe match initially
        setRealRecipeMatches(prev => ({
          ...prev,
          [newGeneratedMeal.meal_name]: false
        }));
      }

      toast({
        title: "Success!",
        description: `Meals generated for ${day}!`,
      });

    } catch (error) {
      console.error("Error generating meals for day:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Something went wrong generating your meals.",
      });
    } finally {
      setGeneratingDay(null);
    }
  };

  // New handler for adding a meal manually to a specific day
  const handleAddMealManually = async (day: string, mealName: string) => {
    if (!day || !mealName) return; // Safety check
    
    const trimmedMealName = mealName.trim();

    // Basic Validation
    if (!trimmedMealName || trimmedMealName.length < 2) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Meal name must be at least 2 characters.",
      });
      return;
    }

    setDailySubmitting(prev => ({ ...prev, [day]: true }));

    try {
      const mealToAdd: NewMealPlan = {
        meal_name: trimmedMealName,
        day_of_week: day,
      };
      await addMealPlan(mealToAdd);

      // Check if this meal has a real recipe match
      const recipeMatches = await findRecipe(trimmedMealName, { limit: 1 });
      setRealRecipeMatches(prev => ({
        ...prev,
        [trimmedMealName]: recipeMatches && recipeMatches.length > 0,
      }));

      // Clear the input for that specific day
       setDailyNewMealInputs(prev => ({ ...prev, [day]: '' }));

      // Toast is handled in the useMealPlans hook on success
    } catch (err) {
      // Error toast is handled in the useMealPlans hook
      console.error(`Failed to add meal for ${day}:`, err);
    } finally {
      setDailySubmitting(prev => ({ ...prev, [day]: false }));
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchMealPlans()
      toast({
        title: "Refreshed",
        description: "Your meal plan has been refreshed.",
      })
    } catch (err) {
      // Error toast is handled in the hook
    }
  }

  const handleRecipeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeSearchTerm.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a recipe to search for"
      });
      return;
    }
    
    await findRecipe(recipeSearchTerm);
  };

  const handleAddRecipeToMealPlan = async (recipeName: string, day: string) => {
    // Safety checks
    if (!recipeName || !day) return;
    if (!dailySubmitting || dailySubmitting[day]) return;

    setDailySubmitting(prev => ({ ...prev, [day]: true }));
    try {
       const mealToAddFromRecipe: NewMealPlan = {
        meal_name: recipeName,
        day_of_week: day
      };
      await addMealPlan(mealToAddFromRecipe);

      // Mark as having a real recipe match
      setRealRecipeMatches(prev => ({
        ...prev,
        [recipeName]: true
      }));

      toast({
        title: "Recipe Added",
        description: `Added ${recipeName} to ${day}`
      });

      setIsRecipeDialogOpen(false); // Close dialog after adding
       setRecipeSearchTerm(''); // Clear search term
    } catch (err) {
      console.error('Failed to add recipe to meal plan:', err);
       // Error toast handled in hook
    } finally {
       setDailySubmitting(prev => ({ ...prev, [day]: false }));
    }
  };

  const openRecipeSearch = (day: string) => {
    if (!day) return; // Safety check
    setSelectedDay(day);
    setRecipeSearchTerm('');
    setIsRecipeDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
           <Skeleton className="h-8 w-1/3" />
           <Skeleton className="h-8 w-24" />
        </div>
         <div className="space-y-4">
           {DAYS_OF_WEEK.map((day) => (
            <Card key={day} className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                 <Skeleton className="h-6 w-1/4" />
                 <Skeleton className="h-8 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
           ))}
         </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded text-red-800">
        <h3 className="font-bold mb-2">Error Loading Meal Plans</h3>
        <p>{error.message}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Ensure mealsByDay is always an object, even if undefined from the hook
  const safelyAccessMealsByDay = mealsByDay || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meal Planner</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Refresh Meals
        </Button>
      </div>

      {/* This Week's Meal Plan Section - Row Based Layout */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          {DAYS_OF_WEEK.map((day) => (
            <Card key={day} className="shadow-sm w-full">
              <CardContent className="p-4 space-y-4">
                {/* Day Row Header */}
                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-lg font-semibold flex-shrink-0">{day}</h3>
                  <div className="flex items-center gap-2 flex-wrap flex-grow justify-end">
                     {/* Generate AI Meals Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateMealsForDay(day)}
                              disabled={generatingDay === day || inventoryLoading || !inventoryItems || inventoryItems.length === 0}
                              className="text-xs"
                            >
                              {generatingDay === day ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-1 h-3 w-3" />
                                  Generate AI Meals
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-xs">
                              Generates breakfast, lunch, dinner based on your fridge inventory using OpenAI. Replaces existing meals for the day.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                       {/* Recipe Search Button for the day */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRecipeSearch(day)}
                        title="Search for real recipes to add"
                        className="text-xs"
                      >
                        <Search className="mr-1 h-3 w-3" />
                        Add Recipe
                      </Button>
                      {/* Clear Day Button - Only show if there are meals for this day */}
                      {safelyAccessMealsByDay[day]?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearMealsByDay(day)}
                          className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          title={`Clear all meals for ${day}`}
                        >
                           <Trash2 className="mr-1 h-3 w-3" />
                          Clear Day
                        </Button>
                      )}
                  </div>
                </div>

                 {/* Manual Add Meal Form for the Day */}
                 <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddMealManually(day, dailyNewMealInputs[day] || '');
                    }}
                    className="flex items-center gap-2 w-full"
                  >
                    <Input
                      type="text"
                      placeholder="Type to add a meal manually..."
                      value={dailyNewMealInputs[day] || ''}
                      onChange={(e) => setDailyNewMealInputs(prev => ({ ...prev, [day]: e.target.value }))}
                      className="flex-grow text-sm"
                      disabled={dailySubmitting[day]}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={dailySubmitting[day] || (dailyNewMealInputs[day]?.trim().length || 0) < 2}
                      className="flex-shrink-0"
                    >
                      {dailySubmitting[day] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                         <Plus className="h-4 w-4" />
                      )}
                      <span className="ml-1">Add</span>
                    </Button>
                  </form>

                {/* Meal List for the Day */}
                {!safelyAccessMealsByDay[day] || safelyAccessMealsByDay[day]?.length === 0 ? (
                   <div className="p-4 text-center border border-dashed border-gray-300 rounded-md bg-gray-50">
                     <p className="text-sm text-gray-500">No meals planned yet</p>
                   </div>
                ) : (
                  <ul className="space-y-2 pt-2">
                    {safelyAccessMealsByDay[day]?.map((meal) => (
                      <li key={meal.id} className="text-sm p-2 border rounded flex items-center justify-between gap-2 hover:bg-gray-50">
                        <div className="flex items-center gap-2 min-w-0">
                           {/* Badge first for visual consistency */}
                           {realRecipeMatches[meal.meal_name] ? (
                              <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 flex-shrink-0">
                                <Search className="mr-1 h-2 w-2" />
                                Real Recipe
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                                <Sparkles className="mr-1 h-2 w-2" />
                                AI Suggestion
                              </Badge>
                            )}
                          <span className="font-medium truncate flex-grow min-w-0" title={meal.meal_name}>{meal.meal_name}</span>
                        </div>
                        <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => deleteMealPlan(meal.id)}
                           className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 flex-shrink-0"
                           title="Remove meal"
                         >
                           <Trash2 className="h-3 w-3" />
                         </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recipe Search Dialog (Modal) */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Recipes to Add to <span className='font-bold'>{selectedDay}</span></DialogTitle>
          </DialogHeader>
          <div className="my-4 space-y-4">
            {/* Search Form */}
            <form onSubmit={handleRecipeSearch} className="flex gap-2">
              <Input
                type="text"
                value={recipeSearchTerm}
                onChange={(e) => setRecipeSearchTerm(e.target.value)}
                placeholder="Search Spoonacular (e.g., chicken pasta, vegetable curry)"
                className="flex-1 p-2 text-sm border border-gray-300 rounded-md"
                disabled={loadingRecipes}
              />
              <Button type="submit" size="sm" disabled={loadingRecipes}>
                {loadingRecipes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-1">Search</span>
              </Button>
            </form>

             {/* Loading State */}
            {loadingRecipes && (
              <div className="text-center p-8">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Searching for recipes...</p>
              </div>
            )}

             {/* Error State */}
            {recipeError && (
              <div className="p-3 my-2 bg-red-50 text-red-700 rounded-md text-xs">
                <p className="font-semibold mb-1">Error searching Spoonacular:</p>
                <p>{recipeError.message}</p>
                 {recipeError.details && <p className="mt-1 italic">{recipeError.details}</p>}
              </div>
            )}

             {/* Empty State */}
            {!loadingRecipes && !recipeError && recipes.length === 0 && (
              <div className="text-center p-6 text-gray-500 text-sm italic">
                {recipeSearchTerm ? (
                  `No recipes found for "${recipeSearchTerm}". Try a different search.`
                ) : (
                  `Type a meal or ingredient to search for real recipes.`
                )}
              </div>
            )}

            {/* Results */}
             {recipes.length > 0 && !loadingRecipes && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                 <p className='text-sm font-medium text-gray-600 mb-2'>Found {recipes.length} recipes:</p>
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="border rounded-md overflow-hidden flex items-center gap-3 p-2 hover:bg-gray-50">
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                     <div className="flex-grow min-w-0">
                       <h4 className="font-medium text-sm truncate" title={recipe.title}>{recipe.title}</h4>
                       <div className="flex gap-1 mt-1 flex-wrap">
                          {(recipe as Recipe)?.dishTypes?.slice(0, 2).map((type: string, idx: number) => (
                            <CategoryBadge key={`${type}-${idx}`} category={type} className="text-[10px] px-1.5 py-0.5" />
                          ))}
                          {recipe?.readyInMinutes && (
                             <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                               <Clock className="mr-1 h-2.5 w-2.5" /> {recipe.readyInMinutes} min
                             </Badge>
                           )}
                        </div>
                     </div>
                    <Button
                      size="sm"
                      variant="outline"
                       className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs flex-shrink-0"
                      onClick={() => handleAddRecipeToMealPlan(recipe.title, selectedDay)}
                      disabled={!selectedDay || dailySubmitting[selectedDay]}
                    >
                       {dailySubmitting[selectedDay] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                       <span className="ml-1">Add</span>
                     </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
} 