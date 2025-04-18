import { RealRecipesDemo } from "@/components/RealRecipesDemo"
import MealPlanner from "@/components/MealPlanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Search, UtensilsCrossed, Sparkles } from "lucide-react"
import { RecipeSearchTest } from "@/components/RecipeSearchTest"
import { AISuggestions } from "@/components/AISuggestions"

export default function RecipesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container px-4 py-8 pb-20 md:pb-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Recipes</h1>
        
        <Tabs defaultValue="search" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="search" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              Find Recipes
            </TabsTrigger>
            <TabsTrigger value="ai-suggestions" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="meal-planner" className="flex items-center gap-1">
              <UtensilsCrossed className="h-4 w-4" />
              Meal Planner
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Search for real recipes using the Spoonacular API. Find recipes and add them directly to your meal plan.
              </p>
              <RecipeSearchTest />
            </div>
          </TabsContent>
          
          <TabsContent value="ai-suggestions">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Get AI-generated meal ideas based on the ingredients in your fridge. We'll try to find matching real recipes when possible.
              </p>
              <AISuggestions />
            </div>
          </TabsContent>
          
          <TabsContent value="meal-planner">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Meal Planner</h2>
                <p className="text-gray-600">
                  Plan your meals for the week. Click the search icon next to each day to find and add recipes.
                </p>
              </div>
              <MealPlanner />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

