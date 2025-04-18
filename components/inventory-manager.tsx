"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, Trash2, Apple, Carrot, Egg, ChevronsUpIcon as Cheese } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  expiryDate: string
}

interface InventoryManagerProps {
  onPremiumPrompt: (message: string) => void
}

export function InventoryManager({ onPremiumPrompt }: InventoryManagerProps) {
  const [items, setItems] = useState<InventoryItem[]>([
    { id: "1", name: "Apples", category: "Fruit", quantity: 5, expiryDate: "2025-03-28" },
    { id: "2", name: "Milk", category: "Dairy", quantity: 1, expiryDate: "2025-03-25" },
    { id: "3", name: "Chicken Breast", category: "Meat", quantity: 2, expiryDate: "2025-03-24" },
    { id: "4", name: "Carrots", category: "Vegetable", quantity: 8, expiryDate: "2025-03-30" },
    { id: "5", name: "Eggs", category: "Dairy", quantity: 12, expiryDate: "2025-04-05" },
  ])

  const [newItem, setNewItem] = useState("")

  const handleAddItem = () => {
    if (newItem.trim()) {
      const item: InventoryItem = {
        id: Date.now().toString(),
        name: newItem,
        category: "Other",
        quantity: 1,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }
      setItems([...items, item])
      setNewItem("")
    }
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleScanReceipt = () => {
    onPremiumPrompt("Want AI to auto-update your inventory? Upgrade to Premium.")
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Fruit":
        return <Apple className="h-4 w-4" />
      case "Vegetable":
        return <Carrot className="h-4 w-4" />
      case "Dairy":
        return <Cheese className="h-4 w-4" />
      default:
        return <Egg className="h-4 w-4" />
    }
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Smart Inventory Manager</span>
          <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700">
            {items.length} items
          </Badge>
        </CardTitle>
        <CardDescription>Keep track of what's in your fridge</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="receipt">Receipt Scan</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <div className="flex space-x-2">
              <Input
                placeholder="Add new item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="receipt">
            <Button className="w-full" variant="outline" onClick={handleScanReceipt}>
              <Upload className="mr-2 h-4 w-4" /> Scan Receipt
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border p-2">
              <div className="flex items-center">
                <div className="mr-2 rounded-full bg-emerald-100 p-1">{getCategoryIcon(item.category)}</div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>{item.quantity}</Badge>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

