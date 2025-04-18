'use client'

import ShoppingList from "@/components/ShoppingList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Clipboard } from "lucide-react"

export default function ShoppingListPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container px-4 py-8 pb-20 md:pb-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Shopping List</h1>
        
        <Tabs defaultValue="active" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="active" className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              Active Items
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Clipboard className="h-4 w-4" />
              Shopping History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Manage your shopping list. Add items, check them off as you shop, and keep track of what you need.
              </p>
              <ShoppingList />
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Shopping History</h2>
                <p className="text-gray-600">
                  View your shopping history and frequently purchased items.
                </p>
              </div>
              <div className="text-center py-10 text-gray-500">
                <Clipboard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Shopping history will be available in a future update</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

