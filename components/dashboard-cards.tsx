"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Calendar } from "lucide-react"
import { getExpenses } from "@/lib/expenses"
import { getIncome } from "@/lib/income"
import type { Expense } from "@/types/expense"
import type { Income } from "@/types/income"
import { cn } from "@/lib/utils"

export function DashboardCards() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [expenseData, incomeData] = await Promise.all([
        getExpenses(),
        getIncome()
      ])
      setExpenses(expenseData)
      setIncome(incomeData)
      setIsLoading(false)
    }

    loadData()

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "budget-tracker-expenses" || e.key === "budget-tracker-income") {
        loadData()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for local updates
    const handleCustomEvent = () => {
      loadData()
    }

    window.addEventListener("expensesUpdated", handleCustomEvent)
    window.addEventListener("incomeUpdated", handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("expensesUpdated", handleCustomEvent)
      window.removeEventListener("incomeUpdated", handleCustomEvent)
    }
  }, [])

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const monthlyExpenses = expenses
    .filter((expense) => expense.frequency === "monthly")
    .reduce((sum, expense) => sum + expense.amount, 0)

  const monthlyIncome = income
    .filter((inc) => inc.frequency === "monthly")
    .reduce((sum, inc) => sum + inc.amount, 0)

  const netMonthly = monthlyIncome - monthlyExpenses

  const upcomingExpenses = expenses
    .filter((expense) => {
      const dueDate = new Date(expense.dueDate)
      const today = new Date()
      const sevenDaysLater = new Date()
      sevenDaysLater.setDate(today.getDate() + 7)
      return dueDate >= today && dueDate <= sevenDaysLater
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "Loading..." : `$${totalExpenses.toFixed(2)}`}</div>
          <p className="text-xs text-muted-foreground">All your tracked expenses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Monthly</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", netMonthly >= 0 ? "text-green-500" : "text-red-500")}>
            {isLoading ? "Loading..." : `${netMonthly >= 0 ? "+" : "-"}$${Math.abs(netMonthly).toFixed(2)}`}
          </div>
          <p className="text-xs text-muted-foreground">Monthly income minus expenses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {isLoading ? "Loading..." : `-$${monthlyExpenses.toFixed(2)}`}
          </div>
          <p className="text-xs text-muted-foreground">Your monthly recurring expenses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming (7 days)</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {isLoading ? "Loading..." : `-$${upcomingExpenses.toFixed(2)}`}
          </div>
          <p className="text-xs text-muted-foreground">Due in the next 7 days</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function TopCategories() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadExpenses = async () => {
      const data = await getExpenses()
      setExpenses(data)
      setIsLoading(false)
    }
    loadExpenses()

    const handleCustomEvent = () => {
      loadExpenses()
    }
    window.addEventListener("expensesUpdated", handleCustomEvent)
    return () => {
      window.removeEventListener("expensesUpdated", handleCustomEvent)
    }
  }, [])

  // Group expenses by category and calculate totals
  const categoryTotals = expenses.reduce((acc: Record<string, { total: number, count: number }>, expense) => {
    const key = expense.category
    if (!acc[key]) {
      acc[key] = { total: 0, count: 0 }
    }
    acc[key].total += expense.amount
    acc[key].count += 1
    return acc
  }, {})

  // Convert to array and sort by total
  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, data]) => ({
      category,
      ...data
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5) // Get top 5 categories

  // Category colors and emojis mapping
  const categoryInfo: Record<string, { emoji: string; color: string }> = {
    "housing": { emoji: "🏠", color: "bg-green-500" },
    "utilities": { emoji: "🔌", color: "bg-purple-500" },
    "internet": { emoji: "🌐", color: "bg-blue-500" },
    "furniture": { emoji: "🪑", color: "bg-red-500" },
    "decor": { emoji: "🛋️", color: "bg-orange-500" },
    "appliances": { emoji: "🧰", color: "bg-yellow-500" },
    "cleaning": { emoji: "🧹", color: "bg-emerald-500" },
    "maintenance": { emoji: "🛠️", color: "bg-cyan-500" },
    "insurance": { emoji: "🏡", color: "bg-indigo-500" },
    "plumbing": { emoji: "🚰", color: "bg-violet-500" },
    "electrical": { emoji: "⚡", color: "bg-fuchsia-500" },
    "hvac": { emoji: "❄️", color: "bg-rose-500" },
    "kitchen": { emoji: "🏺", color: "bg-pink-500" },
    "bathroom": { emoji: "🛁", color: "bg-sky-500" },
    "landscaping": { emoji: "🌿", color: "bg-teal-500" },
    "storage": { emoji: "📦", color: "bg-amber-500" },
    "other": { emoji: "💰", color: "bg-gray-500" }
  }

  const maxAmount = sortedCategories[0]?.total || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCategories.map(({ category, total }) => {
            const info = categoryInfo[category] || { emoji: "💰", color: "bg-gray-500" }
            const percentage = (total / maxAmount) * 100

            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${info.color}`} />
                  <span>{info.emoji}</span>
                  <span className="font-medium capitalize">{category.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm">
                    ${total.toFixed(0)}
                  </span>
                  <div className="w-12 h-1.5 rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${info.color}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
