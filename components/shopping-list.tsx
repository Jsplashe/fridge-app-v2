"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, ShoppingCart } from "lucide-react"

interface ShoppingItem {
  id: string
  name: string
  completed: boolean
  suggested: boolean
}

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: "1", name: "Milk", completed: false, suggested: true },
    { id: "2", name: "Bread", completed: false, suggested: true },
    { id: "3", name: "Eggs", completed: false, suggested: true },
    { id: "4", name: "Tomatoes", completed: true, suggested: false },
  ])

  const [newItem, setNewItem] = useState("")

  const handleAddItem = () => {
    if (newItem.trim()) {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        name: newItem,
        completed: false,
        suggested: false,
      }
      setItems([...items, item])
      setNewItem("")
    }
  }

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Shopping List
        </CardTitle>
        <CardDescription>Items you need to buy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
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

        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2 rounded-md border p-2">
              <Checkbox id={`item-${item.id}`} checked={item.completed} onCheckedChange={() => toggleItem(item.id)} />
              <label
                htmlFor={`item-${item.id}`}
                className={`flex-1 ${item.completed ? "text-gray-400 line-through" : ""}`}
              >
                {item.name}
              </label>
              {item.suggested && (
                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">Suggested</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

