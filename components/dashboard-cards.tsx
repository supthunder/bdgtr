"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Calendar, Home, Zap } from "lucide-react"
import { getExpenses, getIncome } from "@/app/actions"
import type { Expense } from "@/types/expense"
import type { Income } from "@/types/income"
import { cn } from "@/lib/utils"
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

interface DashboardCardsProps {
  expenses: Expense[]
  income: Income[]
}

interface TopCategoriesProps {
  expenses: Expense[]
}

// Category colors and emojis mapping
const categoryInfo: Record<string, { emoji: string; color: string }> = {
  "housing": { emoji: "🏠", color: "#10B981" }, // green-500
  "utilities": { emoji: "🔌", color: "#8B5CF6" }, // purple-500
  "internet": { emoji: "🌐", color: "#3B82F6" }, // blue-500
  "furniture": { emoji: "🪑", color: "#EF4444" }, // red-500
  "decor": { emoji: "🛋️", color: "#F97316" }, // orange-500
  "appliances": { emoji: "🧰", color: "#EAB308" }, // yellow-500
  "cleaning": { emoji: "🧹", color: "#10B981" }, // emerald-500
  "maintenance": { emoji: "🛠️", color: "#06B6D4" }, // cyan-500
  "insurance": { emoji: "🏡", color: "#6366F1" }, // indigo-500
  "plumbing": { emoji: "🚰", color: "#8B5CF6" }, // violet-500
  "electrical": { emoji: "⚡", color: "#D946EF" }, // fuchsia-500
  "hvac": { emoji: "❄️", color: "#F43F5E" }, // rose-500
  "kitchen": { emoji: "🏺", color: "#EC4899" }, // pink-500
  "bathroom": { emoji: "🛁", color: "#0EA5E9" }, // sky-500
  "landscaping": { emoji: "🌿", color: "#14B8A6" }, // teal-500
  "storage": { emoji: "📦", color: "#F59E0B" }, // amber-500
  "other": { emoji: "💰", color: "#6B7280" } // gray-500
}

function prepareMonthlyData(expenses: Expense[], income: Income[]) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  
  // Find earliest data point
  const allDates = [
    ...expenses.map(e => new Date(e.dueDate)),
    ...income.map(i => new Date(i.receiveDate))
  ]
  
  const earliestDate = allDates.length > 0 
    ? new Date(Math.min(...allDates.map(d => d.getTime())))
    : new Date(currentYear, 0, 1) // Fallback to January if no data
  
  const earliestYear = earliestDate.getFullYear()
  const earliestMonth = earliestDate.getMonth()
  
  // Generate months from earliest data to December of current year
  const months = []
  let startYear = earliestYear
  let startMonth = earliestMonth
  
  while (startYear < currentYear || (startYear === currentYear && startMonth <= 11)) {
    months.push(new Date(startYear, startMonth, 1))
    startMonth++
    if (startMonth > 11) {
      startMonth = 0
      startYear++
    }
  }

  return months.map(date => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    // Calculate total expenses and income for the month
    const monthlyExpenses = expenses
      .filter(e => {
        const expenseDate = new Date(e.dueDate)
        return expenseDate >= monthStart && expenseDate <= monthEnd
      })
      .reduce((sum, e) => sum + e.amount, 0)

    const monthlyIncome = income
      .filter(i => {
        const incomeDate = new Date(i.receiveDate)
        return incomeDate >= monthStart && incomeDate <= monthEnd
      })
      .reduce((sum, i) => sum + i.amount, 0)

    const profit = monthlyIncome - monthlyExpenses

    return {
      date: date.toISOString(),
      expenses: monthlyExpenses,
      income: monthlyIncome,
      profit: profit > 0 ? profit : 0,
      loss: profit < 0 ? Math.abs(profit) : 0
    }
  })
}

export function DashboardCards({ expenses, income }: DashboardCardsProps) {
  const [timeFilter, setTimeFilter] = useState<"total" | "monthly" | "yearly">("total")
  
  // Filter data based on selected timeframe
  const getFilteredData = () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    
    if (timeFilter === "monthly") {
      const monthStart = new Date(currentYear, currentMonth, 1)
      const monthEnd = new Date(currentYear, currentMonth + 1, 0)
      
      return {
        expenses: expenses.filter(e => {
          const date = new Date(e.dueDate)
          return date >= monthStart && date <= monthEnd
        }),
        income: income.filter(i => {
          const date = new Date(i.receiveDate)
          return date >= monthStart && date <= monthEnd
        })
      }
    }
    
    if (timeFilter === "yearly") {
      const yearStart = new Date(currentYear, 0, 1)
      const yearEnd = new Date(currentYear, 11, 31)
      
      return {
        expenses: expenses.filter(e => {
          const date = new Date(e.dueDate)
          return date >= yearStart && date <= yearEnd
        }),
        income: income.filter(i => {
          const date = new Date(i.receiveDate)
          return date >= yearStart && date <= yearEnd
        })
      }
    }
    
    // Total - return all data
    return { expenses, income }
  }
  
  const filteredData = getFilteredData()
  const monthlyData = prepareMonthlyData(expenses, income)
  const totalExpenses = filteredData.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalIncome = filteredData.income.reduce((sum, inc) => sum + inc.amount, 0)
  const balance = totalIncome - totalExpenses
  
  // Calculate category-specific totals using filtered data
  const mortgageExpenses = filteredData.expenses
    .filter(expense => expense.category === 'housing')
    .reduce((sum, expense) => sum + expense.amount, 0)
  
  const utilitiesExpenses = filteredData.expenses
    .filter(expense => ['utilities', 'internet', 'electrical', 'plumbing'].includes(expense.category))
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-4">
      {/* Filter Dropdown */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Financial Overview</h3>
          <p className="text-sm text-muted-foreground">
            {timeFilter === "total" && "All time totals"}
            {timeFilter === "monthly" && "Current month totals"}
            {timeFilter === "yearly" && "Current year totals"}
          </p>
        </div>
        <Select value={timeFilter} onValueChange={(value: "total" | "monthly" | "yearly") => setTimeFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {timeFilter === "total" && "Total Income"}
              {timeFilter === "monthly" && "Monthly Income"}
              {timeFilter === "yearly" && "Yearly Income"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+${totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {timeFilter === "total" && "Total Expenses"}
              {timeFilter === "monthly" && "Monthly Expenses"}
              {timeFilter === "yearly" && "Yearly Expenses"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">-${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              balance >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {balance >= 0 ? "+" : "-"}${Math.abs(balance).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mortgage</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">-${mortgageExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilities</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">-${utilitiesExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function TopCategories({ expenses, income = [] }: { expenses: Expense[], income?: Income[] }) {
  const monthlyData = prepareMonthlyData(expenses, income)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    scrollRef.current.style.cursor = 'grabbing'
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab'
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab'
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Adjust scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  // Add global mouse up handler to stop dragging when mouse is released anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab'
      }
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging])

  // Auto-scroll to position showing current month - 3 months
  useEffect(() => {
    if (!scrollRef.current || monthlyData.length === 0) return

    const today = new Date()
    const targetDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
    
    // Find the index of the target month in our data
    const targetIndex = monthlyData.findIndex(data => {
      const dataDate = new Date(data.date)
      return dataDate.getFullYear() === targetDate.getFullYear() && 
             dataDate.getMonth() === targetDate.getMonth()
    })

    if (targetIndex !== -1) {
      // Scroll to position the target month in view (each month is 80px wide)
      const scrollPosition = Math.max(0, targetIndex * 80 - 160) // Show target month with some left padding
      scrollRef.current.scrollLeft = scrollPosition
    }
  }, [monthlyData])
  
  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  // Sort categories by total amount
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
  
  // Get total expenses for percentage calculation
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Your highest spending categories</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            <a href="#" className="hover:underline">VIEW ALL →</a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedCategories.map(([category, total]) => {
              const info = categoryInfo[category] || { emoji: "💰", color: "#6B7280" }
              // Calculate percentage based on total expenses
              const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{info.emoji}</span>
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-sm ml-2">${total.toFixed(0)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {totalExpenses > 0 ? `${Math.round(percentage)}%` : '0%'}
                    </div>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-muted/30">
                    <div
                      className="absolute h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: info.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Distribution</CardTitle>
          <CardDescription>Income vs Expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Scroll fade indicators */}
            <div className="absolute left-0 top-0 bottom-6 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-6 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none z-10" />
            
            <div 
              ref={scrollRef}
              className="h-[300px] w-full overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab select-none"
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <div className="h-full" style={{ width: `${monthlyData.length * 80}px`, minWidth: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={monthlyData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                    })
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  formatter={(value: number, name: string) => {
                    const label = name === 'expenses' ? 'Expenses' : 
                                 name === 'income' ? 'Income' : 'Profit';
                    return [`$${value.toFixed(2)}`, label];
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric"
                  })}
                />
                <Bar
                  dataKey="income"
                  fill="#10B981"
                  radius={[2, 2, 0, 0]}
                  name="income"
                />
                <Bar
                  dataKey="expenses"
                  fill="#EF4444"
                  radius={[2, 2, 0, 0]}
                  name="expenses"
                />
              </BarChart>
            </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
