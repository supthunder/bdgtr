"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getExpenses } from "@/lib/expenses"
import type { Expense } from "@/types/expense"

export function ExpenseChart() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadExpenses = async () => {
      const data = await getExpenses()
      setExpenses(data)
      setIsLoading(false)
    }

    loadExpenses()

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "budget-tracker-expenses") {
        loadExpenses()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for local updates
    const handleCustomEvent = () => {
      loadExpenses()
    }

    window.addEventListener("expensesUpdated", handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("expensesUpdated", handleCustomEvent)
    }
  }, [])

  // Group expenses by category
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate percentages for the chart
  const totalAmount = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)
  const categoryPercentages = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
  }))

  // Sort by amount (highest first)
  categoryPercentages.sort((a, b) => b.amount - a.amount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>View your expenses by category</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-6">Loading chart data...</div>
            ) : expenses.length === 0 ? (
              <div className="flex justify-center py-6 text-muted-foreground">
                No expense data available. Add expenses to see the chart.
              </div>
            ) : (
              <div className="space-y-4">
                {categoryPercentages.map(({ category, amount, percentage }) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      <div className="text-muted-foreground">${amount.toFixed(2)}</div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="list" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-6">Loading data...</div>
            ) : expenses.length === 0 ? (
              <div className="flex justify-center py-6 text-muted-foreground">
                No expense data available. Add expenses to see the list.
              </div>
            ) : (
              <div className="space-y-4">
                {categoryPercentages.map(({ category, amount, percentage }) => (
                  <div key={category} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="capitalize">{category}</span>
                    </div>
                    <div className="font-medium">${amount.toFixed(2)}</div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
