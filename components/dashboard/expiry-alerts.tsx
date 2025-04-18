"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Search, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InventoryItemModal } from "@/components/inventory/inventory-item-modal"
import { useInventory } from "@/hooks/useInventory"
import { InventoryItem } from "@/lib/api/inventory"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface ExpiryDisplayItem extends InventoryItem {
  daysLeft: number
}

export function ExpiryAlerts() {
  const { items, loading, error, fetchInventory } = useInventory()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<ExpiryDisplayItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expiringItems, setExpiringItems] = useState<ExpiryDisplayItem[]>([])
  const [formattedExpiringItems, setFormattedExpiringItems] = useState<Array<any>>([])

  useEffect(() => {
    if (items && items.length > 0) {
      // Calculate days left for each item and sort by expiry date
      const today = new Date()
      const itemsWithDaysLeft = items.map(item => {
        const expiryDate = new Date(item.expiry_date)
        const diffTime = expiryDate.getTime() - today.getTime()
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        return {
          ...item,
          daysLeft
        }
      })
      .filter(item => item.daysLeft >= 0 && item.daysLeft <= 7) // Show items expiring within a week
      .sort((a, b) => a.daysLeft - b.daysLeft) // Sort by days left ascending

      setExpiringItems(itemsWithDaysLeft)
    } else {
      setExpiringItems([])
    }
  }, [items])
  
  // Format dates in a separate useEffect to avoid hydration mismatch
  useEffect(() => {
    const formattedItems = expiringItems.map(item => ({
      ...item,
      formattedDate: new Date(item.expiry_date).toLocaleDateString()
    }));
    setFormattedExpiringItems(formattedItems);
  }, [expiringItems]);

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft <= 1) return "bg-red-100 text-red-800"
    if (daysLeft <= 3) return "bg-orange-100 text-orange-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const filteredItems = formattedExpiringItems.filter((item) => 
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleItemClick = (item: ExpiryDisplayItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleAddItem = () => {
    // Use Next.js router instead of window.location
    router.push("/inventory")
  }

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
              What's Expiring Soon
            </CardTitle>
            <CardDescription>Items that need to be used soon</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddItem}
            className="hover:bg-orange-100 hover:text-orange-900 transition-colors"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              className="pl-8 focus-visible:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-md border p-3">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center rounded-md bg-red-50 border border-red-200">
            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Error loading inventory items</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 hover:bg-red-100" 
              onClick={() => fetchInventory()}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Retry
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-100">
            {searchQuery ? (
              <>
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No matching items found</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No items expiring soon</p>
                <p className="text-xs text-gray-500 mt-1">Items expiring within 7 days will appear here</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-gray-50 transition-colors hover:shadow-sm active:bg-gray-100"
                onClick={() => handleItemClick(item)}
              >
                <div>
                  <p className="font-medium">{item.item_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0 font-normal">
                      Qty: {item.quantity}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Expires: {item.formattedDate}
                    </p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(item.daysLeft)} ml-2 transition-transform hover:scale-105`}>
                  <Clock className="mr-1 h-3 w-3" />
                  {item.daysLeft} {item.daysLeft === 1 ? "day" : "days"}
                </Badge>
              </div>
            ))}
            
            {filteredItems.length > 0 && (
              <div className="pt-2 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                  onClick={() => router.push("/inventory?filter=expiring")}
                >
                  View all expiring items
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {selectedItem && (
        <InventoryItemModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          item={{
            id: selectedItem.id,
            name: selectedItem.item_name,
            expiryDate: selectedItem.expiry_date,
            daysLeft: selectedItem.daysLeft,
            quantity: selectedItem.quantity,
            unit: "",
            category: selectedItem.category
          }} 
        />
      )}
    </>
  )
}

