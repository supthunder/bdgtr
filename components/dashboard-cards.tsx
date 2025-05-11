"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Calendar } from "lucide-react"
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
  // Get last 6 months
  const today = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - i)
    return d
  }).reverse()

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
      profit: profit > 0 ? profit : 0,
      loss: profit < 0 ? Math.abs(profit) : 0
    }
  })
}

export function DashboardCards({ expenses, income }: DashboardCardsProps) {
  const monthlyData = prepareMonthlyData(expenses, income)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0)
  const balance = totalIncome - totalExpenses

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">+${totalIncome.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
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
    </div>
  )
}

export function TopCategories({ expenses, income = [] }: { expenses: Expense[], income?: Income[] }) {
  const monthlyData = prepareMonthlyData(expenses, income)
  
  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  // Sort categories by total amount
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

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
              const budgetLimit = total * 1.5
              const percentage = (total / budgetLimit) * 100
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{info.emoji}</span>
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-sm ml-2">${total.toFixed(0)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${budgetLimit.toFixed(0)}
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
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                    })
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric"
                  })}
                />
                <Bar
                  dataKey="profit"
                  fill="var(--green-500)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--red-500)"
                  radius={[0, 0, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
