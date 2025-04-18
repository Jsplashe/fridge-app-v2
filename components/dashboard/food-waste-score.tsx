"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Leaf, DollarSign, Trash2 } from "lucide-react"

export function FoodWasteScore() {
  const wasteScore = 85 // Out of 100
  const moneySaved = 127.5
  const wasteReduction = 68 // Percentage

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Leaf className="mr-2 h-5 w-5 text-emerald-500" />
          Food Waste Scorecard
        </CardTitle>
        <CardDescription>Track your impact on reducing food waste</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium">Waste Score</span>
            <span className="text-sm font-medium">{wasteScore}/100</span>
          </div>
          <Progress value={wasteScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-center">
            <DollarSign className="mx-auto h-6 w-6 text-emerald-600" />
            <p className="mt-1 text-xs text-gray-600">Money Saved</p>
            <p className="text-lg font-bold text-emerald-700">${moneySaved.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 text-center">
            <Trash2 className="mx-auto h-6 w-6 text-emerald-600" />
            <p className="mt-1 text-xs text-gray-600">Waste Reduction</p>
            <p className="text-lg font-bold text-emerald-700">{wasteReduction}%</p>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-orange-50 p-3">
          <p className="text-sm text-orange-800">
            <span className="font-medium">Tip:</span> Use your spinach within 1 day to avoid waste!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

