"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type FoodCategory = 
  | "Dairy" 
  | "Meat" 
  | "Produce" 
  | "Fruits" 
  | "Grains" 
  | "Frozen" 
  | "Spices" 
  | "Other"

export interface CategoryBadgeProps {
  category: string
  className?: string
}

const getCategoryColor = (category: string): FoodCategory => {
  const normalizedCategory = category.toLowerCase().trim()
  
  if (normalizedCategory.includes("dairy")) return "Dairy"
  if (normalizedCategory.includes("meat")) return "Meat"
  if (normalizedCategory.includes("produce")) return "Produce"
  if (normalizedCategory.includes("fruit")) return "Fruits"
  if (normalizedCategory.includes("grain")) return "Grains"
  if (normalizedCategory.includes("frozen")) return "Frozen"
  if (normalizedCategory.includes("spice")) return "Spices"
  
  return "Other"
}

const categoryStyles: Record<FoodCategory, { bg: string, text: string, border: string }> = {
  "Dairy": { 
    bg: "bg-blue-100", 
    text: "text-blue-800",
    border: "border-blue-300" 
  },
  "Meat": { 
    bg: "bg-red-100", 
    text: "text-red-800",
    border: "border-red-300" 
  },
  "Produce": { 
    bg: "bg-green-100", 
    text: "text-green-800",
    border: "border-green-300" 
  },
  "Fruits": { 
    bg: "bg-pink-100", 
    text: "text-pink-800",
    border: "border-pink-300" 
  },
  "Grains": { 
    bg: "bg-yellow-100", 
    text: "text-yellow-800",
    border: "border-yellow-300" 
  },
  "Frozen": { 
    bg: "bg-cyan-100", 
    text: "text-cyan-800",
    border: "border-cyan-300" 
  },
  "Spices": { 
    bg: "bg-orange-100", 
    text: "text-orange-800",
    border: "border-orange-300" 
  },
  "Other": { 
    bg: "bg-gray-100", 
    text: "text-gray-800",
    border: "border-gray-300" 
  }
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const categoryType = getCategoryColor(category || "Other")
  const styles = categoryStyles[categoryType]
  
  return (
    <Badge 
      className={cn(
        styles.bg, 
        styles.text, 
        styles.border, 
        "border font-medium", 
        className
      )}
    >
      {category || "Other"}
    </Badge>
  )
}

export function getCategoryStyles(category: string) {
  const categoryType = getCategoryColor(category || "Other")
  return categoryStyles[categoryType]
} 