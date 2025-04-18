"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  CheckCircle
} from "lucide-react"
import { useInventory } from "@/hooks/useInventory"
import { useMealPlans } from "@/hooks/useMealPlans"
import { useShoppingList } from "@/hooks/useShoppingList"

// Define types for chart data
interface ChartData {
  categories: string[];
  percentages: number[];
}

interface TimeSeriesData {
  months: string[];
  percentages: number[];
}

interface SpendingData {
  months: string[];
  amounts: number[];
}

interface StatCard {
  title: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down';
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("consumption")
  const [isLoading, setIsLoading] = useState(true)
  
  // Get data from hooks
  const { items: inventoryItems, loading: inventoryLoading } = useInventory()
  const { meals, loading: mealsLoading } = useMealPlans()
  const { items: shoppingItems, loading: shoppingLoading } = useShoppingList()
  
  // Sample data for charts
  const [consumptionData, setConsumptionData] = useState<ChartData>({
    categories: [],
    percentages: []
  })
  
  const [wasteData] = useState<TimeSeriesData>({
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    percentages: [5, 8, 6, 4, 3, 2]
  })
  
  const [spendingData] = useState<SpendingData>({
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    amounts: [120, 150, 135, 180, 160, 145]
  })

  useEffect(() => {
    // Set loading state based on all data sources
    setIsLoading(inventoryLoading || mealsLoading || shoppingLoading)
    
    // Process inventory data for consumption analytics
    if (inventoryItems && inventoryItems.length > 0) {
      // Group items by category and calculate percentages
      const categoryCount: Record<string, number> = inventoryItems.reduce((acc: Record<string, number>, item) => {
        const category = item.category || "Other"
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})
      
      const total = Object.values(categoryCount).reduce((sum, count) => sum + count, 0)
      
      const categories = Object.keys(categoryCount)
      const percentages = categories.map(category => 
        Math.round((categoryCount[category] / total) * 100)
      )
      
      setConsumptionData({
        categories,
        percentages
      })
    }
  }, [inventoryItems, inventoryLoading, mealsLoading, shoppingLoading])

  // Function to render a placeholder chart (in a real app, you'd use a charting library)
  const renderBarChart = (data: ChartData, title: string) => (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="h-64 bg-slate-50 rounded-md p-4 relative">
        <div className="flex h-full items-end justify-around gap-2">
          {data.categories.map((category, i) => (
            <div key={category} className="relative flex flex-col items-center">
              <div 
                className="w-16 bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all"
                style={{ height: `${data.percentages[i]}%` }}
              ></div>
              <span className="text-xs mt-2 text-center">{category}</span>
            </div>
          ))}
        </div>
        <div className="absolute left-0 top-0 h-full border-r border-gray-200"></div>
        <div className="absolute left-0 bottom-0 w-full border-t border-gray-200"></div>
      </div>
    </div>
  )
  
  const renderLineChart = (data: TimeSeriesData | SpendingData, title: string) => (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="h-64 bg-slate-50 rounded-md p-4 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Chart visualization would appear here</p>
        </div>
      </div>
    </div>
  )
  
  const renderPieChart = (data: ChartData, title: string) => (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="h-64 bg-slate-50 rounded-md p-4 relative flex items-center justify-center">
        <div className="relative w-40 h-40 rounded-full bg-gray-200 overflow-hidden">
          {data.categories.map((category, i) => {
            const offset = data.percentages.slice(0, i).reduce((sum, p) => sum + p, 0)
            return (
              <div 
                key={category}
                className={`absolute w-full h-full bg-blue-${300 + i * 100}`}
                style={{ 
                  clipPath: `polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)`,
                  transform: `rotate(${offset * 3.6}deg)`
                }}
              ></div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // Stats cards for the dashboard
  const statsCards: StatCard[] = [
    {
      title: "Total Items Tracked",
      value: inventoryItems?.length || 0,
      change: "+12%",
      trend: "up"
    },
    {
      title: "Meals Planned",
      value: meals?.length || 0,
      change: "+5%",
      trend: "up"
    },
    {
      title: "Food Waste",
      value: "2.3 kg",
      change: "-8%",
      trend: "down"
    },
    {
      title: "Grocery Spending",
      value: "$165",
      change: "+3%",
      trend: "up"
    }
  ]

  return (
    <div className="container space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kitchen Analytics</h1>
          <p className="text-gray-500">Insights about your food consumption and kitchen habits</p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`flex items-center ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>
            Track your food consumption patterns, waste reduction progress, and spending habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="consumption" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Food Consumption
              </TabsTrigger>
              <TabsTrigger value="waste" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Waste Reduction
              </TabsTrigger>
              <TabsTrigger value="spending" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                Spending Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="consumption" className="mt-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderPieChart(consumptionData, "Food Categories Distribution")}
                {renderBarChart(consumptionData, "Consumption by Category")}
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p>The data shows that <strong>Vegetables</strong> and <strong>Proteins</strong> make up the largest portions of your diet, which aligns with a balanced nutritional profile.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="waste" className="mt-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderLineChart(wasteData, "Monthly Food Waste Trends")}
                {renderBarChart({
                  categories: ["Expired", "Spoiled", "Leftovers", "Unused"],
                  percentages: [40, 25, 20, 15]
                }, "Waste by Cause")}
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p>Your food waste has been steadily decreasing over the past 6 months. The main cause of waste remains expired items.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="spending" className="mt-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderLineChart(spendingData, "Monthly Grocery Spending")}
                {renderPieChart({
                  categories: ["Fresh Produce", "Meat/Fish", "Dairy", "Pantry", "Other"],
                  percentages: [30, 25, 15, 20, 10]
                }, "Spending by Category")}
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p>Your average monthly grocery spending is <strong>$148</strong>. April saw higher spending due to holiday preparations.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Time Period Selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Time Period:</span>
          <Button variant="outline" size="sm" className="h-8">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Last 6 Months
          </Button>
        </div>
      </div>
    </div>
  )
} 