'use client'

import React, { useState, useEffect } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { InventoryItem } from '@/lib/api/inventory'
import { toast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { FormErrors, NewInventoryItem } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  AlertCircle, 
  Edit, 
  Filter, 
  Plus, 
  RefreshCw,
  Refrigerator, 
  Search, 
  SortAsc, 
  SortDesc, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { CategoryBadge, getCategoryStyles, FoodCategory } from '@/components/ui/category-badge'

// Define the common food categories
const COMMON_CATEGORIES: FoodCategory[] = [
  "Dairy", 
  "Meat", 
  "Produce", 
  "Fruits", 
  "Grains", 
  "Frozen", 
  "Spices", 
  "Other"
];

export function InventoryList() {
  const { items, loading, error, fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newItem, setNewItem] = useState<NewInventoryItem>({
    item_name: '',
    quantity: 0,
    expiry_date: new Date().toISOString().split('T')[0],
    category: ''
  })
  const [formErrors, setFormErrors] = useState<FormErrors<NewInventoryItem>>({})
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  
  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  
  // Get unique categories
  const categories = React.useMemo(() => {
    const allCategories = items.map(item => item.category)
    return ['all', ...Array.from(new Set(allCategories)).filter(Boolean)]
  }, [items])

  // Client-side validation function
  const validateForm = (item: NewInventoryItem | InventoryItem) => {
    const errors: FormErrors<NewInventoryItem> = {}
    
    // Get item_name with a default empty string to avoid undefined
    const itemName = item.item_name || '';
    const itemQuantity = item.quantity ?? 0;
    const itemExpiryDate = item.expiry_date || '';
    const itemCategory = item.category || '';
    
    // Check if item name is empty
    if (!itemName.trim()) {
      errors.item_name = 'Item name is required';
    } else if (itemName.length < 2) {
      errors.item_name = 'Item name must be at least 2 characters';
    }
    
    // Check if quantity is valid
    if (typeof itemQuantity !== 'number' || itemQuantity < 0) {
      errors.quantity = 'Quantity must be a positive number';
    }
    
    // Check if expiry date is valid
    if (!itemExpiryDate) {
      errors.expiry_date = 'Expiry date is required';
    }
    
    // Check if category is selected
    if (!itemCategory) {
      errors.category = 'Category is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm(newItem)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fix the errors in the form"
      });
      return;
    }

    setIsSubmitting(true)
    try {
      // Create a validated version of the new item with proper defaults for all fields
      const validatedItem: NewInventoryItem = {
        item_name: newItem.item_name || '',
        quantity: newItem.quantity || 0,
        expiry_date: newItem.expiry_date || new Date().toISOString().split('T')[0],
        category: newItem.category || '',
      };
      
      await addInventoryItem(validatedItem);
      
      // Reset form
      setNewItem({
        item_name: '',
        quantity: 0,
        expiry_date: new Date().toISOString().split('T')[0],
        category: '',
      });
      
      setFormErrors({});
      toast({
        title: "Success",
        description: "Item added successfully!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add item: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEdit = (item: InventoryItem) => {
    // Create a copy with all required fields properly typed
    const itemToEdit: InventoryItem = {
      ...item,
      item_name: item.item_name || '',
      quantity: item.quantity || 0,
      expiry_date: item.expiry_date || new Date().toISOString().split('T')[0],
      category: item.category || ''
    };
    setEditItem(itemToEdit)
    setIsEditMode(true)
  }
  
  const saveEdit = async () => {
    if (!editItem) return;
    
    if (!validateForm(editItem)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fix the errors in the form"
      });
      return;
    }
    
    setIsSubmitting(true)
    try {
      // Ensure all required fields have values before updating
      const validatedItem: InventoryItem = {
        ...editItem,
        item_name: editItem.item_name || '',
        quantity: editItem.quantity || 0,
        expiry_date: editItem.expiry_date || new Date().toISOString().split('T')[0],
        category: editItem.category || ''
      };
      
      await updateInventoryItem(editItem.id, validatedItem)
      
      setIsEditMode(false)
      setEditItem(null)
      setFormErrors({})
      
      toast({
        title: "Success",
        description: "Item updated successfully!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const confirmDelete = (id: string) => {
    setItemToDelete(id)
    setDeleteConfirmOpen(true)
  }
  
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteInventoryItem(itemToDelete)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
      
      toast({
        title: "Success",
        description: "Item deleted successfully!"
      });
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: `Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  const handleRefresh = () => {
    fetchInventory(true) // true to show toast on refresh
  }
  
  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    return items
      .filter(item => {
        // Apply category filter
        if (categoryFilter && categoryFilter !== 'all') {
          if (item.category !== categoryFilter) return false;
        }
        
        // Apply search filter
        if (searchTerm) {
          return item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.category.toLowerCase().includes(searchTerm.toLowerCase());
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        if (sortBy === 'name') {
          return sortOrder === 'asc' 
            ? a.item_name.localeCompare(b.item_name)
            : b.item_name.localeCompare(a.item_name);
        } else if (sortBy === 'date') {
          const dateA = new Date(a.expiry_date).getTime();
          const dateB = new Date(b.expiry_date).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortBy === 'status') {
          const today = new Date();
          const expiryDateA = new Date(a.expiry_date);
          const expiryDateB = new Date(b.expiry_date);
          const daysRemainingA = Math.ceil((expiryDateA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const daysRemainingB = Math.ceil((expiryDateB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Convert days remaining to status code (1 = expired, 2 = expiring soon, 3 = fresh)
          const getStatusCode = (days: number) => {
            if (days < 0) return 1; // expired
            if (days <= 3) return 2; // expiring soon
            return 3; // fresh
          };
          
          const statusA = getStatusCode(daysRemainingA);
          const statusB = getStatusCode(daysRemainingB);
          
          // When status is the same, sort by days remaining
          if (statusA === statusB) {
            return sortOrder === 'asc' ? daysRemainingA - daysRemainingB : daysRemainingB - daysRemainingA;
          }
          
          // Sort by status code
          return sortOrder === 'asc' ? statusA - statusB : statusB - statusA;
        } else if (sortBy === 'category') {
          return sortOrder === 'asc'
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        } else if (sortBy === 'quantity') {
          return sortOrder === 'asc' 
            ? a.quantity - b.quantity
            : b.quantity - a.quantity;
        }
        return 0;
      });
  }, [items, categoryFilter, searchTerm, sortBy, sortOrder]);
  
  // Calculate expiring soon count
  const expiringSoonCount = React.useMemo(() => {
    const today = new Date();
    return items.filter(item => {
      const expiryDate = new Date(item.expiry_date);
      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysRemaining >= 0 && daysRemaining <= 3;
    }).length;
  }, [items]);

  // Calculate expired count
  const expiredCount = React.useMemo(() => {
    const today = new Date();
    return items.filter(item => {
      const expiryDate = new Date(item.expiry_date);
      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysRemaining < 0;
    }).length;
  }, [items]);

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <p className="text-red-500 mb-4">Error loading inventory: {error.message}</p>
        <Button 
          onClick={handleRefresh}
          variant="default"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-3xl font-bold">{items.length}</p>
              </div>
              <Refrigerator className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-3xl font-bold">{categories.length - 1}</p>
              </div>
              <Filter className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expiring Soon</p>
                <p className="text-3xl font-bold">{expiringSoonCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expired</p>
                <p className="text-3xl font-bold">{expiredCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add item form */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Add New Item</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <Input
                  id="item_name"
                  placeholder="Item Name"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  className={formErrors.item_name ? 'border-red-500' : ''}
                  required
                  disabled={isSubmitting}
                />
                {formErrors.item_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.item_name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  className={formErrors.quantity ? 'border-red-500' : ''}
                  required
                  disabled={isSubmitting}
                  min="0"
                />
                {formErrors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <Input
                  id="expiry_date"
                  type="date"
                  placeholder="Expiry Date"
                  value={newItem.expiry_date}
                  onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
                  className={formErrors.expiry_date ? 'border-red-500' : ''}
                  required
                  disabled={isSubmitting}
                />
                {formErrors.expiry_date && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.expiry_date}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select 
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger 
                    id="category" 
                    className={formErrors.category ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_CATEGORIES.map(category => {
                      const style = getCategoryStyles(category);
                      return (
                        <SelectItem 
                          key={category} 
                          value={category}
                          className="flex items-center"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${style.bg}`}></div>
                            {category}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {newItem.category && (
                  <div className="mt-2">
                    <CategoryBadge category={newItem.category} />
                  </div>
                )}
                {formErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Expiry Date</SelectItem>
              <SelectItem value="status">Expiry Status</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="quantity">Quantity</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Inventory list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed rounded-lg">
              <div className="mb-4">
                <Refrigerator className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-500">
                {items.length === 0 
                  ? "Your inventory is empty" 
                  : "No items match your search"}
              </h3>
              <p className="text-gray-500 mt-1">
                {items.length === 0 
                  ? "Add some items using the form above to get started." 
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedItems.map(item => {
                const categoryStyle = getCategoryStyles(item.category);
                // Extract the color from the border class to use it for both the left border and a subtle full border
                const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
                const colorName = colorMatch ? colorMatch[1] : 'gray';
                const borderClass = `border border-${colorName}-200 border-l-4 ${categoryStyle.border.replace('border', 'border-l')}`;
                const hoverClass = `hover:border-${colorName}-300 hover:bg-${colorName}-50`;
                
                return (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden ${borderClass} transition-colors duration-200 hover:shadow-md ${hoverClass}`}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">{item.item_name}</h3>
                        <CategoryBadge category={item.category} />
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Quantity: {item.quantity}</p>
                        <p>Expires: {new Date(item.expiry_date).toLocaleDateString()}</p>
                        {(() => {
                          const today = new Date();
                          const expiryDate = new Date(item.expiry_date);
                          const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          
                          if (daysRemaining < 0) {
                            return (
                              <div className="mt-2 flex items-center">
                                <span className="text-white bg-red-500 px-2 py-1 rounded-full text-xs flex items-center">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Expired
                                </span>
                              </div>
                            );
                          } else if (daysRemaining <= 3) {
                            return (
                              <div className="mt-2 flex items-center">
                                <span className="text-white bg-yellow-500 px-2 py-1 rounded-full text-xs flex items-center">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Expires in {daysRemaining === 0 ? 'today' : daysRemaining === 1 ? '1 day' : `${daysRemaining} days`}
                                </span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="mt-2 flex items-center">
                                <span className="text-white bg-green-500 px-2 py-1 rounded-full text-xs flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Fresh – {daysRemaining} days left
                                </span>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex border-t">
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-none py-2 h-auto"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <div className="w-px bg-gray-200" />
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-none py-2 h-auto text-red-500 hover:text-red-700"
                        onClick={() => confirmDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </>
      )}
      
      {/* Edit dialog */}
      <Dialog open={isEditMode} onOpenChange={(open) => !isSubmitting && setIsEditMode(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          
          {editItem && (
            <div className="space-y-4 py-4">
              {/* Add a colored indicator based on the category */}
              {editItem.category && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-full h-1.5 rounded-full ${getCategoryStyles(editItem.category).bg}`}
                      aria-hidden="true"
                    />
                    <CategoryBadge category={editItem.category} />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="edit_item_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <Input
                    id="edit_item_name"
                    placeholder="Item Name"
                    value={editItem.item_name}
                    onChange={(e) => setEditItem({ 
                      ...editItem, 
                      item_name: e.target.value 
                    })}
                    className={formErrors.item_name ? 'border-red-500' : ''}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.item_name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.item_name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="edit_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <Input
                    id="edit_quantity"
                    type="number"
                    placeholder="Quantity"
                    value={editItem.quantity}
                    onChange={(e) => setEditItem({ 
                      ...editItem, 
                      quantity: e.target.value ? Number(e.target.value) : 0 
                    })}
                    className={formErrors.quantity ? 'border-red-500' : ''}
                    required
                    disabled={isSubmitting}
                    min="0"
                  />
                  {formErrors.quantity && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="edit_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <Input
                    id="edit_expiry_date"
                    type="date"
                    placeholder="Expiry Date"
                    value={editItem.expiry_date.split('T')[0]}
                    onChange={(e) => setEditItem({ 
                      ...editItem, 
                      expiry_date: e.target.value || new Date().toISOString().split('T')[0]
                    })}
                    className={formErrors.expiry_date ? 'border-red-500' : ''}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.expiry_date && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.expiry_date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="edit_category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Select 
                    value={editItem.category}
                    onValueChange={(value) => setEditItem({ ...editItem, category: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger 
                      id="edit_category" 
                      className={formErrors.category ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_CATEGORIES.map(category => {
                        const style = getCategoryStyles(category);
                        return (
                          <SelectItem 
                            key={category} 
                            value={category}
                            className="flex items-center"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${style.bg}`}></div>
                              {category}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {editItem.category && (
                    <div className="mt-2">
                      <CategoryBadge category={editItem.category} />
                    </div>
                  )}
                  {formErrors.category && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMode(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 