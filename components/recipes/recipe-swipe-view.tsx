"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Clock, Users, Sparkles, Info, AlertCircle, Loader2, Lock, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PremiumModal } from "@/components/premium-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMealSuggestions, MealSuggestion } from "@/hooks/useMealSuggestions"
import { useMealPlans } from "@/hooks/useMealPlans"
import { toast } from "@/hooks/use-toast"
import { useInventory } from "@/hooks/useInventory"
import { useAuth } from "@/contexts/auth-context"
import { useRealRecipes } from "@/hooks/useRealRecipes"
import { Recipe } from "@/lib/api/spoonacular"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CategoryBadge, getCategoryStyles } from "@/components/ui/category-badge"

// Current day function for adding meals - safe for server rendering
const getCurrentDay = () => {
  // Check if window is defined (client-side only)
  if (typeof window === 'undefined') return 'Monday'; // Default fallback for server
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Free tier swipe limit
const FREE_SWIPE_LIMIT = 5;

// Extended recipe type with real recipe data
interface ExtendedRecipe {
  id: string;
  name: string;
  description: string;
  cookTime: string;
  servings: number;
  image: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  matchPercentage: number;
  realRecipe?: Recipe;
}

export function RecipeSwipeView() {
  // Get user data for premium status check
  const { user } = useAuth();
  
  // For testing purposes, we're assuming the premium status is stored in metadata
  // In a real app, this would come from a user subscription table or user metadata
  const [localIsPremium, setLocalIsPremium] = useState(user?.user_metadata?.isPremium || false);
  
  // Get inventory items, meal suggestions and meal plans
  const { items: inventoryItems } = useInventory();
  const { suggestions, loading: suggestionsLoading, error: suggestionsError, fetchSuggestions } = useMealSuggestions();
  const { addMealPlan } = useMealPlans();
  const { findRecipe, loading: recipeLoading } = useRealRecipes();

  // State for dragging/swiping
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [swipeAnimation, setSwipeAnimation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [recipes, setRecipes] = useState<ExtendedRecipe[]>([]);
  const [findingRealRecipe, setFindingRealRecipe] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<ExtendedRecipe | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Check if user can swipe based on premium status and swipe count
  const canSwipe = localIsPremium || swipeCount < FREE_SWIPE_LIMIT;

  // Update local premium status when user status changes
  useEffect(() => {
    if (user?.user_metadata?.isPremium !== undefined) {
      setLocalIsPremium(user.user_metadata.isPremium);
    }
  }, [user]);

  // Fetch meal suggestions when component mounts or inventory changes
  useEffect(() => {
    if (inventoryItems.length > 0) {
      try {
        const fridgeItems = inventoryItems.map(item => item.item_name);
        fetchSuggestions(fridgeItems);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch meal suggestions"
        });
      }
    }
  }, [fetchSuggestions, inventoryItems, toast]);

  // Convert suggestions to recipes when suggestions change
  useEffect(() => {
    try {
      const convertedRecipes = suggestions.map(convertToRecipe);
      setRecipes(convertedRecipes);
    } catch (error) {
      console.error("Error converting suggestions to recipes:", error);
      // Don't show toast here as it would be distracting
    }
  }, [suggestions]);

  // Function to handle premium upgrade - now with proper error handling
  const handleUpgradeToPremium = async () => {
    setIsUpgrading(true);
    
    try {
      // In a real app, this would make an API call to your payment processor
      // and update the user's subscription status in your database
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local premium status
      setLocalIsPremium(true);
      
      // Reset swipe counter (optional for premium users, but good UX)
      setSwipeCount(0);
      
      // Show success message
      toast({
        title: "Premium Activated!",
        description: "You now have unlimited recipe swipes and premium features!",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to upgrade to premium:", error);
      
      toast({
        title: "Upgrade Failed",
        description: "There was an error processing your upgrade. Please try again.",
        variant: "destructive",
      });
      
      // Don't throw error here to prevent crashes
    } finally {
      setIsUpgrading(false);
    }
  };

  // Helper to convert meal suggestion to recipe display format
  const convertToRecipe = (suggestion: MealSuggestion): ExtendedRecipe => {
    return {
      id: suggestion.id || `recipe-${Math.random().toString(36).substring(2, 9)}`,
      name: suggestion.name || 'Unnamed Recipe', // Ensure name is not empty
      description: suggestion.description || 'No description available',
      cookTime: suggestion.preparationTime || "30 mins",
      servings: 4,
      image: suggestion.imageUrl || "/placeholder.svg?height=300&width=400",
      ingredients: suggestion.ingredients || [],
      instructions: suggestion.instructions || [],
      tags: ["AI Generated", "Based on your fridge"],
      matchPercentage: 85
    };
  };

  // Open the recipe details modal
  const openRecipeModal = (recipe: ExtendedRecipe) => {
    if (!recipe) return; // Safety check
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  // Mouse event handlers for swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSaving || !canSwipe) return; // Prevent dragging while saving or when limit reached
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isSaving) return;
    
    const newOffset = e.clientX - dragStartX;
    setDragOffset(newOffset);
  };

  const handleMouseUp = () => {
    if (!isDragging || isSaving) return;
    
    // Determine if the drag was far enough to count as a swipe
    const threshold = 100; // Minimum distance to count as a swipe
    
    if (dragOffset > threshold) {
      // Swiped right - like recipe
      handleSwipeRight();
    } else if (dragOffset < -threshold) {
      // Swiped left - dislike recipe
      handleSwipeLeft();
    } else {
      // Not enough to count as a swipe, reset position
      setDragOffset(0);
    }
    
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  // Find a real recipe for the given meal name
  const findRealRecipeForMeal = async (mealName: string, recipeIndex: number) => {
    if (!mealName || typeof mealName !== 'string' || mealName.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot search for recipe: meal name is empty"
      });
      return false;
    }
    
    setFindingRealRecipe(true);
    
    // Show a toast to indicate we're looking for a recipe match
    toast({
      title: "Looking for a real recipe match...",
      description: "Searching for matching recipes on Spoonacular."
    });
    
    try {
      const realRecipes = await findRecipe(mealName, { limit: 1 });
      
      if (realRecipes && realRecipes.length > 0) {
        // Update the recipe with the real recipe data
        setRecipes(currentRecipes => {
          const newRecipes = [...currentRecipes];
          if (recipeIndex >= 0 && recipeIndex < newRecipes.length) {
            newRecipes[recipeIndex] = {
              ...newRecipes[recipeIndex],
              realRecipe: realRecipes[0]
            };
          }
          return newRecipes;
        });
        
        toast({
          title: "Found a real recipe!",
          description: "We found a matching recipe from our database."
        });
        
        return true;
      } else {
        toast({
          title: "No real recipe found",
          description: "No matching recipe found — showing AI suggestion only."
        });
        
        return false;
      }
    } catch (error) {
      console.error("Error finding real recipe:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search for real recipes."
      });
      
      return false;
    } finally {
      setFindingRealRecipe(false);
    }
  };

  // Handle right swipe (accept recipe)
  const handleSwipeRight = async () => {
    try {
      if (recipes.length === 0 || currentIndex >= recipes.length || isSaving) return;
      
      // Check if user has reached free swipe limit
      if (!localIsPremium && swipeCount >= FREE_SWIPE_LIMIT) {
        setShowPremiumModal(true);
        return;
      }
      
      const currentRecipe = recipes[currentIndex];
      if (!currentRecipe || !currentRecipe.name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot save recipe: missing recipe data"
        });
        return;
      }
      
      const currentDay = getCurrentDay();
      
      // Start animation immediately for smooth user experience
      setSwipeAnimation("slide-right");
      setIsSaving(true);
      
      try {
        // Add the recipe to meal plans
        await addMealPlan({
          meal_name: currentRecipe.name,
          day_of_week: currentDay
        });

        toast({
          title: "Recipe saved!",
          description: `${currentRecipe.name} has been added to your meal plans for ${currentDay}.`,
        });
        
        // Find a real recipe for this meal after saving
        // Use Promise.catch to ensure this doesn't crash the app
        if (currentRecipe.name) {
          findRealRecipeForMeal(currentRecipe.name, currentIndex).catch(error => {
            console.error("Error in find real recipe:", error);
            // Error toast is already shown in the findRealRecipeForMeal function
          });
        }

        // Move to the next recipe
        setTimeout(() => {
          setCurrentIndex(prevIndex => {
            if (prevIndex + 1 >= recipes.length) {
              // Reached the end of suggestions
              return prevIndex;
            }
            return prevIndex + 1;
          });
          
          // Only increment swipe count for non-premium users
          if (!localIsPremium) {
            setSwipeCount(prev => prev + 1);
          }
          
          setDragOffset(0);
          setSwipeAnimation("");
          setIsSaving(false);
        }, 300);
      } catch (error) {
        console.error("Error saving recipe:", error);
        
        // Show error toast
        toast({
          variant: "destructive",
          title: "Failed to save recipe",
          description: `There was an error saving ${currentRecipe.name} to your meal plan. Please try again.`,
        });
        
        // Reset UI state
        setDragOffset(0);
        setSwipeAnimation("");
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Unexpected error in handleSwipeRight:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
      
      // Reset UI state
      setDragOffset(0);
      setSwipeAnimation("");
      setIsSaving(false);
    }
  };

  // Handle left swipe (reject recipe)
  const handleSwipeLeft = () => {
    try {
      if (recipes.length === 0 || currentIndex >= recipes.length || isSaving) return;
      
      // Check if user has reached free swipe limit
      if (!localIsPremium && swipeCount >= FREE_SWIPE_LIMIT) {
        setShowPremiumModal(true);
        return;
      }

      setSwipeAnimation("slide-left");
      
      // Move to the next recipe
      setTimeout(() => {
        setCurrentIndex(prevIndex => {
          if (prevIndex + 1 >= recipes.length) {
            // Reached the end of suggestions
            return prevIndex;
          }
          return prevIndex + 1;
        });
        
        // Only increment swipe count for non-premium users
        if (!localIsPremium) {
          setSwipeCount(prev => prev + 1);
        }
        
        setDragOffset(0);
        setSwipeAnimation("");
      }, 300);
    } catch (error) {
      console.error("Error in handleSwipeLeft:", error);
      setSwipeAnimation("");
      setDragOffset(0);
    }
  };

  // Handle previous button click
  const handlePreviousButton = () => {
    try {
      if (currentIndex <= 0 || isSaving) return;
      
      setCurrentIndex(prevIndex => prevIndex - 1);
    } catch (error) {
      console.error("Error in handlePreviousButton:", error);
    }
  };

  // Handle next button click
  const handleNextButton = () => {
    try {
      if (currentIndex >= recipes.length - 1 || isSaving) return;
      
      // Check swipe limit for free users
      if (!localIsPremium && swipeCount >= FREE_SWIPE_LIMIT) {
        setShowPremiumModal(true);
        return;
      }
      
      // Only increment swipe count for non-premium users
      if (!localIsPremium) {
        setSwipeCount(prev => prev + 1);
      }
      
      setCurrentIndex(prevIndex => prevIndex + 1);
    } catch (error) {
      console.error("Error in handleNextButton:", error);
    }
  };

  // Get current recipe with safety check
  const currentRecipe = recipes.length > 0 && currentIndex >= 0 && currentIndex < recipes.length 
    ? recipes[currentIndex] 
    : null;

  // Loading or error states
  if (suggestionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Creating Personalized Recipe Suggestions</h3>
        <p className="text-gray-500">
          We're analyzing your inventory to create recipe suggestions just for you...
        </p>
      </div>
    );
  }

  if (suggestionsError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-red-200 rounded-lg bg-red-50">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Recipes</h3>
        <p className="text-gray-700 mb-4">{suggestionsError.message}</p>
        <Button onClick={() => {
          try {
            if (inventoryItems && inventoryItems.length > 0) {
              const fridgeItems = inventoryItems.map(item => item.item_name);
              fetchSuggestions(fridgeItems);
            } else {
              toast({
                title: "No inventory items",
                description: "Please add items to your inventory first."
              });
            }
          } catch (error) {
            console.error("Error retrying suggestions:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to retry fetching suggestions."
            });
          }
        }}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Recipe Suggestions Available</h3>
        <p className="text-gray-500 mb-4">
          Add more items to your inventory to get personalized recipe suggestions.
        </p>
        <Button onClick={() => {
          try {
            // Using window location assignment in try-catch for safety
            if (typeof window !== 'undefined') {
              window.location.href = "/inventory";
            }
          } catch (error) {
            console.error("Error navigating to inventory:", error);
          }
        }}>
          Go to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      {/* Premium swipe limit warning */}
      {!localIsPremium && (
        <div className="w-full mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-amber-800 text-sm flex items-center justify-center">
            <Lock className="h-4 w-4 mr-1" />
            <span>Free tier: {swipeCount}/{FREE_SWIPE_LIMIT} recipe views used. </span>
            <button 
              className="ml-1 text-emerald-600 hover:text-emerald-700 font-medium" 
              onClick={() => setShowPremiumModal(true)}
            >
              Upgrade for unlimited
            </button>
          </p>
        </div>
      )}
      
      {/* Recipe card */}
      {currentRecipe && (
        <div className="w-full">
          <Card 
            ref={cardRef}
            className={`w-full overflow-hidden ${swipeAnimation} transition-transform`}
            style={{ 
              transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
              opacity: Math.max(0, 1 - Math.abs(dragOffset) / 500)
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Badge className="bg-purple-600 text-white">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Suggested Meal Idea
                </Badge>
                {currentRecipe.tags && currentRecipe.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {findingRealRecipe && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
                  <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
                    <p className="text-sm font-medium">Finding matching recipe...</p>
                  </div>
                </div>
              )}
              
              <div className="relative h-64 w-full">
                <Image
                  src={currentRecipe.realRecipe?.image || currentRecipe.image || "/placeholder.svg?height=300&width=400"}
                  alt={currentRecipe.name || "Recipe"}
                  fill
                  className="object-cover"
                />
                
                {currentRecipe.realRecipe && (
                  <div className="absolute bottom-0 right-0 m-3">
                    <Badge className="bg-blue-600 hover:bg-blue-700 px-3 py-1">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Real Recipe Found
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{currentRecipe.name}</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>This idea was generated by AI using your fridge contents</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {currentRecipe.realRecipe ? (
                <div className="flex justify-end mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-blue-600"
                    onClick={() => currentRecipe && openRecipeModal(currentRecipe)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Full Recipe
                  </Button>
                </div>
              ) : null}
              
              <p className="text-gray-600 mb-4">{currentRecipe.description}</p>
              
              <div className="flex justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{currentRecipe.cookTime}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">Serves {currentRecipe.servings}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Ingredients:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {currentRecipe.ingredients && currentRecipe.ingredients.slice(0, 5).map((ingredient, i) => {
                    // Extract the main ingredient name (everything before any comma, parenthesis, or numbers)
                    const mainIngredient = ingredient.split(/[,(\d]/)[0].trim();
                    const categoryStyle = getCategoryStyles(mainIngredient);
                    const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
                    const colorName = colorMatch ? colorMatch[1] : 'gray';
                    const borderClass = `border-l-2 border-${colorName}-300 pl-2`;
                    
                    return (
                      <li key={i} className={`text-sm text-gray-600 ${borderClass} rounded my-2`}>
                        <div className="flex items-center gap-1">
                          <span>{ingredient}</span>
                          <CategoryBadge category={mainIngredient} className="text-[10px] px-1.5 py-0 ml-1" />
                        </div>
                      </li>
                    );
                  })}
                  {currentRecipe.ingredients && currentRecipe.ingredients.length > 5 && (
                    <li className="text-sm text-gray-500 italic">
                      {currentRecipe.realRecipe 
                        ? <button onClick={() => currentRecipe && openRecipeModal(currentRecipe)} className="text-blue-600 hover:underline">
                            View all {currentRecipe.ingredients.length} ingredients
                          </button>
                        : <span>And {currentRecipe.ingredients.length - 5} more...</span>
                      }
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleSwipeLeft}
                        disabled={isSaving || findingRealRecipe}
                      >
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Skip this recipe</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handlePreviousButton}
                    disabled={currentIndex <= 0 || isSaving || findingRealRecipe}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleNextButton}
                    disabled={currentIndex >= recipes.length - 1 || isSaving || findingRealRecipe}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        size="icon" 
                        onClick={handleSwipeRight}
                        disabled={isSaving || findingRealRecipe}
                      >
                        {isSaving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save this recipe to your meal plan</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-4 text-sm text-gray-500">
            <p>Swipe right to save to meal plan, left to skip</p>
          </div>
        </div>
      )}
      
      {/* Premium subscription modal */}
      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        message="Upgrade to Premium for unlimited recipe swipes and personalized recommendations!"
        onUpgrade={handleUpgradeToPremium}
      />
      
      {/* Recipe details modal */}
      <Dialog open={showRecipeModal} onOpenChange={setShowRecipeModal}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRecipe?.realRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Spoonacular Recipe
                  </Badge>
                  {selectedRecipe.realRecipe.title}
                </DialogTitle>
                <DialogDescription className="flex items-center mt-2">
                  <Info className="h-4 w-4 mr-2 text-gray-500" />
                  Based on your AI-suggested meal: "{selectedRecipe.name}"
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                {selectedRecipe.realRecipe.image && (
                  <div className="mb-4 h-64 relative rounded-md overflow-hidden">
                    <Image 
                      src={selectedRecipe.realRecipe.image}
                      alt={selectedRecipe.realRecipe.title || "Recipe"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="flex justify-center gap-8 mb-6">
                  {selectedRecipe.realRecipe.readyInMinutes && (
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-100 p-2 rounded-full mb-1">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">Ready in</span>
                      <span className="font-medium">{selectedRecipe.realRecipe.readyInMinutes} min</span>
                    </div>
                  )}
                  
                  {selectedRecipe.realRecipe.servings && (
                    <div className="flex flex-col items-center">
                      <div className="bg-green-100 p-2 rounded-full mb-1">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">Serves</span>
                      <span className="font-medium">{selectedRecipe.realRecipe.servings}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Ingredients:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ingredient, i) => {
                      // Extract the main ingredient name (everything before any comma, parenthesis, or numbers)
                      const mainIngredient = ingredient.split(/[,(\d]/)[0].trim();
                      const categoryStyle = getCategoryStyles(mainIngredient);
                      const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
                      const colorName = colorMatch ? colorMatch[1] : 'gray';
                      const borderClass = `border-l-2 border-${colorName}-300 pl-2`;
                      
                      return (
                        <li key={i} className={`text-sm text-gray-600 ${borderClass} rounded my-2`}>
                          <div className="flex items-center gap-1">
                            <span>{ingredient}</span>
                            <CategoryBadge category={mainIngredient} className="text-[10px] px-1.5 py-0 ml-1" />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {selectedRecipe.instructions.map((step, i) => (
                        <li key={i} className="text-sm text-gray-600">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    Recipe provided by Spoonacular API. This is a match for your AI-suggested meal idea.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

