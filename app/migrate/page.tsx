'use client'

import { useEffect, useState } from 'react'
import { addExpense, addIncome } from '../actions'
import type { Expense } from '@/types/expense'
import type { Income } from '@/types/income'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function MigratePage() {
  const [migrating, setMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function migrateData() {
    if (typeof window === 'undefined') return

    setMigrating(true)
    setError(null)
    try {
      // Get data from localStorage
      const expenses = JSON.parse(localStorage.getItem('budget-tracker-expenses') || '[]') as Expense[]
      const income = JSON.parse(localStorage.getItem('budget-tracker-income') || '[]') as Income[]

      // Migrate expenses
      for (const expense of expenses) {
        await addExpense(expense)
      }

      // Migrate income
      for (const inc of income) {
        await addIncome(inc)
      }

      setSuccess(true)
      
      // Clear localStorage after successful migration
      localStorage.removeItem('budget-tracker-expenses')
      localStorage.removeItem('budget-tracker-income')

    } catch (error) {
      console.error('Migration failed:', error)
      setError('Failed to migrate data. Please try again.')
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Data Migration</h1>
      
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Migration completed successfully!</p>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="mt-4"
          >
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p>This will migrate your data from localStorage to the PostgreSQL database.</p>
          <div className="flex gap-4">
            <Button 
              onClick={migrateData} 
              disabled={migrating}
            >
              {migrating ? 'Migrating...' : 'Start Migration'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 