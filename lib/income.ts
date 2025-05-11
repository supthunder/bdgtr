import type { Income } from "@/types/income"
import { prisma } from "./db"
import type { Transaction } from "../lib/generated/prisma/index"

// Get all income entries from database
export async function getIncome(): Promise<Income[]> {
  try {
    const incomeEntries = await prisma.transaction.findMany({
      where: {
        type: "INCOME"
      },
      orderBy: {
        date: 'asc'
      }
    })

    return incomeEntries.map((income: Transaction) => ({
      id: income.id,
      name: income.name,
      amount: income.amount,
      category: income.category,
      frequency: income.frequency.toLowerCase(),
      receiveDate: income.date.toISOString(),
      emoji: income.emoji,
      createdAt: income.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Failed to get income from database:", error)
    return []
  }
}

// Add new income entry to database
export async function addIncome(income: Income): Promise<void> {
  try {
    await prisma.transaction.create({
      data: {
        id: income.id,
        type: "INCOME",
        name: income.name,
        amount: income.amount,
        category: income.category,
        frequency: income.frequency.toUpperCase(),
        date: new Date(income.receiveDate),
        emoji: income.emoji,
        createdAt: new Date(income.createdAt)
      }
    })
    window.dispatchEvent(new CustomEvent("incomeUpdated"))
  } catch (error) {
    console.error("Failed to add income to database:", error)
    throw error
  }
}

// Delete income entry from database
export async function deleteIncome(id: string): Promise<void> {
  try {
    await prisma.transaction.delete({
      where: {
        id: id
      }
    })
    window.dispatchEvent(new CustomEvent("incomeUpdated"))
  } catch (error) {
    console.error("Failed to delete income from database:", error)
    throw error
  }
}

// Get income by ID from database
export async function getIncomeById(id: string): Promise<Income | undefined> {
  try {
    const income = await prisma.transaction.findUnique({
      where: {
        id: id,
        type: "INCOME"
      }
    })

    if (!income) return undefined

    return {
      id: income.id,
      name: income.name,
      amount: income.amount,
      category: income.category,
      frequency: income.frequency.toLowerCase(),
      receiveDate: income.date.toISOString(),
      emoji: income.emoji,
      createdAt: income.createdAt.toISOString()
    }
  } catch (error) {
    console.error("Failed to get income by ID from database:", error)
    return undefined
  }
} 