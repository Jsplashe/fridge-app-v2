"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle, ShoppingCart, ChefHat, Calendar, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DemoSuccessView() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Welcome to FRiDGE!</h1>
        <p className="mt-2 text-xl text-gray-600">You're now viewing FRiDGE as a demo user.</p>
      </div>

      <Alert className="mb-8 border-emerald-200 bg-emerald-50">
        <AlertTitle className="text-emerald-800">Demo Account Active</AlertTitle>
        <AlertDescription className="text-emerald-700">
          This is a demo account with pre-populated data. Feel free to explore all features without affecting real data.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1" />
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-emerald-500" />
              See Smart Inventory
            </CardTitle>
            <CardDescription>Explore how FRiDGE tracks your food items and expiry dates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The smart inventory system automatically categorizes your food items and alerts you about expiring
              products.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              View Inventory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-1" />
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChefHat className="mr-2 h-5 w-5 text-orange-500" />
              Try Recipe Swipes
            </CardTitle>
            <CardDescription>Discover AI-generated recipes based on your fridge contents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Swipe through personalized recipe suggestions that make the most of what's already in your fridge.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/recipes")}>
              Explore Recipes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-1" />
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Preview Meal Plan
            </CardTitle>
            <CardDescription>See how FRiDGE helps you plan meals for the entire week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The meal planner creates a balanced weekly menu and helps reduce food waste by using ingredients before
              they expire.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/meal-planner")}>
              View Meal Calendar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="mb-4 text-gray-600">Ready to see more? Explore these additional features:</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => router.push("/shopping-list")}>
            Shopping List
          </Button>
          <Button variant="outline" onClick={() => router.push("/preferences")}>
            User Preferences
          </Button>
          <Button variant="outline" onClick={() => router.push("/pricing")}>
            Subscription Plans
          </Button>
        </div>
      </div>
    </div>
  )
}

