"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles, CreditCard, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PremiumModal } from "@/components/premium-modal"

interface PlanFeature {
  name: string
  included: boolean
}

interface Plan {
  name: string
  price: string
  description: string
  features: PlanFeature[]
  popular?: boolean
}

export function SubscriptionPlansView() {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const plans: Plan[] = [
    {
      name: "Free",
      price: "$0",
      description: "Basic features for personal use",
      features: [
        { name: "Basic inventory management", included: true },
        { name: "Manual item entry", included: true },
        { name: "Limited recipe swipes (5/day)", included: true },
        { name: "Basic shopping list", included: true },
        { name: "AI Inventory Sync", included: false },
        { name: "Receipt & barcode scanning", included: false },
        { name: "Unlimited recipe swipes", included: false },
        { name: "Advanced meal planning", included: false },
        { name: "Multi-user household", included: false },
      ],
    },
    {
      name: "Premium",
      price: "$9.99",
      description: "Advanced features for serious home cooks",
      popular: true,
      features: [
        { name: "Basic inventory management", included: true },
        { name: "Manual item entry", included: true },
        { name: "Limited recipe swipes (5/day)", included: true },
        { name: "Basic shopping list", included: true },
        { name: "AI Inventory Sync", included: true },
        { name: "Receipt & barcode scanning", included: true },
        { name: "Unlimited recipe swipes", included: true },
        { name: "Advanced meal planning", included: true },
        { name: "Multi-user household", included: true },
      ],
    },
  ]

  const handleUpgrade = () => {
    setIsUpgrading(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsUpgrading(false)
      setShowPremiumModal(true)
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative overflow-hidden ${plan.popular ? "border-emerald-200 shadow-lg" : ""}`}
          >
            {plan.popular && (
              <div className="absolute right-0 top-0">
                <Badge className="rounded-bl-md rounded-tr-md rounded-br-none rounded-tl-none bg-emerald-500 px-3 py-1 text-white">
                  <Sparkles className="mr-1 h-3 w-3" />
                  POPULAR
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.name === "Premium" && <span className="ml-1 text-gray-500">/month</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    {feature.included ? (
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    ) : (
                      <X className="mr-2 h-5 w-5 flex-shrink-0 text-gray-300" />
                    )}
                    <span className={feature.included ? "" : "text-gray-400"}>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.name === "Free" ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full" onClick={handleUpgrade} disabled={isUpgrading}>
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
        <p>All plans include a 14-day free trial. No credit card required to start.</p>
        <p className="mt-1">Questions? Contact our support team at support@fridgeapp.com</p>
      </div>

      {showPremiumModal && (
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          message="Thank you for upgrading to Premium! Enjoy all the advanced features of FRiDGE."
        />
      )}
    </div>
  )
}

