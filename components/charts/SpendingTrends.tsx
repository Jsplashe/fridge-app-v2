"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts'
import { Card, CardContent } from "@/components/ui/card"

interface SpendingTrendsProps {
  data: { 
    week: string; 
    spent: number; 
    waste: number 
  }[]
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-0 border shadow-md">
        <CardContent className="p-3">
          <p className="text-sm font-medium">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
              <span className="font-medium">Spent:</span>{' '}
              <span className="ml-1">${payload[0].value?.toFixed(2)}</span>
            </p>
            <p className="text-sm flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
              <span className="font-medium">Waste:</span>{' '}
              <span className="ml-1">${payload[1].value?.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((payload[1].value as number) / (payload[0].value as number) * 100)}% of spending wasted
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return null
}

export function SpendingTrends({ data }: SpendingTrendsProps) {
  // Check if we have data
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400">
        No spending data available
      </div>
    )
  }

  // Format currency for axis
  const formatYAxis = (value: number) => `$${value}`

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="week" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatYAxis} 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
            formatter={(value) => <span className="text-xs font-medium">{value}</span>}
          />
          <Area 
            type="monotone" 
            dataKey="spent" 
            name="Spent" 
            stackId="1"
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="waste" 
            name="Waste" 
            stackId="1"
            stroke="#ef4444" 
            fill="#ef4444" 
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
} 