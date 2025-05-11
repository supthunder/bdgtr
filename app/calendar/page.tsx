"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { getExpenses } from "@/lib/expenses"
import { Expense } from "@/types/expense"

function getRecurringExpensesForDate(date: Date, expenses: Expense[]) {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.dueDate)
    
    switch (expense.frequency) {
      case "daily":
        return true
      case "weekly":
        return expenseDate.getDay() === date.getDay()
      case "bi-weekly":
        // Simplified bi-weekly check - just check if it's the same day of week
        return expenseDate.getDay() === date.getDay()
      case "monthly":
        return expenseDate.getDate() === date.getDate()
      case "quarterly":
        return expenseDate.getDate() === date.getDate() && 
               [0, 3, 6, 9].includes((date.getMonth() - expenseDate.getMonth() + 12) % 12)
      case "yearly":
        return expenseDate.getDate() === date.getDate() && 
               expenseDate.getMonth() === date.getMonth()
      case "one-time":
        return isSameDay(expenseDate, date)
      default:
        return false
    }
  })
}

export default function CalendarPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<Expense[]>([])

  useEffect(() => {
    const loadExpenses = async () => {
      const data = await getExpenses()
      setExpenses(data)
    }
    loadExpenses()
  }, [])

  // Get all days in the current month that have expenses
  const daysWithExpenses = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  }).reduce<Date[]>((acc, day) => {
    const hasExpenses = getRecurringExpensesForDate(day, expenses).length > 0
    if (hasExpenses) {
      acc.push(day)
    }
    return acc
  }, [])

  // Update selected day expenses when date changes
  useEffect(() => {
    const dayExpenses = getRecurringExpensesForDate(date, expenses)
    setSelectedDayExpenses(dayExpenses)
  }, [date, expenses])

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>Payment Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              modifiers={{ hasExpense: daysWithExpenses }}
              modifiersStyles={{
                hasExpense: {
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  borderRadius: "4px",
                }
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Expenses for {format(date, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayExpenses.length > 0 ? (
              <div className="space-y-4">
                {selectedDayExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <div className="font-medium">
                        {expense.emoji} {expense.name}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {expense.frequency}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${expense.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No expenses due on this date
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 