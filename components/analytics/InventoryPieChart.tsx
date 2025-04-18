"use client"

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts'
import { categoryColors } from '@/lib/categoryColors'

// Define the interface for a data point
export interface PieChartDataPoint {
  name: string
  value: number
}

// Define the props interface
interface InventoryPieChartProps {
  data: PieChartDataPoint[]
}

// Fallback color for categories not in the categoryColors palette
const DEFAULT_COLOR = '#9ca3af'

export function InventoryPieChart({ data }: InventoryPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  // Don't render if data is empty
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No data available to display
      </div>
    )
  }

  // Get color for each category, falling back to default if not found
  const getColorForCategory = (category: string) => {
    return categoryColors[category] || DEFAULT_COLOR
  }

  // Sort data by value in descending order for better visual organization
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Custom active shape to highlight when hovered
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value
    } = props;
  
    return (
      <g>
        <text 
          x={cx} 
          y={cy} 
          textAnchor="middle" 
          fill={fill} 
          className="font-medium"
        >
          {payload.name}
        </text>
        <text 
          x={cx} 
          y={cy + 20} 
          textAnchor="middle" 
          fill="#666"
          className="text-xs"
        >
          {`${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="transition-all duration-200"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 12}
          fill={fill}
          opacity={0.5}
        />
      </g>
    );
  };

  // Handlers for mouse events
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Enhanced custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const percentage = Math.round((value / total) * 100);

      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
          <p className="font-semibold text-sm">{name}</p>
          <div className="flex items-center mt-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: getColorForCategory(name) }}
            />
            <p className="text-sm text-gray-700">{value} items</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">{percentage}% of inventory</p>
        </div>
      );
    }
    return null;
  };

  // Create a small legend within the chart itself
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show labels for segments that are at least 8% of the total
    return percent > 0.08 ? (
      <text
        x={x}
        y={y}
        fill={getColorForCategory(sortedData[index].name)}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {name}
      </text>
    ) : null;
  };

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="45%"
            labelLine={true}
            outerRadius={140}
            innerRadius={60}
            paddingAngle={2}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={(_, index) => setActiveIndex(index === activeIndex ? undefined : index)}
            label={renderLabel}
          >
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColorForCategory(entry.name)}
                stroke="#fff"
                strokeWidth={1}
                className="transition-all duration-200"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 