import { createClient } from '@supabase/supabase-js'
import { parseSupabaseError, ValidationError } from './apiErrors'
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
  added_at: string
}

export async function getShoppingListItems(userId?: string): Promise<ShoppingListItem[]> {
  let query = supabase
    .from('shopping_list')
    .select('*')
    .order('added_at', { ascending: false })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    throw parseSupabaseError(error, 'shopping list')
  }
  
  return data || []
}

export async function addShoppingListItem(
  item: NewShoppingListItem,
  userId?: string
): Promise<ShoppingListItem> {
  // Validate item data
  if (!item.item_name) {
    throw new ValidationError('Item name is required for shopping list item')
  }
  
  // Ensure user_id is set correctly
  const itemWithUserId = { 
    ...item, 
    user_id: userId || item.user_id || '',
  }
  
  const { data, error } = await supabase
    .from('shopping_list')
    .insert([itemWithUserId])
    .select()
    .single()

  if (error) {
    throw parseSupabaseError(error, 'shopping list item')
  }
  
  return data
}

export async function updateShoppingListItem(
  id: string,
  updates: Partial<NewShoppingListItem>,
  userId?: string
): Promise<ShoppingListItem> {
  // Validation
  if (!id) {
    throw new ValidationError('Shopping list item ID is required for updates')
  }
  
  let query = supabase
    .from('shopping_list')
    .update(updates)
    .eq('id', id)
    
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query.select().single()

  if (error) {
    throw parseSupabaseError(error, 'shopping list item')
  }
  
  return data
}

export async function deleteShoppingListItem(id: string, userId?: string): Promise<void> {
  if (!id) {
    throw new ValidationError('Item ID is required for deletion')
  }
  
  let query = supabase
    .from('shopping_list')
    .delete()
    .eq('id', id)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { error } = await query

  if (error) {
    const errorWithContext = {
      ...error,
      message: error.message || `Failed to delete shopping list item with ID ${id}`
    }
    throw parseSupabaseError(errorWithContext, 'shopping list item')
  }
} 