"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChefHat, RefreshCw, Sparkles, MoreHorizontal, Edit, Plus, Loader2, Clock, Users, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventory } from "@/hooks/useInventory"
import { toast } from "@/hooks/use-toast"
import { CategoryBadge, getCategoryStyles } from "@/components/ui/category-badge"
import { useRealRecipes } from "@/hooks/useRealRecipes"
import { Recipe } from "@/lib/api/spoonacular"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface Meal {
  id: string
  name: string
  image: string
  type: "breakfast" | "lunch" | "dinner"
  tags: string[]
  // Spoonacular recipe data
  spoonacularMatch?: Recipe
  // Flag to track if we've attempted to match this meal
  matchAttempted?: boolean
  // Description from the real recipe
  description?: string
  // Preparation time from the real recipe
  readyInMinutes?: number
  // Servings from the real recipe
  servings?: number
}

interface DayPlan {
  date: string
  breakfast?: Meal
  lunch?: Meal
  dinner?: Meal
}

// Helper function to create placeholder meal object
const createPlaceholderMeal = (name: string, type: "breakfast" | "lunch" | "dinner"): Meal => {
  // Create type-specific placeholder images
  let placeholderImage = "/placeholder.svg?height=100&width=150";
  
  // Use different placeholder images based on meal type
  if (type === "breakfast") {
    placeholderImage = "/placeholder-breakfast.svg?height=100&width=150";
  } else if (type === "lunch") {
    placeholderImage = "/placeholder-lunch.svg?height=100&width=150";
  } else if (type === "dinner") {
    placeholderImage = "/placeholder-dinner.svg?height=100&width=150";
  }
  
  return {
    id: `meal-${Date.now()}-${Math.random()}`,
    name: name,
    image: placeholderImage,
    type: type,
    tags: ["AI Suggested"],
    matchAttempted: false,
  };
}

// Function to generate initial empty week plan
const generateInitialWeekPlan = (): DayPlan[] => {
  const startDate = new Date()
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    return {
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      breakfast: undefined,
      lunch: undefined,
      dinner: undefined,
    }
  })
}

export function MealPlannerView() {
  const [isLoading, setIsLoading] = useState(false)
  // Add state to track which day is currently being generated
  const [generatingDayIndex, setGeneratingDayIndex] = useState<number | null>(null)
  // Initialize with an empty plan structure
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>(generateInitialWeekPlan())
  const { items: inventoryItems, loading: inventoryLoading } = useInventory() // Get inventory items
  // Add Spoonacular recipe search hook
  const { findRecipe, loading: recipeLoading } = useRealRecipes()
  // Track meal recipe matching state
  const [matchingMealId, setMatchingMealId] = useState<string | null>(null)
  // Recipe dialog state
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false)
// Create a ref to track processed meal IDs
  const processedMealIdsRef = useRef(new Set<string>());
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)

  // Function to handle generating the meal plan
  const generateMealPlan = async () => {
    // Check inventory first
    if (!inventoryItems || inventoryItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Fridge Empty",
        description: "You must have items in your fridge to generate a meal plan.",
      })
      return
    }

    setIsLoading(true)
    toast({
      title: "Generating Plan",
      description: "Generating your weekly meal plan...",
    })

    try {
      const fridgeItems = inventoryItems.map(item => item.item_name) // Extract item names
      
      const response = await fetch("/api/meal-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fridgeItems }), // Send item names
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error details
        throw new Error(`API Error: ${response.statusText} - ${errorData?.error || 'Unknown error'}`);
      }

      const mealSuggestions: { name: string }[] = await response.json(); // Expecting array of objects with 'name'

      // Need at least 21 suggestions for a full week
      if (!Array.isArray(mealSuggestions) || mealSuggestions.length < 21) {
        console.warn("API returned fewer than 21 meal suggestions:", mealSuggestions);
        // Fill remaining slots with generic placeholders or handle as needed
        while (mealSuggestions.length < 21) {
          mealSuggestions.push({ name: "AI Placeholder Meal" });
        }
        // Consider showing a warning toast here as well
      }

      // Create a new week plan with the meal suggestions
      const newWeekPlan = generateInitialWeekPlan().map((day, dayIndex) => {
        const breakfastIndex = dayIndex * 3;
        const lunchIndex = dayIndex * 3 + 1;
        const dinnerIndex = dayIndex * 3 + 2;

        // Create meal objects
        const breakfast = mealSuggestions[breakfastIndex] 
          ? createPlaceholderMeal(mealSuggestions[breakfastIndex].name, "breakfast") 
          : undefined;
          
        const lunch = mealSuggestions[lunchIndex] 
          ? createPlaceholderMeal(mealSuggestions[lunchIndex].name, "lunch") 
          : undefined;
          
        const dinner = mealSuggestions[dinnerIndex] 
          ? createPlaceholderMeal(mealSuggestions[dinnerIndex].name, "dinner") 
          : undefined;

        return {
          ...day,
          breakfast,
          lunch,
          dinner
        };
      });

      setWeekPlan(newWeekPlan); // Update the state with the new plan

      toast({
        title: "Success!",
        description: "Meal plan generated with AI suggestions!",
      });

    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Something went wrong generating your meal plan.",
      });
      // Optionally reset weekPlan to initial state or keep old one
      // setWeekPlan(generateInitialWeekPlan()); 
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  // Add a new function to generate meals for a specific day
  const generateMealsForDay = async (dayIndex: number) => {
    // Check inventory first
    if (!inventoryItems || inventoryItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Fridge Empty",
        description: "You must have items in your fridge to generate a meal plan.",
      })
      return
    }

    setGeneratingDayIndex(dayIndex)
    
    toast({
      title: "Generating Meals",
      description: `Generating meals for ${formatDate(weekPlan[dayIndex].date)}...`,
    })

    try {
      const fridgeItems = inventoryItems.map(item => item.item_name) // Extract item names
      
      const response = await fetch("/api/meal-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fridgeItems,
          mealCount: 3, // Request only 3 meals for a single day
          mealTypes: ["breakfast", "lunch", "dinner"]
        }), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.statusText} - ${errorData?.error || 'Unknown error'}`);
      }

      const mealSuggestions: { name: string }[] = await response.json();

      // We need at least 3 meals for this day
      if (!Array.isArray(mealSuggestions) || mealSuggestions.length < 3) {
        console.warn("API returned fewer than 3 meal suggestions:", mealSuggestions);
        // Fill remaining slots with generic placeholders if needed
        while (mealSuggestions.length < 3) {
          mealSuggestions.push({ name: "AI Placeholder Meal" });
        }
      }

      // Create meals from suggestions
      const breakfast = createPlaceholderMeal(mealSuggestions[0].name, "breakfast");
      const lunch = createPlaceholderMeal(mealSuggestions[1].name, "lunch");
      const dinner = createPlaceholderMeal(mealSuggestions[2].name, "dinner");

      // Update only this day's meals in the week plan
      const updatedWeekPlan = [...weekPlan];
      updatedWeekPlan[dayIndex] = {
        ...updatedWeekPlan[dayIndex],
        breakfast,
        lunch,
        dinner
      };

      setWeekPlan(updatedWeekPlan);

      toast({
        title: "Success!",
        description: `Meals generated for ${formatDate(weekPlan[dayIndex].date)}!`,
      });

    } catch (error) {
      console.error("Error generating meals for day:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Something went wrong generating your meals.",
      });
    } finally {
      setGeneratingDayIndex(null);
    }
  };

  // Rename handleRefresh to handleGenerateWeeklyPlan for clarity
  const handleGenerateWeeklyPlan = () => {
     generateMealPlan(); // Call the new generation logic
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayName = dayNames[date.getDay()]

    const dateObj = new Date(dateString)
    if (dateObj.toDateString() === today.toDateString()) {
      return "Today"
    } else if (dateObj.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString()) {
      return "Tomorrow"
    } else {
      return dayName
    }
  }

  // Function to match a meal with a Spoonacular recipe
  const matchWithSpoonacularRecipe = async (meal: Meal, dayIndex: number, mealType: "breakfast" | "lunch" | "dinner") => {
    if (!meal || meal.matchAttempted) return;
    
    setMatchingMealId(meal.id);
    
    try {
      // Search for a recipe match
      const recipes = await findRecipe(meal.name, { limit: 1 });
      
      if (recipes.length > 0) {
        // Create a matched meal with recipe data
        const matchedMeal: Meal = {
          ...meal,
          spoonacularMatch: recipes[0],
          matchAttempted: true,
          image: recipes[0].image || meal.image,
          description: recipes[0].title,
          readyInMinutes: recipes[0].readyInMinutes,
          servings: recipes[0].servings,
          tags: [...meal.tags, "Spoonacular Match"]
        };
        
        // Update the meal in the week plan
        const updatedWeekPlan = [...weekPlan];
        updatedWeekPlan[dayIndex] = {
          ...updatedWeekPlan[dayIndex],
          [mealType]: matchedMeal
        };
        
        setWeekPlan(updatedWeekPlan);
        
        toast({
          title: "Recipe matched!",
          description: `Found a recipe for "${meal.name}".`,
        });
      } else {
        // No match found, mark as attempted
        const updatedMeal: Meal = {
          ...meal,
          matchAttempted: true
        };
        
        // Update the meal in the week plan
        const updatedWeekPlan = [...weekPlan];
        updatedWeekPlan[dayIndex] = {
          ...updatedWeekPlan[dayIndex],
          [mealType]: updatedMeal
        };
        
        setWeekPlan(updatedWeekPlan);
      }
    } catch (error) {
      console.error("Error matching recipe:", error);
      
      // Mark as attempted even on error
      const updatedMeal: Meal = {
        ...meal,
        matchAttempted: true
      };
      
      // Update the meal in the week plan
      const updatedWeekPlan = [...weekPlan];
      updatedWeekPlan[dayIndex] = {
        ...updatedWeekPlan[dayIndex],
        [mealType]: updatedMeal
      };
      
      setWeekPlan(updatedWeekPlan);
    } finally {
      setMatchingMealId(null);
    }
  };

  // Automatically try to match recipes when they're added
  useEffect(() => {
    // Create a ref to track processed meal IDs
    const processedMealIds = new Set<string>();
    
    const matchNewRecipes = async () => {
      // Flag to track if we've made any match attempts in this run
      let matchAttemptsMade = false;
      
      // Loop through the week plan
      for (let dayIndex = 0; dayIndex < weekPlan.length; dayIndex++) {
        const day = weekPlan[dayIndex];
        
        // Try to match each meal type if not already processed
        if (day.breakfast && !day.breakfast.matchAttempted && !processedMealIdsRef.current.has(day.breakfast.id)) {
          processedMealIdsRef.current.add(day.breakfast.id);
          await matchWithSpoonacularRecipe(day.breakfast, dayIndex, "breakfast");
          matchAttemptsMade = true;
        }
        
        if (day.lunch && !day.lunch.matchAttempted && !processedMealIdsRef.current.has(day.lunch.id)) {
          processedMealIdsRef.current.add(day.lunch.id);
          await matchWithSpoonacularRecipe(day.lunch, dayIndex, "lunch");
          matchAttemptsMade = true;
        }
        
        if (day.dinner && !day.dinner.matchAttempted && !processedMealIdsRef.current.has(day.dinner.id)) {
          processedMealIdsRef.current.add(day.dinner.id);
          await matchWithSpoonacularRecipe(day.dinner, dayIndex, "dinner");
          matchAttemptsMade = true;
        }
      }
      
      return matchAttemptsMade;
    };
    
    // Only run once on component mount
    matchNewRecipes();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Function to view recipe details
  const viewRecipeDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    setRecipeDialogOpen(true);
    
    // Only check for Spoonacular match if we haven't tried already and nothing else is being matched
    if (!meal.matchAttempted && !matchingMealId) {
      checkSpoonacularMatch(meal);
    }
  };
  
  // Passive function to check for Spoonacular matches when viewing recipes
  const checkSpoonacularMatch = async (meal: Meal) => {
    // Don't attempt if already attempted or currently matching another meal
    if (meal.matchAttempted || matchingMealId) return;
    
    setMatchingMealId(meal.id);
    
    try {
      // Find the meal in the week plan
      let foundDay = -1;
      let foundType: "breakfast" | "lunch" | "dinner" | null = null;
      
      // Look for the meal in the week plan
      weekPlan.forEach((day, dayIndex) => {
        if (day.breakfast?.id === meal.id) {
          foundDay = dayIndex;
          foundType = "breakfast";
        } else if (day.lunch?.id === meal.id) {
          foundDay = dayIndex;
          foundType = "lunch";
        } else if (day.dinner?.id === meal.id) {
          foundDay = dayIndex;
          foundType = "dinner";
        }
      });
      
      if (foundDay === -1 || !foundType) {
        console.warn("Could not find meal in week plan");
        return;
      }
      
      // Silently check for Spoonacular match
      const recipes = await findRecipe(meal.name, { limit: 1 });
      
      if (recipes.length > 0) {
        // Update meal with Spoonacular data
        const matchedMeal: Meal = {
          ...meal,
          spoonacularMatch: recipes[0],
          matchAttempted: true,
          image: recipes[0].image || meal.image,
          description: recipes[0].title,
          readyInMinutes: recipes[0].readyInMinutes,
          servings: recipes[0].servings,
          tags: [...meal.tags, "Spoonacular Match"]
        };
        
        // Update week plan
        const updatedWeekPlan = [...weekPlan];
        updatedWeekPlan[foundDay] = {
          ...updatedWeekPlan[foundDay],
          [foundType]: matchedMeal
        };
        
        setWeekPlan(updatedWeekPlan);
        
        // Also update the selected meal if this is the one being viewed
        if (selectedMeal && selectedMeal.id === meal.id) {
          setSelectedMeal(matchedMeal);
        }
      } else {
        // Mark as attempted with no match
        const updatedMeal: Meal = {
          ...meal,
          matchAttempted: true
        };
        
        // Update week plan
        const updatedWeekPlan = [...weekPlan];
        updatedWeekPlan[foundDay] = {
          ...updatedWeekPlan[foundDay],
          [foundType]: updatedMeal
        };
        
        setWeekPlan(updatedWeekPlan);
      }
    } catch (error) {
      console.error("Error checking Spoonacular match:", error);
    } finally {
      setMatchingMealId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Your AI-generated meal plan for the week</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Generated
          </Badge>
          <Button variant="outline" size="sm" onClick={handleGenerateWeeklyPlan} disabled={isLoading || inventoryLoading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Generating..." : "Regenerate"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Weekly Meal Plan
          </CardTitle>
          <CardDescription>Plan your meals for the week ahead</CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading || inventoryLoading) && (
            <div className="space-y-4">
              <div className="h-8 w-1/2 rounded bg-gray-200 animate-pulse"></div>
              <div className="h-64 w-full rounded bg-gray-200 animate-pulse"></div>
            </div>
          )}
          {!(isLoading || inventoryLoading) && (
            <Tabs defaultValue="week" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="week">Week View</TabsTrigger>
                <TabsTrigger value="day">Day View</TabsTrigger>
              </TabsList>

              <TabsContent value="week">
                <div className="space-y-4">
                  {weekPlan.map((day, dayIndex) => (
                    <Card key={day.date} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold">{formatDate(day.date)}</h3>
                            <Badge variant="outline" className="ml-2">{new Date(day.date).toLocaleDateString()}</Badge>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => generateMealsForDay(dayIndex)}
                            disabled={generatingDayIndex === dayIndex || isLoading || inventoryLoading}
                            title="Generate breakfast, lunch, and dinner for this day based on your fridge inventory"
                            className="whitespace-nowrap"
                          >
                            {generatingDayIndex === dayIndex ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-1 h-3 w-3" />
                                Generate for This Day
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:gap-4">
                            <div className="w-24 flex-shrink-0 font-medium mb-1 sm:mb-0">Breakfast</div>
                            <div className="flex-grow">
                              {renderMealCard("Breakfast", day.breakfast)}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:gap-4">
                            <div className="w-24 flex-shrink-0 font-medium mb-1 sm:mb-0">Lunch</div>
                            <div className="flex-grow">
                              {renderMealCard("Lunch", day.lunch)}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:gap-4">
                            <div className="w-24 flex-shrink-0 font-medium mb-1 sm:mb-0">Dinner</div>
                            <div className="flex-grow">
                              {renderMealCard("Dinner", day.dinner)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="day">
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">Today</h3>
                      <Badge variant="outline" className="ml-2">{new Date().toLocaleDateString()}</Badge>
                    </div>
                    
                    {/* Add Generate Meals for Today button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generateMealsForDay(0)}
                      disabled={generatingDayIndex === 0 || isLoading || inventoryLoading}
                      title="Generate breakfast, lunch, and dinner for today based on your fridge inventory"
                      className="whitespace-nowrap"
                    >
                      {generatingDayIndex === 0 ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1 h-4 w-4" />
                          Generate for Today
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {renderDetailedMealCard("Breakfast", weekPlan[0].breakfast)}
                    {renderDetailedMealCard("Lunch", weekPlan[0].lunch)}
                    {renderDetailedMealCard("Dinner", weekPlan[0].dinner)}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p>Meal suggestions powered by OpenAI • Based on your dietary preferences and fridge inventory</p>
          </div>
        </CardContent>
      </Card>

      {/* Recipe dialog */}
      <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedMeal.name}</DialogTitle>
                <DialogDescription>
                  {selectedMeal.spoonacularMatch ? (
                    <span className="flex items-center gap-1 text-sm text-emerald-600">
                      <ChefHat className="h-4 w-4" />
                      Spoonacular Recipe Match
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-blue-600">
                      <Sparkles className="h-4 w-4" />
                      AI Generated Recipe Suggestion
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {/* Recipe Image */}
                <div className="relative h-60 w-full overflow-hidden rounded-lg">
                  <Image
                    src={selectedMeal.image || "/placeholder.svg"}
                    alt={selectedMeal.name}
                    fill
                    className="object-cover"
                    style={{ backgroundColor: "#f3f4f6" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>

                {/* Recipe Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                  {selectedMeal.type && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="capitalize">
                        {selectedMeal.type}
                      </Badge>
                    </div>
                  )}
                  
                  {selectedMeal.readyInMinutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {selectedMeal.readyInMinutes} minutes
                    </div>
                  )}
                  
                  {selectedMeal.servings && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      {selectedMeal.servings} servings
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {selectedMeal.tags.map((tag) => (
                    <CategoryBadge key={tag} category={tag} />
                  ))}
                </div>

                {/* Description/Instructions */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-gray-700">
                      {selectedMeal.description || 
                       selectedMeal.spoonacularMatch?.title || 
                       "No description available for this recipe."}
                    </p>
                  </div>

                  {/* Info about Spoonacular */}
                  {selectedMeal.spoonacularMatch && (
                    <div className="rounded-md bg-blue-50 p-4 text-blue-800">
                      <p className="text-sm">
                        View complete recipe details including ingredients and instructions on Spoonacular.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-2 bg-white"
                        onClick={() => window.open(`https://spoonacular.com/recipes/${selectedMeal.spoonacularMatch?.id}`, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Recipe on Spoonacular
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  function renderMealCard(mealType: string, meal?: Meal) {
    if (!meal) {
      return (
        <div className="flex h-20 flex-col justify-center rounded-md border border-dashed p-2 text-center">
          <p className="text-xs text-gray-500">No meal planned</p>
          <Button variant="ghost" size="sm" className="mt-1">
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
      )
    }

    // Determine if this meal is currently being matched with a recipe
    const isMatching = matchingMealId === meal.id;

    // Determine category based on meal name to create consistent styling
    const categoryStyle = getCategoryStyles(meal.name);
    const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
    const colorName = colorMatch ? colorMatch[1] : 'gray';
    const borderClass = `border-l-4 border-${colorName}-300`;

    return (
      <div className={`relative rounded-md border p-3 ${borderClass} bg-white hover:shadow-md transition-shadow`}>
        <div className="flex items-start gap-3">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
            {isMatching ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Image 
                src={meal.image || "/placeholder.svg"} 
                alt={meal.name} 
                fill 
                className="object-cover" 
                style={{ backgroundColor: "#f3f4f6" }}
                onError={(e) => {
                  // Fallback for image load errors
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-gray-800">{meal.name}</p>
            
            {/* Recipe details */}
            {meal.spoonacularMatch && (
              <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-500">
                {meal.readyInMinutes && (
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {meal.readyInMinutes} min
                  </span>
                )}
                
                {meal.servings && (
                  <span className="flex items-center ml-2">
                    <Users className="mr-1 h-3 w-3" />
                    {meal.servings} servings
                  </span>
                )}
              </div>
            )}
            
            <div className="mt-1 flex flex-wrap gap-1">
              {/* AI Badge */}
              {!meal.spoonacularMatch && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0 border-emerald-200">
                  <Sparkles className="mr-1 h-2.5 w-2.5" />
                  AI Suggested
                </Badge>
              )}
              
              {/* Spoonacular Badge */}
              {meal.spoonacularMatch && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0 border-blue-200">
                  <ChefHat className="mr-1 h-2.5 w-2.5" />
                  Spoonacular Match
                </Badge>
              )}
              
              {/* Show meal tags */}
              {meal.tags.filter(tag => tag !== "AI Suggested" && tag !== "Spoonacular Match").slice(0, 1).map((tag) => (
                <CategoryBadge key={tag} category={tag} className="text-[10px] px-1.5 py-0" />
              ))}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => meal && viewRecipeDetails(meal)}>
                <ChefHat className="mr-2 h-4 w-4" />
                View Recipe
              </DropdownMenuItem>
              {meal.spoonacularMatch && (
                <DropdownMenuItem onClick={() => window.open(`https://spoonacular.com/recipes/${meal.spoonacularMatch?.id}`, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Spoonacular
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Change Meal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  function renderDetailedMealCard(mealType: string, meal?: Meal) {
    if (!meal) {
      return (
        <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
          <p className="text-lg font-medium">{mealType}</p>
          <p className="text-sm text-gray-500">No meal planned</p>
          <Button variant="outline" className="mt-2">
            <Plus className="mr-1 h-4 w-4" />
            Add Meal
          </Button>
        </div>
      )
    }

    // Determine if this meal is currently being matched with a recipe
    const isMatching = matchingMealId === meal.id;

    // Determine category based on meal name to create consistent styling
    const categoryStyle = getCategoryStyles(meal.name);
    const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
    const colorName = colorMatch ? colorMatch[1] : 'gray';
    const borderClass = `border-l-4 border-${colorName}-300`;

    return (
      <div className={`rounded-md border p-4 ${borderClass} bg-white hover:shadow-md transition-shadow`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-medium">{mealType}</h3>
          <Button variant="outline" size="sm">
            <Edit className="mr-1 h-4 w-4" />
            Change
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative h-32 overflow-hidden rounded-md md:col-span-1">
            {isMatching ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Image 
                src={meal.image || "/placeholder.svg"} 
                alt={meal.name} 
                fill 
                className="object-cover" 
                style={{ backgroundColor: "#f3f4f6" }}
                onError={(e) => {
                  // Fallback for image load errors
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            )}
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xl font-semibold">{meal.name}</h4>
            
            {/* Recipe info */}
            {meal.spoonacularMatch && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {meal.readyInMinutes && (
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {meal.readyInMinutes} minutes
                  </span>
                )}
                
                {meal.servings && (
                  <span className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {meal.servings} servings
                  </span>
                )}
              </div>
            )}
            
            <div className="my-2 flex flex-wrap gap-1">
              {/* AI Badge */}
              {!meal.spoonacularMatch && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Suggested
                </Badge>
              )}
              
              {/* Spoonacular Badge */}
              {meal.spoonacularMatch && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <ChefHat className="mr-1 h-3 w-3" />
                  Spoonacular Match
                </Badge>
              )}
              
              {/* Show meal tags */}
              {meal.tags.filter(tag => tag !== "AI Suggested" && tag !== "Spoonacular Match").map((tag) => (
                <CategoryBadge key={tag} category={tag} />
              ))}
            </div>
            
            <p className="text-sm text-gray-600">
              {meal.spoonacularMatch 
                ? `${meal.description || meal.spoonacularMatch.title}` 
                : "This meal was suggested by AI based on your dietary preferences and the ingredients in your fridge."}
            </p>
            
            <Button className="mt-3" onClick={() => meal && viewRecipeDetails(meal)}>
              <ChefHat className="mr-1 h-4 w-4" />
              View Full Recipe
            </Button>
            
            {meal.spoonacularMatch && (
              <Button 
                variant="outline" 
                className="mt-3 ml-2"
                onClick={() => window.open(`https://spoonacular.com/recipes/${meal.spoonacularMatch?.id}`, '_blank')}
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                Open in Spoonacular
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }
}

