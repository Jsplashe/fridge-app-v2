"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChefHat, ShoppingCart, Calendar, Share2 } from "lucide-react"

export function DashboardActions() {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="flex h-24 flex-col items-center justify-center space-y-2"
          onClick={() => router.push("/recipes")}
        >
          <ChefHat className="h-6 w-6 text-emerald-600" />
          <span>Find Recipes</span>
        </Button>
        <Button
          variant="outline"
          className="flex h-24 flex-col items-center justify-center space-y-2"
          onClick={() => router.push("/shopping-list")}
        >
          <ShoppingCart className="h-6 w-6 text-emerald-600" />
          <span>Shopping List</span>
        </Button>
        <Button
          variant="outline"
          className="flex h-24 flex-col items-center justify-center space-y-2"
          onClick={() => router.push("/meal-planner")}
        >
          <Calendar className="h-6 w-6 text-emerald-600" />
          <span>Meal Planner</span>
        </Button>
        <Button variant="outline" className="flex h-24 flex-col items-center justify-center space-y-2">
          <Share2 className="h-6 w-6 text-emerald-600" />
          <span>Share Fridge</span>
        </Button>
      </CardContent>
    </Card>
  )
}

