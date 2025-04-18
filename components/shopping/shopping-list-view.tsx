"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, ShoppingCart, RefreshCw, Share2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ShoppingItem {
  id: string
  name: string
  completed: boolean
  suggested: boolean
  category: string
}

export function ShoppingListView() {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: "1", name: "Milk", completed: false, suggested: true, category: "Dairy" },
    { id: "2", name: "Bread", completed: false, suggested: true, category: "Bakery" },
    { id: "3", name: "Eggs", completed: false, suggested: true, category: "Dairy" },
    { id: "4", name: "Tomatoes", completed: true, suggested: false, category: "Produce" },
    { id: "5", name: "Chicken Breast", completed: false, suggested: true, category: "Meat" },
    { id: "6", name: "Pasta", completed: false, suggested: false, category: "Pantry" },
    { id: "7", name: "Onions", completed: false, suggested: false, category: "Produce" },
    { id: "8", name: "Garlic", completed: false, suggested: false, category: "Produce" },
  ])

  const [newItem, setNewItem] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddItem = () => {
    if (newItem.trim()) {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        name: newItem,
        completed: false,
        suggested: false,
        category: "Other",
      }
      setItems([...items, item])
      setNewItem("")
    }
  }

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate fetching data from Supabase
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  // Group items by category
  const categories = [...new Set(items.map((item) => item.category))]

  const suggestedItems = items.filter((item) => item.suggested)
  const activeItems = items.filter((item) => !item.completed)
  const completedItems = items.filter((item) => item.completed)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Your shopping list with auto-suggested items</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Sync
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Shopping List
          </CardTitle>
          <CardDescription>Items you need to buy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Add item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
              <TabsTrigger value="suggested">Suggested ({suggestedItems.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedItems.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-4">
                {categories.map((category) => {
                  const categoryItems = items.filter((item) => item.category === category)
                  if (categoryItems.length === 0) return null

                  return (
                    <div key={category}>
                      <h3 className="mb-2 font-medium text-gray-700">{category}</h3>
                      <div className="space-y-2">{categoryItems.map((item) => renderItem(item))}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="suggested">
              <div className="space-y-2">
                {suggestedItems.length > 0 ? (
                  suggestedItems.map((item) => renderItem(item))
                ) : (
                  <p className="text-center text-gray-500">No suggested items</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-2">
                {completedItems.length > 0 ? (
                  completedItems.map((item) => renderItem(item))
                ) : (
                  <p className="text-center text-gray-500">No completed items</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-xs text-gray-500">
            <p>Real-time updates via Convex • Shared with 2 household members</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  function renderItem(item: ShoppingItem) {
    return (
      <div key={item.id} className="flex items-center space-x-2 rounded-md border p-2">
        <Checkbox id={`item-${item.id}`} checked={item.completed} onCheckedChange={() => toggleItem(item.id)} />
        <label htmlFor={`item-${item.id}`} className={`flex-1 ${item.completed ? "text-gray-400 line-through" : ""}`}>
          {item.name}
        </label>
        {item.suggested && (
          <Badge className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">Suggested</Badge>
        )}
      </div>
    )
  }
}

