"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format, isSameDay, addMonths, subMonths } from "date-fns"
import { getExpenses } from "@/lib/expenses"
import { Expense } from "@/types/expense"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<Expense[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const loadExpenses = async () => {
      const data = await getExpenses()
      setExpenses(data)
    }
    loadExpenses()
  }, [])

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const dayExpenses = getRecurringExpensesForDate(date, expenses)
      setSelectedDayExpenses(dayExpenses)
      setIsDialogOpen(true)
    }
  }

  // Calculate total amount for a date
  const getTotalAmount = (expenses: Expense[]) => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  // Get expenses for date display
  const getExpensesForDay = (date: Date) => {
    return getRecurringExpensesForDate(date, expenses)
  }

  // Custom day render to show expense indicators
  const renderDay = (day: Date) => {
    const dayExpenses = getExpensesForDay(day)
    if (dayExpenses.length === 0) return null

    const total = getTotalAmount(dayExpenses)
    return (
      <div className="flex flex-col items-center">
        <div className="w-1 h-1 bg-primary rounded-full mb-1" />
        <div className="text-[10px] text-muted-foreground">
          ${total.toFixed(0)}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Payment Schedule</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Previous Month */}
          <div className="border rounded-lg p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={subMonths(currentMonth, 1)}
              components={{ DayContent: (props) => renderDay(props.date) }}
              className="w-full"
            />
          </div>

          {/* Current Month */}
          <div className="border rounded-lg p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              components={{ DayContent: (props) => renderDay(props.date) }}
              className="w-full"
            />
          </div>

          {/* Next Month */}
          <div className="border rounded-lg p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={addMonths(currentMonth, 1)}
              components={{ DayContent: (props) => renderDay(props.date) }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Expense Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Expenses for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedDayExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <div className="font-medium text-lg">
                    {expense.emoji} {expense.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {expense.frequency}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Due: {format(new Date(expense.dueDate), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">
                    ${expense.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            {selectedDayExpenses.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    ${getTotalAmount(selectedDayExpenses).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            {selectedDayExpenses.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No expenses due on this date
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 