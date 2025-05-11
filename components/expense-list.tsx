"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { getExpenses, deleteExpense } from "@/lib/expenses"
import type { Expense } from "@/types/expense"
import { Badge } from "@/components/ui/badge"

export function ExpenseList() {
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

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      setExpenses(expenses.filter((expense) => expense.id !== id))
    } catch (error) {
      console.error("Failed to delete expense:", error)
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "monthly":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "yearly":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
      case "weekly":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "daily":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "one-time":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>View and manage your recent expenses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            No expenses found. Add your first expense to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{expense.emoji}</span>
                      <span>{expense.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getFrequencyColor(expense.frequency)}>
                      {expense.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(expense.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(expense.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
