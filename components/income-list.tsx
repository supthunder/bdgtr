"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getIncome } from "@/lib/income"
import type { Income } from "@/types/income"

export function IncomeList() {
  const [income, setIncome] = useState<Income[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadIncome = async () => {
      const data = await getIncome()
      setIncome(data)
      setIsLoading(false)
    }

    loadIncome()

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "budget-tracker-income") {
        loadIncome()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for local updates
    const handleCustomEvent = () => {
      loadIncome()
    }

    window.addEventListener("incomeUpdated", handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("incomeUpdated", handleCustomEvent)
    }
  }, [])

  // Calculate monthly total
  const monthlyTotal = income.reduce((sum, inc) => {
    if (inc.frequency === "monthly") {
      return sum + inc.amount
    }
    return sum
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>House Rent</CardTitle>
        <CardDescription>View and manage your rental income</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">Loading rent...</div>
        ) : income.length === 0 ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            No rent entries found. Add your first rental income to get started.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">Monthly Rent</span>
              </div>
              <span className="text-xl font-semibold text-green-500">+${monthlyTotal.toFixed(2)}</span>
            </div>
            {income
              .filter(inc => inc.frequency === "monthly")
              .map((inc) => (
                <div key={inc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>🏠</span>
                    <span className="font-medium">{inc.name}</span>
                  </div>
                  <span className="text-green-500">+${inc.amount.toFixed(2)}</span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 