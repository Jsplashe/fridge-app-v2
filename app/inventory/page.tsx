import { InventoryList } from "@/components/InventoryList"

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container px-4 py-8 pb-20 md:pb-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Inventory</h1>
        <InventoryList />
      </div>
    </main>
  )
} 