import { createClient } from '@supabase/supabase-js'
import { parseSupabaseError, ValidationError, ResourceNotFoundError } from './apiErrors'
import { NewInventoryItem } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export interface InventoryItem {
  id: string
  user_id: string
  item_name: string
  quantity: number
  expiry_date: string
  category: string
  created_at: string
  updated_at?: string
}

/**
 * Get all inventory items for a user
 * @param userId The user ID to fetch inventory items for
 * @returns A promise resolving to an array of inventory items
 */
export async function getInventory(userId: string): Promise<InventoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw parseSupabaseError(error, 'inventory')
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getInventory:', error)
    throw error
  }
}

/**
 * Add a new inventory item
 * @param item The inventory item to add
 * @returns A promise resolving to the created inventory item
 */
export async function addInventoryItem(item: NewInventoryItem): Promise<InventoryItem> {
  try {
    // Validation
    if (!item.item_name) {
      throw new ValidationError('Item name is required')
    }
    
    if (!item.user_id) {
      throw new ValidationError('User ID is required')
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .insert([item])
      .select()
      .single()
  
    if (error) {
      throw parseSupabaseError(error, 'inventory item')
    }
    
    if (!data) {
      throw new Error('Failed to create inventory item')
    }
    
    return data
  } catch (error) {
    console.error('Error in addInventoryItem:', error)
    throw error
  }
}

/**
 * Update an existing inventory item
 * @param id The ID of the inventory item to update
 * @param updates The updates to apply to the inventory item
 * @returns A promise resolving to the updated inventory item
 */
export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
  try {
    // Validation
    if (!id) {
      throw new ValidationError('Item ID is required for updates')
    }
    
    // Don't allow updating id, user_id or created_at
    const { id: _, user_id: __, created_at: ___, ...safeUpdates } = updates
    
    const { data, error } = await supabase
      .from('inventory')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()
  
    if (error) {
      throw parseSupabaseError(error, 'inventory item')
    }
    
    if (!data) {
      throw new ResourceNotFoundError('inventory item', id)
    }
    
    return data
  } catch (error) {
    console.error('Error in updateInventoryItem:', error)
    throw error
  }
}

/**
 * Delete an inventory item
 * @param id The ID of the inventory item to delete
 * @returns A promise that resolves when the item is deleted
 */
export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    if (!id) {
      throw new ValidationError('Item ID is required for deletion')
    }
    
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
  
    if (error) {
      throw parseSupabaseError(error, 'inventory item')
    }
  } catch (error) {
    console.error('Error in deleteInventoryItem:', error)
    throw error
  }
}

// Keep the getInventoryItems function for backward compatibility but mark as deprecated
/**
 * @deprecated Use getInventory instead
 */
export async function getInventoryItems(userId?: string): Promise<InventoryItem[]> {
  if (userId) {
    return getInventory(userId)
  }
  
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw parseSupabaseError(error, 'inventory')
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getInventoryItems:', error)
    throw error
  }
} 