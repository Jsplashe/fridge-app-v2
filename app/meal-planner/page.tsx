'use client'

import { useSearchParams } from 'next/navigation'
import { MealPlannerView } from "@/components/meal-planner/meal-planner-view"
import MealPlanner from "@/components/MealPlanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ListChecks } from "lucide-react"
import { useEffect, useState } from "react"

export default function MealPlannerPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("calendar")
  
  useEffect(() => {
    // Set active tab based on query parameter
    const view = searchParams.get('view')
    if (view === 'list') {
      setActiveTab("list")
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-white">
      <div className="container px-4 py-8 pb-20 md:pb-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Meal Planner</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <ListChecks className="h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            <MealPlannerView />
          </TabsContent>
          
          <TabsContent value="list">
            <div className="bg-gray-50 p-6 rounded-lg">
              <MealPlanner />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

