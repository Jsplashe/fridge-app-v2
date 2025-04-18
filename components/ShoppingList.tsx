import React, { useState, useEffect } from 'react'
import { useShoppingList } from '@/hooks/useShoppingList'
import { ShoppingListItem } from '@/lib/api/shoppingList'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { FormErrors, NewShoppingListItem } from '@/lib/api/types'
import { CategoryBadge, getCategoryStyles, FoodCategory } from '@/components/ui/category-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingBagIcon, TrashIcon, RefreshCw, Plus, Check, Info, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

// Define common food units
const COMMON_UNITS = [
  "none", // Replace empty string with "none"
  "kg",
  "g",
  "lb",
  "oz",
  "l",
  "ml",
  "cup",
  "tbsp",
  "tsp",
  "piece",
  "pack",
  "can",
  "bottle",
  "box",
  "bunch"
];

// Extend the ShoppingListItem interface to include category and checked properties
interface ExtendedShoppingListItem extends ShoppingListItem {
  category?: string;
  checked?: boolean;
}

export default function ShoppingList() {
  const { 
    items: originalItems, 
    loading, 
    error, 
    fetchShoppingList, 
    addShoppingListItem, 
    updateShoppingListItem, 
    deleteShoppingListItem,
    clearShoppingList
  } = useShoppingList()
  
  // State to track checked items
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Convert original items to extended items with category and checked properties
  const items: ExtendedShoppingListItem[] = originalItems.map(item => ({
    ...item,
    category: (item as any).category || 'Other',
    checked: checkedItems[item.id] || false
  }));
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newItem, setNewItem] = useState<NewShoppingListItem>({
    item_name: '',
    quantity: 1,
    unit: '',
    category: ''
  })
  const [formErrors, setFormErrors] = useState<FormErrors<NewShoppingListItem>>({})

  useEffect(() => {
    fetchShoppingList()
  }, [fetchShoppingList])

  // Toggle checked state for an item
  const toggleItemChecked = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Validate form input
  const validateForm = (item: NewShoppingListItem) => {
    const errors: FormErrors<NewShoppingListItem> = {}
    
    // Validate item name
    if (!item.item_name || item.item_name.trim() === '') {
      errors.item_name = 'Item name is required';
    } else if (item.item_name.trim().length < 2) {
      errors.item_name = 'Item name must be at least 2 characters';
    }
    
    // Validate quantity
    if (!item.quantity || item.quantity < 1) {
      errors.quantity = 'Quantity must be at least 1';
    }
    
    // Validate category
    if (!item.category) {
      // Set a default category rather than showing an error
      item.category = 'Other';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
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
      // Create a validated version of the new item with proper defaults
      const validatedItem: NewShoppingListItem = {
        item_name: newItem.item_name || '',
        quantity: newItem.quantity || 1,
        unit: newItem.unit || '',
        category: newItem.category || 'Other'
      };
      
      await addShoppingListItem(validatedItem)
      setNewItem({
        item_name: '',
        quantity: 1,
        unit: '',
        category: ''
      })
      setFormErrors({})
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

  const handleRefresh = async () => {
    try {
      await fetchShoppingList(true)
      setCheckedItems({}) // Reset checked items on refresh
      toast({
        title: "Refreshed",
        description: "Your shopping list has been refreshed.",
      })
    } catch (err) {
      // Error toast is handled in the hook
    }
  }

  const handleClearChecked = async () => {
    try {
      // Get IDs of checked items
      const checkedIds = Object.entries(checkedItems)
        .filter(([_, isChecked]) => isChecked)
        .map(([id]) => id);
      
      // Delete checked items one by one
      for (const id of checkedIds) {
        await deleteShoppingListItem(id);
      }
      
      // Clear checked items state
      setCheckedItems({});
      
      toast({
        title: "Success",
        description: "Checked items cleared successfully!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to clear checked items: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-12 w-full mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <h3 className="font-bold text-lg text-red-800 mb-2">Error Loading Shopping List</h3>
            <p className="mb-4 text-red-700">{error.message}</p>
            <Button 
              onClick={handleRefresh} 
              variant="destructive"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Count checked and unchecked items
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const uncheckedCount = items.length - checkedCount;

  return (
    <div className="space-y-6">
      {/* Shopping List Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <h3 className="text-2xl font-bold">{items.length}</h3>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Shopping</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {uncheckedCount} items remaining
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Purchased</p>
                <h3 className="text-2xl font-bold">{checkedCount}</h3>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                <Check className="h-3 w-3 mr-1" />
                Done
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {checkedCount > 0 ? 'Items ready to clear' : 'Nothing purchased yet'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-t-4 border-t-blue-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New Item</h3>
            <div className="flex space-x-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {checkedCount > 0 && (
                <Button
                  onClick={handleClearChecked}
                  variant="outline"
                  size="sm"
                >
                  Clear Checked
                </Button>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <div className="space-y-2">
                  <label htmlFor="item_name" className="text-sm font-medium">
                    Item Name
                  </label>
                  <Input
                    id="item_name"
                    placeholder="Enter item name"
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    className={cn(formErrors.item_name && "border-red-500 focus-visible:ring-red-500")}
                    disabled={isSubmitting}
                  />
                  {formErrors.item_name && (
                    <p className="text-red-500 text-xs">{formErrors.item_name}</p>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantity
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Qty"
                    value={newItem.quantity}
                    min="1"
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className={cn(formErrors.quantity && "border-red-500 focus-visible:ring-red-500")}
                    disabled={isSubmitting}
                  />
                  {formErrors.quantity && (
                    <p className="text-red-500 text-xs">{formErrors.quantity}</p>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-1">
                <div className="space-y-2">
                  <label htmlFor="unit" className="text-sm font-medium">
                    Unit
                  </label>
                  {(() => {
                    try {
                      return (
                        <Select 
                          value={newItem.unit || "none"}
                          onValueChange={(value) => setNewItem({ ...newItem, unit: value === "none" ? "" : value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="unit">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_UNITS.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit === "none" ? "None" : unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    } catch (error) {
                      console.error("Error rendering unit select:", error);
                      toast({
                        variant: "destructive",
                        title: "UI Error",
                        description: "Failed to render unit selection"
                      });
                      return <div className="text-red-500">Error loading units</div>;
                    }
                  })()}
                </div>
              </div>
              
              <div className="md:col-span-3">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  {(() => {
                    try {
                      return (
                        <Select 
                          value={newItem.category || "Other"} 
                          onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_CATEGORIES.map(category => {
                              const style = getCategoryStyles(category);
                              return (
                                <SelectItem 
                                  key={category} 
                                  value={category || "Other"}
                                  className="flex items-center"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${style.bg}`}></div>
                                    {category || "Other"}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      );
                    } catch (error) {
                      console.error("Error rendering category select:", error);
                      toast({
                        variant: "destructive",
                        title: "UI Error",
                        description: "Failed to render category selection"
                      });
                      return <div className="text-red-500">Error loading categories</div>;
                    }
                  })()}
                  {newItem.category && (
                    <div className="mt-2">
                      <CategoryBadge category={newItem.category} className="text-xs" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Shopping List</h3>
          {renderShoppingItems(items, (id) => {
            toggleItemChecked(id);
          }, (id) => {
            deleteShoppingListItem(id);
          })}
        </CardContent>
      </Card>
    </div>
  )
}

// Render shopping list items
function renderShoppingItems(
  items: ExtendedShoppingListItem[], 
  handleChecked: (id: string) => void, 
  deleteItemHandler: (id: string) => void
) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <ShoppingBagIcon className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Your shopping list is empty</h3>
        <p className="mt-1 text-sm text-gray-500">Add items to your shopping list to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {items.map((item) => {
        const category = item.category || 'Other';
        const categoryStyle = getCategoryStyles(category);
        const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
        const colorName = colorMatch ? colorMatch[1] : 'gray';
        const borderClass = `border-l-4 border-${colorName}-300`;
        
        return (
          <div 
            key={item.id} 
            className={`relative rounded-md border group transition-all ${borderClass} ${
              item.checked ? "bg-gray-50" : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="py-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={() => handleChecked(item.id)}
                  className={item.checked ? "bg-green-500 border-green-500" : ""}
                />
                <div>
                  <label
                    htmlFor={`item-${item.id}`}
                    className={`text-sm font-medium ${
                      item.checked ? "line-through text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {item.item_name}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-gray-50 hover:bg-gray-100"
                    >
                      Qty: {item.quantity} {item.unit}
                    </Badge>
                    <CategoryBadge category={category} className="text-[10px] px-1.5 py-0" />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteItemHandler(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <TrashIcon className="h-4 w-4 text-gray-500 hover:text-red-500" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${colorName ? `bg-${colorName}-300` : "bg-gray-300"}`}></div>
          </div>
        );
      })}
    </div>
  )
} 