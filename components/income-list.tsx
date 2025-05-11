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
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { getIncome, deleteIncome } from "@/lib/income"
import type { Income } from "@/types/income"
import { Badge } from "@/components/ui/badge"
import { IncomeForm } from "@/components/income-form"

export function IncomeList() {
  const [income, setIncome] = useState<Income[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id)
      setIncome(income.filter((inc) => inc.id !== id))
    } catch (error) {
      console.error("Failed to delete income:", error)
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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>House Rent</CardTitle>
            <CardDescription>View and manage your rental income</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">Loading rent...</div>
          ) : income.length === 0 ? (
            <div className="flex justify-center py-6 text-muted-foreground">
              No rent entries found. Add your first rental income to get started.
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
                          <DropdownMenuItem>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Rental Income</DialogTitle>
          </DialogHeader>
          <IncomeForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
} 