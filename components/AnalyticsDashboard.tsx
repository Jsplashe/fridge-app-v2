"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChartPie, 
  TrendingUp, 
  ShoppingCart, 
  Percent, 
  Package, 
  AlertTriangle,
  Leaf
} from "lucide-react"
import { useInventory } from "@/hooks/useInventory"
import { useSpendingData } from "@/hooks/useSpendingData"
import { Skeleton } from "@/components/ui/skeleton"
import { InventoryPieChart, PieChartDataPoint } from "@/components/analytics/InventoryPieChart"
import { SpendingTrends } from "@/components/charts/SpendingTrends"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export function AnalyticsDashboard() {
  const { items: inventoryItems, loading: inventoryLoading } = useInventory()
  const { data: spendingData, loading: spendingLoading, error: spendingError } = useSpendingData()
  
  // Calculate expiring items (mock - in production would use actual expiry dates)
  const expiringItems = inventoryItems?.filter(item => Math.random() > 0.8)?.length || 0
  
  // Calculate total spending for this month
  const currentMonthSpending = spendingData.reduce((total, week) => total + week.spent, 0)
  
  // Calculate total waste
  const totalWaste = spendingData.reduce((total, week) => total + week.waste, 0)
  
  // Calculate savings (mock - would be based on real data in production)
  const estimatedSavings = totalWaste * 0.7 // Assume we could save 70% of waste
  
  // Summary cards data - updated to use real inventory data
  const summaryData = [
    {
      title: "Total Items Tracked",
      value: inventoryLoading ? "..." : inventoryItems.length.toString(),
      icon: <Package className="h-4 w-4" />,
      description: "items in inventory"
    },
    {
      title: "Expired This Week",
      value: inventoryLoading ? "..." : expiringItems.toString(),
      icon: <AlertTriangle className="h-4 w-4" />,
      description: "items need attention"
    },
    {
      title: "Grocery Spending",
      value: spendingLoading ? "..." : `$${currentMonthSpending.toFixed(0)}`,
      icon: <ShoppingCart className="h-4 w-4" />,
      description: "this month"
    },
    {
      title: "Estimated Cost Savings",
      value: spendingLoading ? "..." : `$${estimatedSavings.toFixed(0)}`,
      icon: <Percent className="h-4 w-4" />,
      description: "from reduced waste"
    }
  ]

  // Group inventory by category
  const inventoryByCategory = inventoryItems.reduce((acc, item) => {
    const category = item.category || "Other"
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Prepare pie chart data for Recharts
  const pieData: PieChartDataPoint[] = Object.entries(inventoryByCategory).map(
    ([name, value]) => ({ name, value })
  )

  // Insights based on inventory and spending data
  const insights = [
    inventoryItems.length > 10 
      ? `You're tracking ${inventoryItems.length} items in your inventory. Great job staying organized!` 
      : "Consider adding more items to your inventory to get better insights.",
    expiringItems > 0 
      ? `${expiringItems} items might expire soon. Check them out to reduce waste.` 
      : "No items are expiring soon - you're managing your inventory well!",
    spendingData.length > 0
      ? `Your food waste is approximately ${Math.round((totalWaste / currentMonthSpending) * 100)}% of your grocery spending. The average household wastes about 30%.`
      : "Track your grocery spending to see insights about food waste.",
    inventoryItems.length > 0 && Object.keys(inventoryByCategory).length > 0
      ? `Your inventory is primarily ${Object.entries(inventoryByCategory).sort((a, b) => b[1] - a[1])[0][0]} items (${Math.round((Object.entries(inventoryByCategory).sort((a, b) => b[1] - a[1])[0][1] / inventoryItems.length) * 100)}%). Consider diversifying your food choices.`
      : "Add categorized items to your inventory to see category distribution.",
    "Based on your shopping patterns, consider buying essentials in bulk to save money."
  ]

  // Render loading skeleton
  if (inventoryLoading && spendingLoading) {
    return (
      <div className="container space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>
      </div>

      {spendingError && (
        <Alert className="mb-4 border-amber-500 bg-amber-50 text-amber-800">
          <AlertTitle>Database Notice</AlertTitle>
          <AlertDescription>
            {spendingError}. This is a demo app - some features are using simulated data.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{item.value}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-700">
                  {item.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>📊 Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <InventoryPieChart data={pieData} />
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>📈 Spending vs. Waste Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {spendingLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <SpendingTrends data={spendingData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">Smart Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm list-disc pl-5 space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="text-gray-700">{insight}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 