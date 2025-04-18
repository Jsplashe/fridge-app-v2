import { useState, useEffect, useCallback } from 'react'
import { ShoppingListItem, getShoppingList, addShoppingListItem, updateShoppingListItem, deleteShoppingListItem } from '@/lib/api/shoppingList'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'
import { ApiError, ErrorCode, ValidationError } from '@/lib/api/apiErrors'
import { HookError, NewShoppingListItem } from '@/lib/api/types'

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<HookError>(null)
  const { user } = useAuth()

  const userId = user?.id

  const fetchShoppingList = useCallback(async (showToast = false) => {
    if (!userId) {
      setError(new Error('User ID is required to fetch shopping list'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getShoppingList(userId)
      setItems(data)
      setError(null)
      
      if (showToast) {
        toast({
          title: "Success",
          description: "Shopping list refreshed successfully",
        })
      }
    } catch (err) {
      console.error('Error fetching shopping list:', err)
      let errorTitle = 'Error'
      let errorMessage = 'Failed to fetch shopping list items'
      
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
      fetchShoppingList()
    }
  }, [userId, fetchShoppingList])

  const addItem = async (item: NewShoppingListItem) => {
    if (!userId) {
      const error = new Error('User ID is required to add shopping list item')
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
      
      const newItem = await addShoppingListItem(itemWithUserId)
      setItems((prev) => [...prev, newItem])
      
      toast({
        title: "Success",
        description: `${newItem.item_name} has been added to your shopping list.`,
      })
      
      return newItem
    } catch (err) {
      console.error('Failed to add shopping list item:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to add shopping list item'
      
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

  const updateItem = async (id: string, updates: Partial<ShoppingListItem>) => {
    if (!id) {
      const error = new ValidationError('Item ID is required to update a shopping list item')
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error.message,
      })
      throw error
    }

    try {
      const updatedItem = await updateShoppingListItem(id, updates)
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      
      toast({
        title: "Success",
        description: `${updatedItem.item_name} has been updated.`,
      })
      
      return updatedItem
    } catch (err) {
      console.error('Failed to update shopping list item:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to update shopping list item'
      
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
      const error = new ValidationError('Item ID is required to delete a shopping list item')
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
      
      await deleteShoppingListItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      
      toast({
        title: "Success",
        description: `${itemName} has been removed from your shopping list.`,
      })
    } catch (err) {
      console.error('Failed to delete shopping list item:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to delete shopping list item'
      
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

  // Additional utility function to clear all items
  const clearShoppingList = async () => {
    if (!userId) {
      const error = new Error('User ID is required to clear shopping list')
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      })
      throw error
    }

    try {
      setLoading(true)
      
      if (items.length === 0) {
        toast({
          title: "Info",
          description: "Your shopping list is already empty.",
        })
        return
      }
      
      // Try to delete all items; handle errors individually 
      let failedCount = 0
      
      for (const item of items) {
        try {
          await deleteShoppingListItem(item.id)
        } catch (err) {
          console.error(`Failed to delete item ${item.id}:`, err)
          failedCount++
        }
      }
      
      // If any items failed to delete, show a warning but update the UI
      if (failedCount > 0) {
        toast({
          variant: "destructive",
          title: "Partial Success",
          description: `Cleared most items, but ${failedCount} items couldn't be removed.`,
        })
        // Refresh to get current state
        await fetchShoppingList()
      } else {
        setItems([])
        toast({
          title: "Success",
          description: "Your shopping list has been cleared.",
        })
      }
    } catch (err) {
      console.error('Failed to clear shopping list:', err)
      
      let errorTitle = 'Error'
      let errorMessage = 'Failed to clear shopping list'
      
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
    items,
    loading,
    error,
    fetchShoppingList,
    addShoppingListItem: addItem,
    updateShoppingListItem: updateItem,
    deleteShoppingListItem: deleteItem,
    clearShoppingList
  }
} 