import { createClient } from '@supabase/supabase-js'
import { parseSupabaseError, ValidationError, ResourceNotFoundError } from './apiErrors'
import { NewMealPlan } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export interface MealPlan {
  id: string
  user_id: string
  meal_name: string
  day_of_week: string
  created_at: string
}

/**
 * Get all meal plans for a user
 * @param userId The user ID to fetch meal plans for
 * @returns A promise resolving to an array of meal plans
 */
export async function getMealPlans(userId: string): Promise<MealPlan[]> {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('day_of_week', { ascending: true })
    
    if (error) {
      throw parseSupabaseError(error, 'meal plans')
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getMealPlans:', error)
    throw error
  }
}

/**
 * Add a new meal plan
 * @param mealPlan The meal plan to add
 * @returns A promise resolving to the created meal plan
 */
export async function addMealPlan(mealPlan: NewMealPlan): Promise<MealPlan> {
  try {
    // Validate meal plan data
    if (!mealPlan.meal_name) {
      throw new ValidationError('Meal name is required')
    }
    
    if (!mealPlan.day_of_week) {
      throw new ValidationError('Day of week is required')
    }
    
    if (!mealPlan.user_id) {
      throw new ValidationError('User ID is required')
    }
    
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([mealPlan])
      .select()
      .single()
  
    if (error) {
      throw parseSupabaseError(error, 'meal plan')
    }
    
    if (!data) {
      throw new Error('Failed to create meal plan')
    }
    
    return data
  } catch (error) {
    console.error('Error in addMealPlan:', error)
    throw error
  }
}

/**
 * Update an existing meal plan
 * @param id The ID of the meal plan to update
 * @param updates The updates to apply to the meal plan
 * @returns A promise resolving to the updated meal plan
 */
export async function updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlan> {
  try {
    // Validation
    if (!id) {
      throw new ValidationError('Meal plan ID is required for updates')
    }
    
    // Don't allow updating id, user_id or created_at
    const { id: _, user_id: __, created_at: ___, ...safeUpdates } = updates
    
    const { data, error } = await supabase
      .from('meal_plans')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()
  
    if (error) {
      throw parseSupabaseError(error, 'meal plan')
    }
    
    if (!data) {
      throw new ResourceNotFoundError('meal plan', id)
    }
    
    return data
  } catch (error) {
    console.error('Error in updateMealPlan:', error)
    throw error
  }
}

/**
 * Delete a meal plan
 * @param id The ID of the meal plan to delete
 * @returns A promise that resolves when the meal plan is deleted
 */
export async function deleteMealPlan(id: string): Promise<void> {
  try {
    if (!id) {
      throw new ValidationError('Meal plan ID is required for deletion')
    }
    
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)
  
    if (error) {
      throw parseSupabaseError(error, 'meal plan')
    }
  } catch (error) {
    console.error('Error in deleteMealPlan:', error)
    throw error
  }
}

// Utility function to get meal plans for a specific day (preserved for compatibility)
export async function getMealPlansByDay(day: string, userId?: string): Promise<MealPlan[]> {
  try {
    if (!day) {
      throw new ValidationError('Day parameter is required to fetch meals by day')
    }
    
    let query = supabase
      .from('meal_plans')
      .select('*')
      .eq('day_of_week', day)
      .order('created_at', { ascending: true })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
  
    const { data, error } = await query
  
    if (error) {
      throw parseSupabaseError(error, 'meal plans')
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getMealPlansByDay:', error)
    throw error
  }
} 