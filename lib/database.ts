import { supabase } from './supabase'
import type { Database, Inventory, ShoppingList, MealPlan } from './database.types'

// Inventory operations
export async function getInventory(userId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Inventory[]
}

export async function addInventoryItem(item: Omit<Inventory, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('inventory')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data as Inventory
}

export async function updateInventoryItem(id: string, updates: Partial<Omit<Inventory, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Inventory
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Shopping list operations
export async function getShoppingList(userId: string) {
  const { data, error } = await supabase
    .from('shopping_list')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) throw error
  return data as ShoppingList[]
}

export async function addShoppingListItem(item: Omit<ShoppingList, 'id' | 'added_at'>) {
  const { data, error } = await supabase
    .from('shopping_list')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data as ShoppingList
}

export async function deleteShoppingListItem(id: string) {
  const { error } = await supabase
    .from('shopping_list')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Meal plan operations
export async function getMealPlans(userId: string) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MealPlan[]
}

export async function addMealPlan(meal: Omit<MealPlan, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert(meal)
    .select()
    .single()

  if (error) throw error
  return data as MealPlan
}

export async function updateMealPlan(id: string, updates: Partial<Omit<MealPlan, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('meal_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as MealPlan
}

export async function deleteMealPlan(id: string) {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id)

  if (error) throw error
} 