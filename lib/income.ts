import type { Income } from "@/types/income"

// Local storage key for income
const INCOME_STORAGE_KEY = "budget-tracker-income"

// Get all income entries from local storage
export async function getIncome(): Promise<Income[]> {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedIncome = localStorage.getItem(INCOME_STORAGE_KEY)
    return storedIncome ? JSON.parse(storedIncome) : []
  } catch (error) {
    console.error("Failed to get income from local storage:", error)
    return []
  }
}

// Add new income entry
export async function addIncome(income: Income): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  try {
    const currentIncome = await getIncome()
    const updatedIncome = [...currentIncome, income]
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(updatedIncome))
    window.dispatchEvent(new CustomEvent("incomeUpdated"))
  } catch (error) {
    console.error("Failed to add income to local storage:", error)
    throw error
  }
}

// Delete income entry
export async function deleteIncome(id: string): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  try {
    const currentIncome = await getIncome()
    const updatedIncome = currentIncome.filter((income) => income.id !== id)
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(updatedIncome))
    window.dispatchEvent(new CustomEvent("incomeUpdated"))
  } catch (error) {
    console.error("Failed to delete income from local storage:", error)
    throw error
  }
}

// Get income by ID
export async function getIncomeById(id: string): Promise<Income | undefined> {
  if (typeof window === "undefined") {
    return undefined
  }

  try {
    const income = await getIncome()
    return income.find((inc) => inc.id === id)
  } catch (error) {
    console.error("Failed to get income by ID from local storage:", error)
    return undefined
  }
} 