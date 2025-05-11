"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getExpenses } from "@/lib/expenses"
import { getIncome } from "@/lib/income"
import { getRecurringExpensesForDate } from "@/lib/utils"
import type { Expense } from "@/types/expense"
import type { Income } from "@/types/income"
import { format } from "date-fns"

export default function CalendarPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<Expense[]>([])
  const [selectedDayIncome, setSelectedDayIncome] = useState<Income[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const [expenseData, incomeData] = await Promise.all([
        getExpenses(),
        getIncome()
      ])
      setExpenses(expenseData)
      setIncome(incomeData)
    }
    loadData()
  }, [])

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const dayExpenses = getRecurringExpensesForDate(date, expenses)
      const dayIncome = getRecurringExpensesForDate(date, income)
      setSelectedDayExpenses(dayExpenses)
      setSelectedDayIncome(dayIncome)
      setIsDialogOpen(true)
    }
  }

  // Calculate total amount for a date
  const getTotalAmount = (expenses: Expense[], income: Income[]) => {
    const expenseTotal = expenses.reduce((total, expense) => total + expense.amount, 0)
    const incomeTotal = income.reduce((total, inc) => total + inc.amount, 0)
    return incomeTotal - expenseTotal
  }

  // Get expenses and income for date display
  const getTransactionsForDay = (date: Date) => {
    const dayExpenses = getRecurringExpensesForDate(date, expenses)
    const dayIncome = getRecurringExpensesForDate(date, income)
    return { expenses: dayExpenses, income: dayIncome }
  }

  // Custom day render to show expense indicators
  const renderDay = (day: Date) => {
    const { expenses: dayExpenses, income: dayIncome } = getTransactionsForDay(day)
    if (dayExpenses.length === 0 && dayIncome.length === 0) return null

    const total = getTotalAmount(dayExpenses, dayIncome)
    const isPositive = total >= 0

    return (
      <div className="flex flex-col items-center">
        <div className={`w-1 h-1 rounded-full mb-1 ${isPositive ? "bg-green-500" : "bg-primary"}`} />
        <div className={`text-[10px] ${isPositive ? "text-green-500" : "text-muted-foreground"}`}>
          {isPositive ? "+" : "-"}${Math.abs(total).toFixed(0)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            components={{
              DayContent: (props) => {
                return (
                  <div className="relative w-full h-full p-2">
                    <div className="absolute top-0 right-0 left-0">
                      {renderDay(props.date)}
                    </div>
                    <div className="mt-4">{props.date.getDate()}</div>
                  </div>
                )
              },
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDayIncome.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Income</h3>
                {selectedDayIncome.map((inc) => (
                  <div key={inc.id} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2">
                      <span>{inc.emoji}</span>
                      <span>{inc.name}</span>
                    </div>
                    <span className="text-green-500">+${inc.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedDayExpenses.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Expenses</h3>
                {selectedDayExpenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2">
                      <span>{expense.emoji}</span>
                      <span>{expense.name}</span>
                    </div>
                    <span className="text-red-500">-${expense.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            {(selectedDayExpenses.length > 0 || selectedDayIncome.length > 0) && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Net Total</span>
                  <span className={`font-semibold ${getTotalAmount(selectedDayExpenses, selectedDayIncome) >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {getTotalAmount(selectedDayExpenses, selectedDayIncome) >= 0 ? "+" : "-"}$
                    {Math.abs(getTotalAmount(selectedDayExpenses, selectedDayIncome)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            {selectedDayExpenses.length === 0 && selectedDayIncome.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No transactions on this date
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 