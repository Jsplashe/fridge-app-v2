import { useState, useEffect, useCallback } from 'react'
import { InventoryItem, getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/lib/api/inventory'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'
import { ApiError, ErrorCode, ValidationError } from '@/lib/api/apiErrors'
import { HookError, NewInventoryItem } from '@/lib/api/types'
import { supabase } from '@/lib/supabase'

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<HookError>(null)
  const { user } = useAuth()

  const userId = user?.id

  const fetchInventory = useCallback(async (showToast = false) => {
    if (!userId) {
      setError(new Error('User ID is required to fetch inventory'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error) setItems(data)
      setError(null)
      
      if (showToast) {
        toast({
          title: "Success",
          description: "Inventory refreshed successfully",
        })
      }
    } catch (err) {
      console.error('Error fetching inventory:', err)
      let errorTitle = 'Error'
      let errorMessage = 'Failed to fetch inventory items'
      
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
      fetchInventory()
    }
  }, [userId, fetchInventory])

  const addItem = async (item: NewInventoryItem) => {
    if (!userId) {
      const error = new Error('User ID is required to add inventory item')
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      })
      throw error
    }

    try {
      // Ensure user_id is set
      const itemWithUserId = {
        ...item,
        user_id: userId
      }
      
      const newItem = await addInventoryItem(itemWithUserId)
      setItems((prev) => [...prev, newItem])
      
      toast({
        title: "Success",
        description: `${newItem.item_name} has been added to your inventory.`,
      })
      
      return newItem
    } catch (err) {
      console.error('Failed to add inventory item:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to add item'
      
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

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!id) {
      const error = new ValidationError('Item ID is required to update an inventory item')
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error.message,
      })
      throw error
    }

    try {
      const updatedItem = await updateInventoryItem(id, updates)
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      
      toast({
        title: "Success",
        description: `${updatedItem.item_name} has been updated.`,
      })
      
      return updatedItem
    } catch (err) {
      console.error('Failed to update inventory item:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to update item'
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        switch(err.code) {
          case ErrorCode.VALIDATION_ERROR:
            errorTitle = 'Validation Error'
            break
          case ErrorCode.RESOURCE_NOT_FOUND:
            errorTitle = 'Item Not Found'
            errorMessage = `The item you're trying to update doesn't exist or was removed`
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

  const deleteItem = async (id: string) => {
    if (!id) {
      const error = new ValidationError('Item ID is required to delete an inventory item')
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error.message,
      })
      throw error
    }

    try {
      // Find the item before deleting it to use in success message
      const itemToDelete = items.find(item => item.id === id)
      const itemName = itemToDelete?.item_name || 'Item'
      
      await deleteInventoryItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      
      toast({
        title: "Success",
        description: `${itemName} has been removed from your inventory.`,
      })
    } catch (err) {
      console.error('Failed to delete inventory item:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to delete item'
      
      if (err instanceof ApiError) {
        errorMessage = err.message
        
        switch(err.code) {
          case ErrorCode.RESOURCE_NOT_FOUND:
            errorTitle = 'Item Not Found'
            errorMessage = `The item you're trying to delete doesn't exist or was already removed`
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

  return {
    items,
    loading,
    error,
    fetchInventory,
    addInventoryItem: addItem,
    updateInventoryItem: updateItem,
    deleteInventoryItem: deleteItem
  }
} 