import { useState, useEffect, useMemo, useCallback } from 'react'
import { MealPlan, getMealPlans, addMealPlan, updateMealPlan, deleteMealPlan, getMealPlansByDay } from '@/lib/api/mealPlans'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'
import { ApiError, ErrorCode, ValidationError } from '@/lib/api/apiErrors'
import { HookError, NewMealPlan } from '@/lib/api/types'

export type MealsByDay = Record<string, MealPlan[]>

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

export function useMealPlans() {
  const [meals, setMeals] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<HookError>(null)
  const { user } = useAuth()

  const userId = user?.id

  const fetchMealPlans = useCallback(async (showToast = false) => {
    if (!userId) {
      setError(new Error('User ID is required to fetch meal plans'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getMealPlans(userId)
      setMeals(data)
      setError(null)
      
      if (showToast) {
        toast({
          title: "Success",
          description: "Meal plans refreshed successfully",
        })
      }
    } catch (err) {
      console.error('Error fetching meal plans:', err)
      let errorTitle = 'Error'
      let errorMessage = 'Failed to fetch meal plans'
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        // Set specific error title based on error code
        switch(err.code) {
          case ErrorCode.AUTH_REQUIRED:
          case ErrorCode.UNAUTHORIZED:
            errorTitle = 'Authentication Error'
            break
          case ErrorCode.RESOURCE_NOT_FOUND:
            errorTitle = 'Not Found'
            break
          case ErrorCode.DB_CONNECTION_ERROR:
          case ErrorCode.DB_QUERY_ERROR:
            errorTitle = 'Database Error'
            break
          case ErrorCode.VALIDATION_ERROR:
            errorTitle = 'Validation Error'
            break
        }
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage))
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchMealPlans()
    }
  }, [userId, fetchMealPlans])

  // Group meals by day for easy calendar visualization
  const mealsByDay = useMemo<MealsByDay>(() => {
    return DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = meals.filter(meal => meal.day_of_week === day)
      return acc
    }, {} as MealsByDay)
  }, [meals])

  const addMeal = async (meal: NewMealPlan) => {
    if (!userId) {
      const error = new Error('User ID is required to add meal plan')
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      })
      throw error
    }

    try {
      // Ensure user_id is set
      const mealWithUserId = {
        ...meal,
        user_id: userId
      }
      
      const newMeal = await addMealPlan(mealWithUserId)
      setMeals((prev) => [...prev, newMeal])
      
      toast({
        title: "Success",
        description: `${newMeal.meal_name} has been added to your meal plan for ${newMeal.day_of_week}.`,
      })
      
      return newMeal
    } catch (err) {
      console.error('Failed to add meal plan:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to add meal plan'
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        switch(err.code) {
          case ErrorCode.VALIDATION_ERROR:
            errorTitle = 'Validation Error'
            break
          case ErrorCode.AUTH_REQUIRED:
          case ErrorCode.UNAUTHORIZED:
            errorTitle = 'Authentication Error'
            break
          case ErrorCode.DB_CONNECTION_ERROR:
          case ErrorCode.DB_QUERY_ERROR:
            errorTitle = 'Database Error'
            break
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      })
      
      throw err
    }
  }

  const updateMeal = async (id: string, updates: Partial<MealPlan>) => {
    if (!id) {
      const error = new ValidationError('Meal ID is required to update a meal plan')
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error.message,
      })
      throw error
    }

    try {
      const updatedMeal = await updateMealPlan(id, updates)
      setMeals((prev) => prev.map((meal) => (meal.id === id ? updatedMeal : meal)))
      
      toast({
        title: "Success",
        description: `${updatedMeal.meal_name} has been updated.`,
      })
      
      return updatedMeal
    } catch (err) {
      console.error('Failed to update meal plan:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to update meal plan'
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        switch(err.code) {
          case ErrorCode.VALIDATION_ERROR:
            errorTitle = 'Validation Error'
            break
          case ErrorCode.RESOURCE_NOT_FOUND:
            errorTitle = 'Meal Not Found'
            errorMessage = `The meal you're trying to update doesn't exist or was removed`
            break
          case ErrorCode.AUTH_REQUIRED:
          case ErrorCode.UNAUTHORIZED:
            errorTitle = 'Authentication Error'
            break
          case ErrorCode.DB_CONNECTION_ERROR:
          case ErrorCode.DB_QUERY_ERROR:
            errorTitle = 'Database Error'
            break
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      })
      
      throw err
    }
  }

  const deleteMeal = async (id: string) => {
    if (!id) {
      const error = new ValidationError('Meal ID is required to delete a meal plan')
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error.message,
      })
      throw error
    }

    try {
      // Find the meal before deleting it to use in success message
      const mealToDelete = meals.find(meal => meal.id === id)
      const mealName = mealToDelete?.meal_name || 'Meal'
      
      await deleteMealPlan(id)
      setMeals((prev) => prev.filter((meal) => meal.id !== id))
      
      toast({
        title: "Success",
        description: `${mealName} has been removed from your meal plan.`,
      })
    } catch (err) {
      console.error('Failed to delete meal plan:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to delete meal plan'
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        switch(err.code) {
          case ErrorCode.RESOURCE_NOT_FOUND:
            errorTitle = 'Meal Not Found'
            errorMessage = `The meal you're trying to delete doesn't exist or was already removed`
            break
          case ErrorCode.AUTH_REQUIRED:
          case ErrorCode.UNAUTHORIZED:
            errorTitle = 'Authentication Error'
            break
          case ErrorCode.DB_CONNECTION_ERROR:
          case ErrorCode.DB_QUERY_ERROR:
            errorTitle = 'Database Error'
            break
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      })
      
      throw err
    }
  }

  const getMealsByDayOfWeek = async (day: string) => {
    if (!userId || !day) {
      const error = new ValidationError('User ID and day are required to fetch meals by day')
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error.message,
      })
      throw error
    }

    try {
      const data = await getMealPlansByDay(day, userId)
      return data
    } catch (err) {
      console.error(`Failed to fetch meals for ${day}:`, err)
      
      let errorTitle = 'Error'
      let errorMessage = `Failed to fetch meals for ${day}`
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        switch(err.code) {
          case ErrorCode.VALIDATION_ERROR:
            errorTitle = 'Invalid Day'
            break
          case ErrorCode.RESOURCE_NOT_FOUND:
            errorTitle = 'Not Found'
            break
          case ErrorCode.AUTH_REQUIRED:
          case ErrorCode.UNAUTHORIZED:
            errorTitle = 'Authentication Error'
            break
          case ErrorCode.DB_CONNECTION_ERROR:
          case ErrorCode.DB_QUERY_ERROR:
            errorTitle = 'Database Error'
            break
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      })
      
      throw err
    }
  }

  const clearMealsByDay = async (day: string) => {
    if (!userId || !day) {
      const error = new ValidationError('User ID and day are required to clear meals')
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error.message,
      })
      throw error
    }

    try {
      setLoading(true)
      
      const mealsForDay = mealsByDay[day] || []
      
      if (mealsForDay.length === 0) {
        toast({
          title: "Info",
          description: `No meals to clear for ${day}.`,
        })
        return
      }
      
      // Try to delete all meals for the day; handle errors individually 
      let failedCount = 0
      
      for (const meal of mealsForDay) {
        try {
          await deleteMealPlan(meal.id)
        } catch (err) {
          console.error(`Failed to delete meal ${meal.id}:`, err)
          failedCount++
        }
      }
      
      // If any meals failed to delete, show a warning but update the UI
      if (failedCount > 0) {
        toast({
          variant: "destructive",
          title: "Partial Success",
          description: `Cleared most meals, but ${failedCount} meals couldn't be removed.`,
        })
        // Refresh to get current state
        await fetchMealPlans()
      } else {
        setMeals(prev => prev.filter(meal => meal.day_of_week !== day))
        toast({
          title: "Success",
          description: `All meals for ${day} have been cleared.`,
        })
      }
    } catch (err) {
      console.error(`Failed to clear meals for ${day}:`, err)
      
      let errorTitle = 'Error'
      let errorMessage = `Failed to clear meals for ${day}`
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        switch(err.code) {
          case ErrorCode.AUTH_REQUIRED:
          case ErrorCode.UNAUTHORIZED:
            errorTitle = 'Authentication Error'
            break
          case ErrorCode.DB_CONNECTION_ERROR:
          case ErrorCode.DB_QUERY_ERROR:
            errorTitle = 'Database Error'
            break
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    meals,
    mealsByDay,
    loading,
    error,
    fetchMealPlans,
    addMealPlan: addMeal,
    updateMealPlan: updateMeal,
    deleteMealPlan: deleteMeal,
    getMealsByDayOfWeek,
    clearMealsByDay,
    DAYS_OF_WEEK
  }
} 