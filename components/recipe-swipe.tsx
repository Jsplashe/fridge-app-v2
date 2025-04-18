"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Clock, Users } from "lucide-react"

interface Recipe {
  id: string
  name: string
  description: string
  cookTime: string
  servings: number
  image: string
}

interface RecipeSwipeProps {
  onPremiumPrompt: (message: string) => void
}

export function RecipeSwipe({ onPremiumPrompt }: RecipeSwipeProps) {
  const [recipes] = useState<Recipe[]>([
    {
      id: "1",
      name: "Pasta Primavera",
      description: "Fresh spring vegetables with pasta in a light cream sauce",
      cookTime: "25 mins",
      servings: 4,
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "2",
      name: "Chicken Stir Fry",
      description: "Quick and healthy chicken with vegetables",
      cookTime: "20 mins",
      servings: 3,
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "3",
      name: "Vegetable Curry",
      description: "Spicy vegetable curry with coconut milk",
      cookTime: "35 mins",
      servings: 4,
      image: "/placeholder.svg?height=300&width=400",
    },
  ])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeCount, setSwipeCount] = useState(0)

  const handleNext = () => {
    if (swipeCount >= 5) {
      onPremiumPrompt("Unlock unlimited recipe swipes—Go Premium!")
      return
    }

    setCurrentIndex((prevIndex) => (prevIndex + 1) % recipes.length)
    setSwipeCount((prev) => prev + 1)
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + recipes.length) % recipes.length)
  }

  const currentRecipe = recipes[currentIndex]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recipe Swipe</CardTitle>
        <CardDescription>Discover meals you can make with your ingredients</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-[200px] w-full overflow-hidden rounded-md">
          <Image
            src={currentRecipe.image || "/placeholder.svg"}
            alt={currentRecipe.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold">{currentRecipe.name}</h3>
          <p className="mt-1 text-gray-600">{currentRecipe.description}</p>
          <div className="mt-2 flex justify-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              {currentRecipe.cookTime}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="mr-1 h-4 w-4" />
              {currentRecipe.servings} servings
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="text-red-500" onClick={handleNext}>
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="text-green-500" onClick={handleNext}>
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

