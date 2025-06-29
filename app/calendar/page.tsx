"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getExpenses, getIncome } from "@/app/actions"
import { getRecurringExpensesForDate } from "@/lib/utils"
import type { Expense } from "@/types/expense"
import type { Income } from "@/types/income"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Upload, RefreshCw, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<Expense[]>([])
  const [selectedDayIncome, setSelectedDayIncome] = useState<Income[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")

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
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const dayExpenses = getRecurringExpensesForDate(date, expenses)
    const dayIncome = getRecurringExpensesForDate(date, income)
    setSelectedDayExpenses(dayExpenses)
    setSelectedDayIncome(dayIncome)
    setIsDialogOpen(true)
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

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Calculate monthly totals
  const monthlyExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.dueDate)
      return expenseDate >= monthStart && expenseDate <= monthEnd
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const monthlyIncome = income
    .filter(inc => {
      const incomeDate = new Date(inc.receiveDate)
      return incomeDate >= monthStart && incomeDate <= monthEnd
    })
    .reduce((sum, inc) => sum + inc.amount, 0)

  // Navigation months for sidebar
  const navigationMonths = []
  for (let i = -12; i <= 12; i++) {
    navigationMonths.push(addMonths(new Date(), i))
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-muted/50 p-4 border-r">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Transaction Type</h3>
          <select className="w-full p-2 rounded border bg-background">
            <option>All Types</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>
        
        <div className="mt-6 space-y-2">
          {navigationMonths.map((month) => (
            <button
              key={month.toISOString()}
              onClick={() => setCurrentMonth(month)}
              className={cn(
                "w-full text-left p-2 rounded text-sm hover:bg-muted transition-colors",
                format(month, 'MMMM, yyyy') === format(currentMonth, 'MMMM, yyyy') && "bg-primary/10 text-primary"
              )}
            >
              {format(month, 'MMMM, yyyy')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Transaction Calendar</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">Total Income: ${monthlyIncome.toLocaleString()}</span>
                <span className="text-red-600">Total Expense: ${monthlyExpenses.toLocaleString()}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transaction description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Date Range: {format(monthStart, 'MMM d, yyyy')} - {format(monthEnd, 'MMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 p-4">
          <div className="h-full">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-px mb-px">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-px bg-border h-full">
              {days.map((day) => {
                const { expenses: dayExpenses, income: dayIncome } = getTransactionsForDay(day)
                const dayExpenseTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                const dayIncomeTotal = dayIncome.reduce((sum, inc) => sum + inc.amount, 0)
                const hasTransactions = dayExpenses.length > 0 || dayIncome.length > 0
                
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => hasTransactions && handleDateSelect(day)}
                    className={cn(
                      "bg-background p-2 min-h-[120px] flex flex-col",
                      !isSameMonth(day, currentMonth) && "opacity-50",
                      isToday(day) && "bg-primary/5 border-2 border-primary/20",
                      hasTransactions && "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    
                    {hasTransactions && (
                      <div className="space-y-1 text-xs">
                        {dayIncomeTotal > 0 && (
                          <div className="text-green-600 font-medium">
                            + ${dayIncomeTotal.toLocaleString()}
                          </div>
                        )}
                        {dayExpenseTotal > 0 && (
                          <div className="text-red-600 font-medium">
                            - ${dayExpenseTotal.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedDayIncome.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-green-600">Income</h3>
                <div className="space-y-2">
                  {selectedDayIncome.map((inc) => (
                    <div key={inc.id} className="flex justify-between items-center p-2 bg-green-50 rounded border">
                      <div className="flex items-center gap-2">
                        <span>{inc.emoji}</span>
                        <div>
                          <div className="font-medium">{inc.name}</div>
                          <div className="text-xs text-muted-foreground">{inc.category}</div>
                        </div>
                      </div>
                      <span className="text-green-600 font-semibold">+${inc.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedDayExpenses.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-red-600">Expenses</h3>
                <div className="space-y-2">
                  {selectedDayExpenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-2 bg-red-50 rounded border">
                      <div className="flex items-center gap-2">
                        <span>{expense.emoji}</span>
                        <div>
                          <div className="font-medium">{expense.name}</div>
                          <div className="text-xs text-muted-foreground">{expense.category}</div>
                        </div>
                      </div>
                      <span className="text-red-600 font-semibold">-${expense.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(selectedDayExpenses.length > 0 || selectedDayIncome.length > 0) && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="font-semibold">Net Total</span>
                  <span className={cn(
                    "font-bold text-lg",
                    getTotalAmount(selectedDayExpenses, selectedDayIncome) >= 0 ? "text-green-600" : "text-red-600"
                  )}>
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