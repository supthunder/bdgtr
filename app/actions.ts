'use server'

import { prisma } from '@/lib/db'
import type { Expense } from '@/types/expense'
import type { Income } from '@/types/income'
import { revalidatePath } from 'next/cache'
import { FrequencyType } from '@/lib/generated/prisma'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

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

// ================================
// BACKUP SYSTEM
// ================================

const BACKUP_DIR = path.join(process.cwd(), 'backup data')

// Helper function to ensure backup directory exists
async function ensureBackupDir(): Promise<void> {
  try {
    await fs.access(BACKUP_DIR)
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  }
}

// Helper function to get today's date string
function getTodayString(): string {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD format
}

// Check if daily backup already exists
async function hasDailyBackup(): Promise<boolean> {
  try {
    const today = getTodayString()
    const csvFile = path.join(BACKUP_DIR, `backup_${today}.csv`)
    const sqlFile = path.join(BACKUP_DIR, `backup_${today}.sql`)
    
    await fs.access(csvFile)
    await fs.access(sqlFile)
    return true
  } catch {
    return false
  }
}

// Create CSV backup
async function createCSVBackup(): Promise<string> {
  try {
    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'asc' }
    })

    // Create CSV header
    const header = 'Type,ID,Name,Amount,Category,Frequency,Date,Emoji,CreatedAt,UpdatedAt'
    
    // Create CSV rows
    const rows = transactions.map(tx => {
      const type = tx.type
      const date = tx.date.toISOString()
      const createdAt = tx.createdAt.toISOString()
      const updatedAt = tx.updatedAt.toISOString()
      
      // Escape commas and quotes in text fields
      const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`
      
      return [
        type,
        tx.id,
        escapeCsv(tx.name),
        tx.amount,
        escapeCsv(tx.category),
        tx.frequency,
        date,
        escapeCsv(tx.emoji),
        createdAt,
        updatedAt
      ].join(',')
    })

    const csvContent = [header, ...rows].join('\n')
    
    const today = getTodayString()
    const fileName = `backup_${today}.csv`
    const filePath = path.join(BACKUP_DIR, fileName)
    
    await fs.writeFile(filePath, csvContent, 'utf-8')
    return fileName
  } catch (error) {
    console.error('Failed to create CSV backup:', error)
    throw error
  }
}

// Create PostgreSQL backup
async function createPostgreSQLBackup(): Promise<string> {
  try {
    const today = getTodayString()
    const fileName = `backup_${today}.sql`
    const filePath = path.join(BACKUP_DIR, fileName)
    
    // Use pg_dump to create a backup
    const command = `pg_dump "postgresql://user:password@localhost:5432/planner_db" --clean --if-exists > "${filePath}"`
    
    await execAsync(command)
    return fileName
  } catch (error) {
    console.error('Failed to create PostgreSQL backup:', error)
    throw error
  }
}

// Main backup function - creates daily backup if not already done
export async function createDailyBackup(): Promise<{ success: boolean; message: string; files?: string[] }> {
  try {
    await ensureBackupDir()
    
    // Check if backup already exists for today
    const hasBackup = await hasDailyBackup()
    if (hasBackup) {
      return {
        success: true,
        message: 'Daily backup already exists for today'
      }
    }

    // Create both backups
    const csvFile = await createCSVBackup()
    const sqlFile = await createPostgreSQLBackup()
    
    return {
      success: true,
      message: 'Daily backup created successfully',
      files: [csvFile, sqlFile]
    }
  } catch (error) {
    console.error('Failed to create daily backup:', error)
    return {
      success: false,
      message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Import backup - merge missing data from CSV backup
export async function importBackup(fileName: string): Promise<{ success: boolean; message: string; imported?: number }> {
  try {
    const filePath = path.join(BACKUP_DIR, fileName)
    const csvContent = await fs.readFile(filePath, 'utf-8')
    
    const lines = csvContent.split('\n')
    const header = lines[0]
    const dataLines = lines.slice(1).filter(line => line.trim())
    
    if (!header.includes('Type,ID,Name,Amount')) {
      throw new Error('Invalid CSV format')
    }

    let importedCount = 0

    for (const line of dataLines) {
      try {
        // Parse CSV line (basic parsing, assumes properly escaped CSV)
        const fields = line.split(',')
        if (fields.length < 10) continue

        const [type, id, name, amount, category, frequency, date, emoji, createdAt] = fields
        
        // Clean up quoted fields
        const cleanField = (field: string) => field.replace(/^"|"$/g, '').replace(/""/g, '"')
        
        // Check if transaction already exists
        const existing = await prisma.transaction.findUnique({
          where: { id }
        })
        
        if (!existing) {
          // Import missing transaction
          await prisma.transaction.create({
            data: {
              id,
              type: type as 'INCOME' | 'EXPENSE',
              name: cleanField(name),
              amount: parseFloat(amount),
              category: cleanField(category),
              frequency: frequency as FrequencyType,
              date: new Date(date),
              emoji: cleanField(emoji),
              createdAt: new Date(createdAt)
            }
          })
          importedCount++
        }
      } catch (lineError) {
        console.error('Error processing line:', line, lineError)
        // Continue with next line
      }
    }

    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Successfully imported ${importedCount} missing transactions`,
      imported: importedCount
    }
  } catch (error) {
    console.error('Failed to import backup:', error)
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Restore from PostgreSQL backup - completely replace database
export async function restoreFromBackup(fileName: string): Promise<{ success: boolean; message: string }> {
  try {
    const filePath = path.join(BACKUP_DIR, fileName)
    
    // Check if file exists
    await fs.access(filePath)
    
    // Restore database from SQL backup
    const command = `psql "postgresql://user:password@localhost:5432/planner_db" < "${filePath}"`
    
    await execAsync(command)
    
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Database restored successfully from backup'
    }
  } catch (error) {
    console.error('Failed to restore from backup:', error)
    return {
      success: false,
      message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Get list of available backup files
export async function getBackupFiles(): Promise<{ csv: string[]; sql: string[] }> {
  try {
    await ensureBackupDir()
    const files = await fs.readdir(BACKUP_DIR)
    
    const csvFiles = files.filter(f => f.endsWith('.csv')).sort().reverse()
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort().reverse()
    
    return { csv: csvFiles, sql: sqlFiles }
  } catch (error) {
    console.error('Failed to get backup files:', error)
    return { csv: [], sql: [] }
  }
}