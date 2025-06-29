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
import { ArrowUpDown, FileDown } from "lucide-react"
import { format, parseISO } from "date-fns"
import { getExpenses, getIncome } from "@/app/actions"
import type { Expense } from "@/types/expense"
import type { Income } from "@/types/income"
import { Badge } from "@/components/ui/badge"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { cn } from "@/lib/utils"

type Transaction = {
  id: string
  name: string
  amount: number
  category: string
  frequency: string
  date: string
  createdAt: string
  emoji: string
  type: "income" | "expense"
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction
    direction: "asc" | "desc"
  } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const [expenseData, incomeData] = await Promise.all([
        getExpenses(),
        getIncome()
      ])

      const formattedExpenses: Transaction[] = expenseData.map((expense: Expense) => ({
        id: expense.id,
        name: expense.name,
        amount: -Math.abs(expense.amount), // Make expenses negative
        category: expense.category,
        frequency: expense.frequency,
        date: expense.dueDate,
        createdAt: expense.createdAt,
        emoji: expense.emoji,
        type: "expense"
      }))

      const formattedIncome: Transaction[] = incomeData.map((income: Income) => ({
        id: income.id,
        name: income.name,
        amount: income.amount,
        category: income.category,
        frequency: income.frequency,
        date: income.receiveDate,
        createdAt: income.createdAt,
        emoji: income.emoji,
        type: "income"
      }))

      setTransactions([...formattedExpenses, ...formattedIncome])
    }
    loadData()
  }, [])

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      transaction.name.toLowerCase().includes(searchLower) ||
      transaction.category.toLowerCase().includes(searchLower) ||
      Math.abs(transaction.amount).toString().includes(searchLower) ||
      transaction.type.toLowerCase().includes(searchLower)
    )
  })

  // Sort transactions based on column
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (sortConfig.key === "name" || sortConfig.key === "category" || sortConfig.key === "type") {
      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    }

    if (sortConfig.key === "amount") {
      return sortConfig.direction === "asc"
        ? Math.abs(a.amount) - Math.abs(b.amount)
        : Math.abs(b.amount) - Math.abs(a.amount)
    }

    if (sortConfig.key === "date" || sortConfig.key === "createdAt") {
      const aDate = parseISO(aValue as string)
      const bDate = parseISO(bValue as string)
      return sortConfig.direction === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime()
    }

    return 0
  })

  // Handle column sort
  const handleSort = (key: keyof Transaction) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current?.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Export to Excel (CSV)
  const exportToExcel = () => {
    const headers = ["Name", "Amount", "Category", "Date", "Created At", "Type"]
    const data = sortedTransactions.map((transaction) => [
      transaction.name,
      transaction.amount,
      transaction.category,
      format(new Date(transaction.date), "yyyy-MM-dd"),
      format(new Date(transaction.createdAt), "yyyy-MM-dd"),
      transaction.type
    ])

    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`)
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
    doc.text("Transaction Report", 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated on ${format(new Date(), "PPP")}`, 14, 22)

    // Prepare data for table
    const headers = [["Name", "Amount", "Category", "Date", "Created At", "Type"]]
    const data = sortedTransactions.map((transaction) => [
      transaction.name,
      `${transaction.amount >= 0 ? "+" : "-"}$${Math.abs(transaction.amount).toFixed(2)}`,
      transaction.category,
      format(new Date(transaction.date), "yyyy-MM-dd"),
      format(new Date(transaction.createdAt), "yyyy-MM-dd"),
      transaction.type
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
    doc.save(`transactions-report-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  const getSortIcon = (key: keyof Transaction) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return (
      <ArrowUpDown 
        className={cn(
          "ml-2 h-4 w-4",
          sortConfig.direction === "asc" ? "text-green-500" : "text-red-500"
        )}
      />
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
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
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Name {getSortIcon("name")}
              </TableHead>
              <TableHead onClick={() => handleSort("category")} className="cursor-pointer">
                Category {getSortIcon("category")}
              </TableHead>
              <TableHead onClick={() => handleSort("amount")} className="cursor-pointer">
                Amount {getSortIcon("amount")}
              </TableHead>
              <TableHead onClick={() => handleSort("type")} className="cursor-pointer">
                Type {getSortIcon("type")}
              </TableHead>
              <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                Date {getSortIcon("date")}
              </TableHead>
              <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                Created {getSortIcon("createdAt")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{transaction.emoji}</span>
                    <span>{transaction.name}</span>
                  </div>
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className={transaction.amount >= 0 ? "text-green-500" : "text-red-500"}>
                  {transaction.amount >= 0 ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                <TableCell>{format(new Date(transaction.createdAt), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 