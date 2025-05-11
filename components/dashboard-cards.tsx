"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Calendar } from "lucide-react"
import { getExpenses } from "@/lib/expenses"
import type { Expense } from "@/types/expense"

export function DashboardCards() {
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

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const monthlyExpenses = expenses
    .filter((expense) => expense.frequency === "monthly")
    .reduce((sum, expense) => sum + expense.amount, 0)
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
          <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "Loading..." : `$${monthlyExpenses.toFixed(2)}`}</div>
          <p className="text-xs text-muted-foreground">Your monthly recurring expenses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming (7 days)</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "Loading..." : `$${upcomingExpenses.toFixed(2)}`}</div>
          <p className="text-xs text-muted-foreground">Due in the next 7 days</p>
        </CardContent>
      </Card>
    </div>
  )
}
