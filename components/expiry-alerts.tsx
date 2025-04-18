"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock } from "lucide-react"

interface ExpiryItem {
  id: string
  name: string
  expiryDate: string
  daysLeft: number
}

export function ExpiryAlerts() {
  const expiringItems: ExpiryItem[] = [
    { id: "1", name: "Milk", expiryDate: "2025-03-23", daysLeft: 2 },
    { id: "2", name: "Chicken Breast", expiryDate: "2025-03-24", daysLeft: 3 },
    { id: "3", name: "Spinach", expiryDate: "2025-03-22", daysLeft: 1 },
  ]

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft <= 1) return "bg-red-100 text-red-800"
    if (daysLeft <= 3) return "bg-orange-100 text-orange-800"
    return "bg-yellow-100 text-yellow-800"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
          Expiry Alerts
        </CardTitle>
        <CardDescription>Items that need to be used soon</CardDescription>
      </CardHeader>
      <CardContent>
        {expiringItems.length === 0 ? (
          <p className="text-center text-gray-500">No items expiring soon</p>
        ) : (
          <div className="space-y-3">
            {expiringItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                </div>
                <Badge className={getStatusColor(item.daysLeft)}>
                  <Clock className="mr-1 h-3 w-3" />
                  {item.daysLeft} {item.daysLeft === 1 ? "day" : "days"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

