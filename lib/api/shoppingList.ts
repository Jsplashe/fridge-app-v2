import { createClient } from '@supabase/supabase-js'
import { parseSupabaseError, ValidationError, ResourceNotFoundError } from './apiErrors'
import { NewShoppingListItem } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export interface ShoppingListItem {
  id: string
  user_id: string
  item_name: string
  quantity: number
  unit: string
  created_at: string
}

/**
 * Get all shopping list items for a user
 * @param userId The user ID to fetch shopping list items for
 * @returns A promise resolving to an array of shopping list items
 */
export async function getShoppingList(userId: string): Promise<ShoppingListItem[]> {
  try {
    const { data, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw parseSupabaseError(error, 'shopping list')
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getShoppingList:', error)
    throw error
  }
}

/**
 * Add a new shopping list item
 * @param item The shopping list item to add
 * @returns A promise resolving to the created shopping list item
 */
export async function addShoppingListItem(item: NewShoppingListItem): Promise<ShoppingListItem> {
  try {
    // Validation
    if (!item.item_name) {
      throw new ValidationError('Item name is required for shopping list item')
    }
    
    if (!item.user_id) {
      throw new ValidationError('User ID is required')
    }
    
    const { data, error } = await supabase
      .from('shopping_list')
      .insert([item])
      .select()
      .single()
  
    if (error) {
      throw parseSupabaseError(error, 'shopping list item')
    }
    
    if (!data) {
      throw new Error('Failed to create shopping list item')
    }
    
    return data
  } catch (error) {
    console.error('Error in addShoppingListItem:', error)
    throw error
  }
}

/**
 * Update an existing shopping list item
 * @param id The ID of the shopping list item to update
 * @param updates The updates to apply to the shopping list item
 * @returns A promise resolving to the updated shopping list item
 */
export async function updateShoppingListItem(id: string, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
  try {
    // Validation
    if (!id) {
      throw new ValidationError('Shopping list item ID is required for updates')
    }
    
    // Don't allow updating id, user_id or created_at
    const { id: _, user_id: __, created_at: ___, ...safeUpdates } = updates
    
    const { data, error } = await supabase
      .from('shopping_list')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()
  
    if (error) {
      throw parseSupabaseError(error, 'shopping list item')
    }
    
    if (!data) {
      throw new ResourceNotFoundError('shopping list item', id)
    }
    
    return data
  } catch (error) {
    console.error('Error in updateShoppingListItem:', error)
    throw error
  }
}

/**
 * Delete a shopping list item
 * @param id The ID of the shopping list item to delete
 * @returns A promise that resolves when the item is deleted
 */
export async function deleteShoppingListItem(id: string): Promise<void> {
  try {
    if (!id) {
      throw new ValidationError('Item ID is required for deletion')
    }
    
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id)
  
    if (error) {
      throw parseSupabaseError(error, 'shopping list item')
    }
  } catch (error) {
    console.error('Error in deleteShoppingListItem:', error)
    throw error
  }
} 