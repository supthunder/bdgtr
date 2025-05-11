import { prisma } from '../lib/db'
import type { Expense } from '@/types/expense'
import type { Income } from '@/types/income'
import type { Transaction, FrequencyType } from '../lib/generated/prisma/index'

async function migrateData() {
  if (typeof window === 'undefined') {
    console.log('This script must be run in the browser')
    return
  }

  try {
    // Get data from localStorage
    const expenses = JSON.parse(localStorage.getItem('budget-tracker-expenses') || '[]') as Expense[]
    const income = JSON.parse(localStorage.getItem('budget-tracker-income') || '[]') as Income[]

    // Migrate expenses
    for (const expense of expenses) {
      await prisma.transaction.create({
        data: {
          id: expense.id,
          type: "EXPENSE",
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          frequency: expense.frequency.toUpperCase() as FrequencyType,
          date: new Date(expense.dueDate),
          emoji: expense.emoji,
          createdAt: new Date(expense.createdAt),
          updatedAt: new Date()
        }
      })
    }

    // Migrate income
    for (const inc of income) {
      await prisma.transaction.create({
        data: {
          id: inc.id,
          type: "INCOME",
          name: inc.name,
          amount: inc.amount,
          category: inc.category,
          frequency: inc.frequency.toUpperCase() as FrequencyType,
          date: new Date(inc.receiveDate),
          emoji: inc.emoji,
          createdAt: new Date(inc.createdAt),
          updatedAt: new Date()
        }
      })
    }

    console.log('Migration completed successfully!')
    console.log(`Migrated ${expenses.length} expenses and ${income.length} income entries`)

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Execute migration
migrateData() 