"use client"

import { useEffect, useState, useTransition, useCallback } from "react"
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
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { getExpenses, deleteExpense, addExpense, updateExpense } from "@/app/actions"
import type { Expense } from "@/types/expense"
import { Badge } from "@/components/ui/badge"
import { ExpenseForm } from "@/components/expense-form"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface ExpenseListProps {
  initialExpenses: Expense[]
}

export function ExpenseList({ initialExpenses }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const loadExpenses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getExpenses()
      setExpenses(data)
    } catch (error) {
      console.error("Failed to load expenses:", error)
      toast({
        title: "Error",
        description: "Failed to load expenses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = async (id: string) => {
    try {
      // Store the expense to be deleted for potential rollback
      const expenseToDelete = expenses.find(e => e.id === id)
      
      // Optimistically remove from UI
      setExpenses(prev => prev.filter(e => e.id !== id))
      
      // Actually delete from the database
      await deleteExpense(id)
      
      // Refresh server state in background
      startTransition(() => {
        router.refresh()
        loadExpenses()
      })
    } catch (error) {
      console.error("Failed to delete expense:", error)
      // Revert the optimistic update if the deletion failed
      if (expenseToDelete) {
        setExpenses(prev => [...prev, expenseToDelete].sort((a, b) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ))
      }
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSuccess = async (newExpense: Expense) => {
    try {
      // Optimistically add to UI
      setExpenses(prev => [newExpense, ...prev].sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ))
      setIsAddDialogOpen(false)
      
      // Add to database
      await addExpense(newExpense)
      
      // Refresh server state in background
      startTransition(() => {
        router.refresh()
        // Reload expenses to ensure consistency
        loadExpenses()
      })
    } catch (error) {
      console.error("Failed to add expense:", error)
      // Remove the optimistically added expense if the operation failed
      setExpenses(prev => prev.filter(e => e.id !== newExpense.id))
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = async (updatedExpense: Expense) => {
    try {
      // Store the original expense for potential rollback
      const originalExpense = expenses.find(e => e.id === updatedExpense.id)
      
      // Optimistically update UI
      setExpenses(prev => prev.map(e => 
        e.id === updatedExpense.id ? updatedExpense : e
      ).sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ))
      setIsEditDialogOpen(false)
      setSelectedExpense(null)
      
      // Update in database
      await updateExpense(updatedExpense)
      
      // Refresh server state in background
      startTransition(() => {
        router.refresh()
        // Reload expenses to ensure consistency
        loadExpenses()
      })
    } catch (error) {
      console.error("Failed to update expense:", error)
      // Revert to original expense if update failed
      if (originalExpense) {
        setExpenses(prev => prev.map(e => 
          e.id === updatedExpense.id ? originalExpense : e
        ))
      }
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "MONTHLY":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "YEARLY":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
      case "WEEKLY":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "DAILY":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "ONE_TIME":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
      case "BI_WEEKLY":
        return "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20"
      case "QUARTERLY":
        return "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Manage your expenses</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
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
                  <TableHead>Date</TableHead>
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
                    <TableCell className="text-red-500">-${expense.amount.toFixed(2)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(expense)}>
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <ExpenseForm 
              onSuccess={handleEditSuccess}
              initialData={selectedExpense}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
