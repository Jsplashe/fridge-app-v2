"use client"

import { useState } from "react"
import { InventoryManager } from "@/components/inventory-manager"
import { RecipeSwipe } from "@/components/recipe-swipe"
import { ShoppingList } from "@/components/shopping-list"
import { ExpiryAlerts } from "@/components/expiry-alerts"
import { FoodWasteScore } from "@/components/food-waste-score"
import { PremiumModal } from "@/components/premium-modal"

export function Dashboard() {
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumMessage, setPremiumMessage] = useState("")

  const handlePremiumPrompt = (message: string) => {
    setPremiumMessage(message)
    setShowPremiumModal(true)
  }

  return (
    <div className="container px-4 py-8 pb-20 md:pb-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">My Kitchen Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InventoryManager onPremiumPrompt={handlePremiumPrompt} />
        <RecipeSwipe onPremiumPrompt={handlePremiumPrompt} />
        <ShoppingList />
        <ExpiryAlerts />
        <FoodWasteScore />
      </div>

      {showPremiumModal && (
        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} message={premiumMessage} />
      )}
    </div>
  )
}

