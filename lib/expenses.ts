import type { Expense } from "@/types/expense"
import { prisma } from "./db"
import type { Transaction } from "../lib/generated/prisma/index"

// Get all expenses from database
export async function getExpenses(): Promise<Expense[]> {
  try {
    const expenses = await prisma.transaction.findMany({
      where: {
        type: "EXPENSE"
      },
      orderBy: {
        date: 'asc'
      }
    })

    return expenses.map((expense: Transaction) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      frequency: expense.frequency.toLowerCase(),
      dueDate: expense.date.toISOString(),
      emoji: expense.emoji,
      createdAt: expense.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Failed to get expenses from database:", error)
    return []
  }
}

// Add a new expense to database
export async function addExpense(expense: Expense): Promise<void> {
  try {
    await prisma.transaction.create({
      data: {
        id: expense.id,
        type: "EXPENSE",
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        frequency: expense.frequency.toUpperCase(),
        date: new Date(expense.dueDate),
        emoji: expense.emoji,
        createdAt: new Date(expense.createdAt)
      }
    })

    // Dispatch event to notify components
    window.dispatchEvent(new Event("expensesUpdated"))
  } catch (error) {
    console.error("Failed to add expense to database:", error)
    throw error
  }
}

// Update an existing expense in database
export async function updateExpense(updatedExpense: Expense): Promise<void> {
  try {
    await prisma.transaction.update({
      where: {
        id: updatedExpense.id
      },
      data: {
        name: updatedExpense.name,
        amount: updatedExpense.amount,
        category: updatedExpense.category,
        frequency: updatedExpense.frequency.toUpperCase(),
        date: new Date(updatedExpense.dueDate),
        emoji: updatedExpense.emoji
      }
    })
  } catch (error) {
    console.error("Failed to update expense in database:", error)
    throw error
  }
}

// Delete an expense from database
export async function deleteExpense(id: string): Promise<void> {
  try {
    await prisma.transaction.delete({
      where: {
        id: id
      }
    })

    // Dispatch event to notify components
    window.dispatchEvent(new Event("expensesUpdated"))
  } catch (error) {
    console.error("Failed to delete expense from database:", error)
    throw error
  }
}

// Get expense by ID from database
export async function getExpenseById(id: string): Promise<Expense | undefined> {
  try {
    const expense = await prisma.transaction.findUnique({
      where: {
        id: id,
        type: "EXPENSE"
      }
    })

    if (!expense) return undefined

    return {
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      frequency: expense.frequency.toLowerCase(),
      dueDate: expense.date.toISOString(),
      emoji: expense.emoji,
      createdAt: expense.createdAt.toISOString()
    }
  } catch (error) {
    console.error("Failed to get expense by ID from database:", error)
    return undefined
  }
}
