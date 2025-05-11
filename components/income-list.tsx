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
import { getIncome, deleteIncome, addIncome, updateIncome } from "@/app/actions"
import type { Income } from "@/types/income"
import { Badge } from "@/components/ui/badge"
import { IncomeForm } from "@/components/income-form"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface IncomeListProps {
  initialIncome: Income[]
}

export function IncomeList({ initialIncome }: IncomeListProps) {
  const [income, setIncome] = useState<Income[]>(initialIncome)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const loadIncome = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getIncome()
      setIncome(data)
    } catch (error) {
      console.error("Failed to load income:", error)
      toast({
        title: "Error",
        description: "Failed to load income. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = async (id: string) => {
    try {
      // Store the income to be deleted for potential rollback
      const incomeToDelete = income.find(i => i.id === id)
      
      // Optimistically remove from UI
      setIncome(prev => prev.filter(i => i.id !== id))
      
      // Actually delete from the database
      await deleteIncome(id)
      
      // Refresh server state in background
      startTransition(() => {
        router.refresh()
        loadIncome()
      })
    } catch (error) {
      console.error("Failed to delete income:", error)
      // Revert the optimistic update if the deletion failed
      if (incomeToDelete) {
        setIncome(prev => [...prev, incomeToDelete].sort((a, b) => 
          new Date(a.receiveDate).getTime() - new Date(b.receiveDate).getTime()
        ))
      }
      toast({
        title: "Error",
        description: "Failed to delete income. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSuccess = async (newIncome: Income) => {
    try {
      // Optimistically add to UI
      setIncome(prev => [newIncome, ...prev].sort((a, b) => 
        new Date(a.receiveDate).getTime() - new Date(b.receiveDate).getTime()
      ))
      setIsAddDialogOpen(false)
      
      // Add to database
      await addIncome(newIncome)
      
      // Refresh server state in background
      startTransition(() => {
        router.refresh()
        // Reload income to ensure consistency
        loadIncome()
      })
    } catch (error) {
      console.error("Failed to add income:", error)
      // Remove the optimistically added income if the operation failed
      setIncome(prev => prev.filter(i => i.id !== newIncome.id))
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to add income. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (income: Income) => {
    setSelectedIncome(income)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = async (updatedIncome: Income) => {
    try {
      // Store the original income for potential rollback
      const originalIncome = income.find(i => i.id === updatedIncome.id)
      
      // Optimistically update UI
      setIncome(prev => prev.map(i => 
        i.id === updatedIncome.id ? updatedIncome : i
      ).sort((a, b) => 
        new Date(a.receiveDate).getTime() - new Date(b.receiveDate).getTime()
      ))
      setIsEditDialogOpen(false)
      setSelectedIncome(null)
      
      // Update in database
      await updateIncome(updatedIncome)
      
      // Refresh server state in background
      startTransition(() => {
        router.refresh()
        // Reload income to ensure consistency
        loadIncome()
      })
    } catch (error) {
      console.error("Failed to update income:", error)
      // Revert to original income if update failed
      if (originalIncome) {
        setIncome(prev => prev.map(i => 
          i.id === updatedIncome.id ? originalIncome : i
        ))
      }
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to update income. Please try again.",
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
            <CardTitle>Income</CardTitle>
            <CardDescription>View and manage your income sources</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">Loading income...</div>
          ) : income.length === 0 ? (
            <div className="flex justify-center py-6 text-muted-foreground">
              No income entries found. Add your first income to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Receive Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {income.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{inc.emoji}</span>
                        <span>{inc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{inc.category}</TableCell>
                    <TableCell className="text-green-500">+${inc.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getFrequencyColor(inc.frequency)}>
                        {inc.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(inc.receiveDate), "MMM d, yyyy")}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(inc)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(inc.id)}>
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
            <DialogTitle>Add New Income</DialogTitle>
          </DialogHeader>
          <IncomeForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          {selectedIncome && (
            <IncomeForm 
              onSuccess={handleEditSuccess}
              initialData={selectedIncome}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 