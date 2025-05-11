import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isSameDay, addDays, addWeeks, addMonths, addYears } from "date-fns"
import type { Expense } from "@/types/expense"
import type { Income } from "@/types/income"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type TransactionItem = {
  frequency: string;
  dueDate?: string;
  receiveDate?: string;
}

export function getRecurringExpensesForDate<T extends TransactionItem>(date: Date, items: T[]): T[] {
  return items.filter(item => {
    const itemDate = new Date(item.dueDate || item.receiveDate || '')
    if (isNaN(itemDate.getTime())) return false
    
    switch (item.frequency.toLowerCase()) {
      case 'one-time':
        return isSameDay(date, itemDate)
      case 'daily':
        return true
      case 'weekly':
        // Check if the date falls on the same day of the week after the start date
        const weeksSince = Math.floor((date.getTime() - itemDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        return weeksSince >= 0 && isSameDay(date, addWeeks(itemDate, weeksSince))
      case 'monthly':
        // Check if the date falls on the same day of the month after the start date
        const monthsSince = (date.getFullYear() - itemDate.getFullYear()) * 12 + date.getMonth() - itemDate.getMonth()
        return monthsSince >= 0 && isSameDay(date, addMonths(itemDate, monthsSince))
      case 'yearly':
        // Check if the date falls on the same day of the year after the start date
        const yearsSince = date.getFullYear() - itemDate.getFullYear()
        return yearsSince >= 0 && isSameDay(date, addYears(itemDate, yearsSince))
      default:
        return false
    }
  })
}
