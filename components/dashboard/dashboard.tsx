"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MealOfTheDay } from "@/components/dashboard/meal-of-the-day"
import { ExpiryAlerts } from "@/components/dashboard/expiry-alerts"
import { PremiumModal } from "@/components/premium-modal"
import { ChefHat, Calendar, RefreshCw, ShoppingBag, Refrigerator, Utensils } from "lucide-react"
import { useRouter } from "next/navigation"
import { useInventory } from "@/hooks/useInventory"
import { useMealPlans } from "@/hooks/useMealPlans"
import { useShoppingList } from "@/hooks/useShoppingList"
import { Skeleton } from "@/components/ui/skeleton"
import { HookError } from "@/lib/api/types"
import { CategoryBadge, getCategoryStyles } from "@/components/ui/category-badge"
import { Badge } from "@/components/ui/badge"

export function Dashboard() {
  const router = useRouter()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumMessage, setPremiumMessage] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expiringItemsCount, setExpiringItemsCount] = useState(0)

  // Get data from all three hooks
  const { 
    items: inventoryItems, 
    loading: inventoryLoading, 
    error: inventoryError, 
    fetchInventory 
  } = useInventory()
  
  const { 
    items: shoppingItems, 
    loading: shoppingLoading, 
    error: shoppingError, 
    fetchShoppingList 
  } = useShoppingList()
  
  const { 
    meals, 
    mealsByDay,
    loading: mealsLoading, 
    error: mealsError, 
    fetchMealPlans 
  } = useMealPlans()

  // Combined loading state
  const isLoading = inventoryLoading || shoppingLoading || mealsLoading

  // Error state
  const hasError = Boolean(inventoryError || shoppingError || mealsError)
  
  const handlePremiumPrompt = (message: string) => {
    setPremiumMessage(message)
    setShowPremiumModal(true)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchInventory(), fetchShoppingList(), fetchMealPlans()])
    setIsRefreshing(false)
  }

  // Calculate expiring items count inside useEffect
  useEffect(() => {
    if (inventoryItems) {
      const today = new Date();
      const count = inventoryItems.filter(item => {
        const expiryDate = new Date(item.expiry_date)
        const diffTime = expiryDate.getTime() - today.getTime()
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return daysLeft >= 0 && daysLeft <= 3
      }).length;
      
      setExpiringItemsCount(count);
    }
  }, [inventoryItems]);

  // Create a state variable for formatted inventory items with dates
  const [formattedInventoryItems, setFormattedInventoryItems] = useState<Array<any>>([]);
  
  // Format dates in useEffect to avoid hydration mismatch
  useEffect(() => {
    if (inventoryItems) {
      const formatted = inventoryItems.slice(0, 5).map(item => ({
        ...item,
        formattedDate: new Date(item.expiry_date).toLocaleDateString()
      }));
      setFormattedInventoryItems(formatted);
    }
  }, [inventoryItems]);

  return (
    <div className="container px-4 py-8 pb-20 md:pb-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Kitchen Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome back! Here's what's happening in your kitchen today.</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Skeleton loaders for all three sections */}
          <Card className="h-full">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-2/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-2/3 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="h-full md:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-2/3 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : hasError ? (
        <div className="grid grid-cols-1 gap-6">
          <Card className="h-full">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold">Something went wrong</h3>
                <p className="text-sm mt-2">
                  {inventoryError?.message || shoppingError?.message || mealsError?.message || "Couldn't load dashboard data"}
                </p>
              </div>
              <Button onClick={handleRefresh} className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Inventory Section */}
          <Card 
            className="h-full relative group transition-all duration-200 hover:shadow-md cursor-pointer"
            onClick={() => router.push("/inventory")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Refrigerator className="mr-2 h-5 w-5 text-blue-600" />
                Inventory Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryItems && inventoryItems.length > 0 ? (
                <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {formattedInventoryItems.map(item => {
                    const categoryStyle = getCategoryStyles(item.category);
                    const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
                    const colorName = colorMatch ? colorMatch[1] : 'gray';
                    const borderClass = `border-l-4 border-${colorName}-300`;
                    
                    return (
                      <li key={item.id} className={`p-3 bg-gray-50 rounded-md flex justify-between items-center ${borderClass} hover:bg-gray-100 transition-colors`}>
                        <div>
                          <span className="font-medium">{item.item_name}</span>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span>{item.quantity}</span>
                            <CategoryBadge category={item.category} className="text-[10px] px-1.5 py-0" />
                          </div>
                        </div>
                        <div className="text-sm">
                          {item.formattedDate}
                        </div>
                      </li>
                    );
                  })}
                  {inventoryItems.length > 5 && (
                    <div className="mt-3 flex justify-center">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer">
                        View all {inventoryItems.length} items
                      </Badge>
                    </div>
                  )}
                </ul>
              ) : (
                <div className="py-6 text-center">
                  <div className="rounded-full bg-blue-100 p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Refrigerator className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No fridge items yet!</h3>
                  <p className="text-sm text-gray-500 mt-1">Add items to your inventory to start tracking what you have.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/inventory");
                    }}
                  >
                    Add Inventory Items
                  </Button>
                </div>
              )}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-200 transition-colors pointer-events-none"></div>
            </CardContent>
          </Card>

          {/* Shopping List Section */}
          <Card 
            className="h-full relative group transition-all duration-200 hover:shadow-md cursor-pointer"
            onClick={() => router.push("/shopping-list")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5 text-green-600" />
                Shopping List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shoppingItems && shoppingItems.length > 0 ? (
                <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {shoppingItems.slice(0, 5).map(item => {
                    const category = (item as any).category || 'Other';
                    const categoryStyle = getCategoryStyles(category);
                    const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
                    const colorName = colorMatch ? colorMatch[1] : 'gray';
                    const borderClass = `border-l-4 border-${colorName}-300`;
                    
                    return (
                      <li key={item.id} className={`p-3 bg-gray-50 rounded-md flex justify-between items-center ${borderClass} hover:bg-gray-100 transition-colors`}>
                        <div>
                          <span className="font-medium">{item.item_name}</span>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span>Qty: {item.quantity} {item.unit}</span>
                            {category && <CategoryBadge category={category} className="text-[10px] px-1.5 py-0" />}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                  {shoppingItems.length > 5 && (
                    <div className="mt-3 flex justify-center">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer">
                        View all {shoppingItems.length} items
                      </Badge>
                    </div>
                  )}
                </ul>
              ) : (
                <div className="py-6 text-center">
                  <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Your shopping list is empty!</h3>
                  <p className="text-sm text-gray-500 mt-1">Add items to your shopping list to keep track of what you need.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/shopping-list");
                    }}
                  >
                    Create Shopping List
                  </Button>
                </div>
              )}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-green-200 transition-colors pointer-events-none"></div>
            </CardContent>
          </Card>

          {/* Meal Plans Section */}
          <Card 
            className="h-full md:col-span-2 lg:col-span-1 relative group transition-all duration-200 hover:shadow-md cursor-pointer"
            onClick={() => router.push("/meal-planner")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Utensils className="mr-2 h-5 w-5 text-orange-600" />
                Meal Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meals && meals.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(mealsByDay)
                    .filter(([_, dayMeals]) => dayMeals.length > 0)
                    .slice(0, 3)
                    .map(([day, dayMeals]) => (
                      <div key={day} className="bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors">
                        <div className="font-medium mb-1 flex items-center justify-between">
                          <span>{day}</span>
                          <Badge className="bg-orange-100 text-orange-800">{dayMeals.length} meals</Badge>
                        </div>
                        <ul className="space-y-1">
                          {dayMeals.map(meal => {
                            const category = (meal as any).category || '';
                            const categoryStyle = getCategoryStyles(meal.meal_name);
                            const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
                            const colorName = colorMatch ? colorMatch[1] : 'gray';
                            const borderClass = `border-l-2 border-${colorName}-300 pl-2 rounded`;
                            
                            return (
                              <li key={meal.id} className={`text-sm flex justify-between items-center ${borderClass}`}>
                                <div className="flex items-center gap-2">
                                  <span>{meal.meal_name}</span>
                                  {category && <CategoryBadge category={category} className="text-[10px] px-1.5 py-0" />}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  <div className="mt-3 flex justify-center">
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors cursor-pointer">
                      View all meal plans
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="rounded-full bg-orange-100 p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Utensils className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No meals planned yet!</h3>
                  <p className="text-sm text-gray-500 mt-1">Plan your meals for the week to stay organized.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/meal-planner");
                    }}
                  >
                    Plan Meals
                  </Button>
                </div>
              )}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-orange-200 transition-colors pointer-events-none"></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Specialized Components */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* What's Expiring Soon */}
        <Card className="h-full relative group transition-all duration-200 hover:shadow-md">
          <CardContent className="p-0">
            <ExpiryAlerts />
          </CardContent>
          <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-red-200 transition-colors pointer-events-none"></div>
        </Card>

        {/* Meal of the Day */}
        <Card className="h-full relative group transition-all duration-200 hover:shadow-md">
          <CardContent className="p-0">
            <MealOfTheDay onPremiumPrompt={handlePremiumPrompt} />
          </CardContent>
          <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-emerald-200 transition-colors pointer-events-none"></div>
        </Card>
      </div>

      {/* CTA Buttons */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Button
          size="lg"
          className="h-16 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:shadow-lg"
          onClick={() => router.push("/recipes")}
        >
          <ChefHat className="mr-2 h-5 w-5" />
          View Recipe Suggestions
        </Button>
        <Button
          size="lg"
          className="h-16 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all duration-300 hover:shadow-lg"
          onClick={() => router.push("/meal-planner")}
        >
          <Calendar className="mr-2 h-5 w-5" />
          Plan Weekly Meals
          {expiringItemsCount > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {expiringItemsCount} expiring
            </span>
          )}
        </Button>
      </div>

      {showPremiumModal && (
        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} message={premiumMessage} />
      )}
    </div>
  )
}

