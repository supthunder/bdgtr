'use server'

import { prisma } from '@/lib/db'
import type { Expense } from '@/types/expense'
import type { Income } from '@/types/income'
import { revalidatePath } from 'next/cache'
import { FrequencyType } from '@/lib/generated/prisma'

export async function getExpenses(): Promise<Expense[]> {
  try {
    const expenses = await prisma.transaction.findMany({
      where: {
        type: "EXPENSE"
      },
      orderBy: {
        date: 'asc'
      },
      take: 50,
      select: {
        id: true,
        name: true,
        amount: true,
        category: true,
        frequency: true,
        date: true,
        emoji: true,
        createdAt: true
      }
    })

    return expenses.map((expense) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      frequency: expense.frequency,
      dueDate: expense.date.toISOString(),
      emoji: expense.emoji,
      createdAt: expense.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Failed to get expenses from database:", error)
    return []
  }
}

export async function getIncome(): Promise<Income[]> {
  try {
    const incomeEntries = await prisma.transaction.findMany({
      where: {
        type: "INCOME"
      },
      orderBy: {
        date: 'asc'
      },
      take: 50,
      select: {
        id: true,
        name: true,
        amount: true,
        category: true,
        frequency: true,
        date: true,
        emoji: true,
        createdAt: true
      }
    })

    return incomeEntries.map((income) => ({
      id: income.id,
      name: income.name,
      amount: income.amount,
      category: income.category,
      frequency: income.frequency,
      receiveDate: income.date.toISOString(),
      emoji: income.emoji,
      createdAt: income.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Failed to get income from database:", error)
    return []
  }
}

export async function addExpense(expense: Expense): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          id: expense.id,
          type: "EXPENSE",
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          frequency: expense.frequency as FrequencyType,
          date: new Date(expense.dueDate),
          emoji: expense.emoji,
          createdAt: new Date(expense.createdAt)
        }
      })
    })
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error("Failed to add expense to database:", error)
    throw error
  }
}

export async function addIncome(income: Income): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          id: income.id,
          type: "INCOME",
          name: income.name,
          amount: income.amount,
          category: income.category,
          frequency: income.frequency as FrequencyType,
          date: new Date(income.receiveDate),
          emoji: income.emoji,
          createdAt: new Date(income.createdAt)
        }
      })
    })
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error("Failed to add income to database:", error)
    throw error
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({
        where: {
          id: id
        }
      })
    })
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error("Failed to delete expense from database:", error)
    throw error
  }
}

export async function deleteIncome(id: string): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({
        where: {
          id: id
        }
      })
    })
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error("Failed to delete income from database:", error)
    throw error
  }
}

export async function updateExpense(updatedExpense: Expense): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: {
          id: updatedExpense.id
        },
        data: {
          name: updatedExpense.name,
          amount: updatedExpense.amount,
          category: updatedExpense.category,
          frequency: updatedExpense.frequency as FrequencyType,
          date: new Date(updatedExpense.dueDate),
          emoji: updatedExpense.emoji
        }
      })
    })
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error("Failed to update expense in database:", error)
    throw error
  }
}

export async function updateIncome(updatedIncome: Income): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: {
          id: updatedIncome.id
        },
        data: {
          name: updatedIncome.name,
          amount: updatedIncome.amount,
          category: updatedIncome.category,
          frequency: updatedIncome.frequency as FrequencyType,
          date: new Date(updatedIncome.receiveDate),
          emoji: updatedIncome.emoji
        }
      })
    })
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error("Failed to update income in database:", error)
    throw error
  }
} 