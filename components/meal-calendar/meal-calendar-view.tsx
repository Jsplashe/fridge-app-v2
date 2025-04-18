"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface MealDay {
  day: string
  date: string
  meal: {
    name: string
    image: string
    tags: string[]
  } | null
}

export function MealCalendarView() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(0)

  const [weekDays, setWeekDays] = useState<MealDay[]>([
    {
      day: "Monday",
      date: "Mar 22",
      meal: {
        name: "Grilled Chicken Salad",
        image: "/placeholder.svg?height=150&width=200",
        tags: ["High Protein", "Low Carb"],
      },
    },
    {
      day: "Tuesday",
      date: "Mar 23",
      meal: {
        name: "Vegetable Stir Fry",
        image: "/placeholder.svg?height=150&width=200",
        tags: ["Vegetarian", "Quick"],
      },
    },
    {
      day: "Wednesday",
      date: "Mar 24",
      meal: {
        name: "Salmon with Roasted Vegetables",
        image: "/placeholder.svg?height=150&width=200",
        tags: ["Omega-3", "Gluten-Free"],
      },
    },
    {
      day: "Thursday",
      date: "Mar 25",
      meal: null,
    },
    {
      day: "Friday",
      date: "Mar 26",
      meal: {
        name: "Pasta Primavera",
        image: "/placeholder.svg?height=150&width=200",
        tags: ["Vegetarian", "Italian"],
      },
    },
    {
      day: "Saturday",
      date: "Mar 27",
      meal: {
        name: "Beef Tacos",
        image: "/placeholder.svg?height=150&width=200",
        tags: ["Mexican", "Family Friendly"],
      },
    },
    {
      day: "Sunday",
      date: "Mar 28",
      meal: null,
    },
  ])

  const handlePreviousWeek = () => {
    setCurrentWeek(currentWeek - 1)
  }

  const handleNextWeek = () => {
    setCurrentWeek(currentWeek + 1)
  }

  const handleGenerateWeeklyPlan = () => {
    setIsGenerating(true)
    // Simulate API call to generate meal plan
    setTimeout(() => {
      setWeekDays(
        weekDays.map((day) => ({
          ...day,
          meal:
            day.meal === null
              ? {
                  name: "AI Generated Meal",
                  image: "/placeholder.svg?height=150&width=200",
                  tags: ["AI Suggested", "Based on Inventory"],
                }
              : day.meal,
        })),
      )
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            Week{" "}
            {currentWeek === 0
              ? "of March 22 - 28"
              : currentWeek > 0
                ? `of April ${currentWeek * 7 - 7 + 1} - ${currentWeek * 7}`
                : `of March ${22 - Math.abs(currentWeek) * 7} - ${28 - Math.abs(currentWeek) * 7}`}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/meal-planner?view=list")}>
          Switch View
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
        {weekDays.map((day, index) => (
          <Card key={index} className="flex h-full flex-col">
            <div className="border-b p-3 text-center">
              <h3 className="font-medium">{day.day}</h3>
              <p className="text-sm text-gray-500">{day.date}</p>
            </div>
            <CardContent className="flex-1 p-3">
              {day.meal ? (
                <div className="flex h-full flex-col">
                  <div className="relative mb-2 h-32 w-full overflow-hidden rounded-md">
                    <Image
                      src={day.meal.image || "/placeholder.svg"}
                      alt={day.meal.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="mb-1 font-medium">{day.meal.name}</h4>
                  <div className="mt-auto flex flex-wrap gap-1">
                    {day.meal.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm text-gray-500">No meal planned</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Add Meal
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full">
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={handleGenerateWeeklyPlan} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-5 w-5" />
              Generate Weekly Plan
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>AI-powered meal suggestions based on your dietary preferences and fridge inventory</p>
      </div>
    </div>
  )
}

