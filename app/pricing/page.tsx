import { SubscriptionPlansView } from "@/components/pricing/subscription-plans-view"

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container px-4 py-8 pb-20 md:pb-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">Subscription Plans</h1>
        <p className="mb-8 text-center text-gray-500">Choose the plan that's right for you</p>
        <SubscriptionPlansView />
      </div>
    </main>
  )
}

