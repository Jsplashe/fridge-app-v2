"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Apple, Carrot, Egg, ChevronsUpIcon as Cheese, RefreshCw } from "lucide-react"
import { CategoryBadge, getCategoryStyles } from "@/components/ui/category-badge"

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

  const [isLoading, setIsLoading] = useState(false)

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

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate fetching data from Supabase
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  // Group items by expiry date
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const expiringSoon = items.filter((item) => {
    const expiry = new Date(item.expiryDate)
    return expiry <= tomorrow
  })

  const expiringThisWeek = items.filter((item) => {
    const expiry = new Date(item.expiryDate)
    return expiry > tomorrow && expiry <= nextWeek
  })

  const others = items.filter((item) => {
    const expiry = new Date(item.expiryDate)
    return expiry > nextWeek
  })

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fridge Inventory</CardTitle>
            <CardDescription>Items in your fridge, grouped by expiry date</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="expiring-soon">Expiring Soon ({expiringSoon.length})</TabsTrigger>
            <TabsTrigger value="this-week">This Week ({expiringThisWeek.length})</TabsTrigger>
            <TabsTrigger value="others">Later ({others.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {expiringSoon.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-red-600">Expiring Soon</h3>
                  <div className="space-y-2">{expiringSoon.map((item) => renderItem(item))}</div>
                </div>
              )}

              {expiringThisWeek.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-orange-600">Expiring This Week</h3>
                  <div className="space-y-2">{expiringThisWeek.map((item) => renderItem(item))}</div>
                </div>
              )}

              {others.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-emerald-600">Later</h3>
                  <div className="space-y-2">{others.map((item) => renderItem(item))}</div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="expiring-soon">
            <div className="space-y-2">
              {expiringSoon.length > 0 ? (
                expiringSoon.map((item) => renderItem(item))
              ) : (
                <p className="text-center text-gray-500">No items expiring soon</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="this-week">
            <div className="space-y-2">
              {expiringThisWeek.length > 0 ? (
                expiringThisWeek.map((item) => renderItem(item))
              ) : (
                <p className="text-center text-gray-500">No items expiring this week</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="others">
            <div className="space-y-2">
              {others.length > 0 ? (
                others.map((item) => renderItem(item))
              ) : (
                <p className="text-center text-gray-500">No items expiring later</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-xs text-gray-500">
          <p>Data stored in Supabase SQL • Last updated 2 minutes ago</p>
        </div>
      </CardContent>
    </Card>
  )

  function renderItem(item: InventoryItem) {
    const expiryDate = new Date(item.expiryDate)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let badgeColor = "bg-emerald-100 text-emerald-800"
    if (diffDays <= 1) {
      badgeColor = "bg-red-100 text-red-800"
    } else if (diffDays <= 3) {
      badgeColor = "bg-orange-100 text-orange-800"
    } else if (diffDays <= 7) {
      badgeColor = "bg-yellow-100 text-yellow-800"
    }

    // Get category styling
    const categoryStyle = getCategoryStyles(item.category);
    const colorMatch = categoryStyle.border.match(/border-(\w+)-\d+/);
    const colorName = colorMatch ? colorMatch[1] : 'gray';
    const borderClass = `border-l-4 border-${colorName}-300`;

    return (
      <div key={item.id} className={`flex items-center justify-between rounded-md border p-2 ${borderClass}`}>
        <div className="flex items-center">
          <div className={`mr-2 rounded-full ${categoryStyle.bg} p-1`}>{getCategoryIcon(item.category)}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{item.name}</p>
              <CategoryBadge category={item.category} className="text-[10px] px-1.5 py-0" />
            </div>
            <p className="text-xs text-gray-500">Expires: {expiryDate.toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge>{item.quantity}</Badge>
          <Badge className={badgeColor}>
            {diffDays <= 0 ? "Today" : `${diffDays} day${diffDays === 1 ? "" : "s"}`}
          </Badge>
        </div>
      </div>
    )
  }
}

