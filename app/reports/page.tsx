"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileDown, Filter } from "lucide-react"
import { format, parseISO } from "date-fns"
import { getExpenses } from "@/lib/expenses"
import { Expense } from "@/types/expense"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense;
    direction: "asc" | "desc";
  } | null>(null)

  useEffect(() => {
    const loadExpenses = async () => {
      const data = await getExpenses()
      setExpenses(data)
    }
    loadExpenses()
  }, [])

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter((expense: Expense) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      expense.name.toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower) ||
      expense.amount.toString().includes(searchLower) ||
      expense.frequency.toLowerCase().includes(searchLower)
    )
  })

  // Sort expenses based on column
  const sortedExpenses = [...filteredExpenses].sort((a: Expense, b: Expense) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
    }

    // Handle date strings
    if (sortConfig.key === "dueDate" || sortConfig.key === "createdAt") {
      const aDate = parseISO(aValue as string)
      const bDate = parseISO(bValue as string)
      return sortConfig.direction === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime()
    }

    return 0
  })

  // Handle column sort
  const handleSort = (key: keyof Expense) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current?.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Export to Excel (CSV)
  const exportToExcel = () => {
    const headers = ["Name", "Amount", "Category", "Frequency", "Due Date", "Created At"]
    const data = sortedExpenses.map((expense) => [
      expense.name,
      expense.amount,
      `${expense.emoji} ${expense.category}`,
      expense.frequency,
      format(new Date(expense.dueDate), "PPP"),
      format(new Date(expense.createdAt), "PPP"),
    ])

    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text("Expense Report", 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated on ${format(new Date(), "PPP")}`, 14, 22)

    // Prepare data for table
    const headers = [["Name", "Amount", "Category", "Frequency", "Due Date", "Created At"]]
    const data = sortedExpenses.map((expense) => [
      expense.name,
      `$${expense.amount.toFixed(2)}`,
      `${expense.emoji} ${expense.category}`,
      expense.frequency,
      format(new Date(expense.dueDate), "PPP"),
      format(new Date(expense.createdAt), "PPP"),
    ])

    // Add table
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    // Save PDF
    doc.save(`expenses-report-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("amount")}>
                Sort by Amount
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("dueDate")}>
                Sort by Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("category")}>
                Sort by Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.name}</TableCell>
                <TableCell>${expense.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {expense.emoji} {expense.category}
                </TableCell>
                <TableCell className="capitalize">{expense.frequency}</TableCell>
                <TableCell>{format(new Date(expense.dueDate), "PPP")}</TableCell>
                <TableCell>{format(new Date(expense.createdAt), "PPP")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 