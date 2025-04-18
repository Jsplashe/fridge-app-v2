"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Clock, Users, ChefHat, ThumbsUp, ThumbsDown, Sparkles, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useMealPlans, DAYS_OF_WEEK } from "@/hooks/useMealPlans"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

interface MealOfTheDayProps {
  onPremiumPrompt: (message: string) => void
}

export function MealOfTheDay({ onPremiumPrompt }: MealOfTheDayProps) {
  const router = useRouter()
  const { meals, mealsByDay, loading, error } = useMealPlans()
  const [todaysMeals, setTodaysMeals] = useState<any[]>([])
  const [currentDay, setCurrentDay] = useState<string>("")
  
  // Set today's day in a useEffect to avoid hydration mismatch
  useEffect(() => {
    // Get today's day name (e.g., "Monday")
    const today = new Date()
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1 // Convert to our index (Monday=0, Sunday=6)
    const todayName = DAYS_OF_WEEK[dayIndex]
    
    // Set current day for display
    setCurrentDay(today.toLocaleDateString('en-US', { weekday: 'long' }))
    
    if (mealsByDay) {
      // Get meals for today
      setTodaysMeals(mealsByDay[todayName] || [])
    }
  }, [mealsByDay])

  if (loading) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <ChefHat className="mr-2 h-5 w-5 text-emerald-600" />
                Meal of the Day
              </CardTitle>
              <CardDescription>Today's planned meals</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-[200px] md:h-[250px] w-full" />
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChefHat className="mr-2 h-5 w-5 text-emerald-600" />
            Meal of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">Error loading meal plans</p>
        </CardContent>
      </Card>
    )
  }

  // If no meals planned for today, show placeholder
  if (todaysMeals.length === 0) {
    return (
      <div onClick={() => router.push("/meal-planner")} className="cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <ChefHat className="mr-2 h-5 w-5 text-emerald-600" />
                No Meals Planned Today
              </CardTitle>
              <CardDescription>Plan your meals for better kitchen organization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No meals planned for today</h3>
            <p className="text-gray-500 mb-6">
              Planning your meals helps reduce food waste and makes grocery shopping easier.
            </p>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                router.push("/meal-planner");
              }}
              className="hover:bg-emerald-700 transition-colors"
            >
              Plan Meals
            </Button>
          </div>
        </CardContent>
      </div>
    )
  }

  // Display the first meal planned for today
  const featuredMeal = todaysMeals[0]

  return (
    <div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <ChefHat className="mr-2 h-5 w-5 text-emerald-600" />
              Today's Meal
            </CardTitle>
            <CardDescription>
              {todaysMeals.length > 1 
                ? `${todaysMeals.length} meals planned for today` 
                : 'Your planned meal for today'}
            </CardDescription>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800">
            {currentDay}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className="relative h-[200px] overflow-hidden rounded-md md:h-[250px] bg-gray-100 flex items-center justify-center group cursor-pointer"
            onClick={() => router.push("/meal-planner")}
          >
            <ChefHat className="h-16 w-16 text-gray-300 group-hover:text-emerald-400 transition-colors" />
            <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold hover:text-emerald-700 transition-colors cursor-pointer" onClick={() => router.push("/meal-planner")}>
              {featuredMeal.meal_name}
            </h3>
            <p className="mb-4 text-gray-600">
              {featuredMeal.description || "Enjoy your planned meal! Add recipe details by updating your meal plan."}
            </p>
            {todaysMeals.length > 1 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Other meals today:</h4>
                <ul className="space-y-1">
                  {todaysMeals.slice(1).map(meal => (
                    <li key={meal.id} className="text-sm text-gray-600 hover:text-emerald-700 transition-colors cursor-pointer px-2 py-1 hover:bg-emerald-50 rounded-md" onClick={() => router.push("/meal-planner")}>
                      • {meal.meal_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push("/meal-planner")}
          className="hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
        >
          View Meal Plan
        </Button>
        <Button 
          onClick={() => router.push("/recipes")}
          className="bg-emerald-600 hover:bg-emerald-700 transition-colors"
        >
          Browse Recipes
        </Button>
      </CardFooter>
    </div>
  )
}

