import type { Expense } from "@/types/expense"

// Local storage key for expenses
const EXPENSES_STORAGE_KEY = "budget-tracker-expenses"

// Get all expenses from local storage
export async function getExpenses(): Promise<Expense[]> {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY)
    return storedExpenses ? JSON.parse(storedExpenses) : []
  } catch (error) {
    console.error("Failed to get expenses from local storage:", error)
    return []
  }
}

// Add a new expense to local storage
export async function addExpense(expense: Expense): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  try {
    const expenses = await getExpenses()
    expenses.push(expense)
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses))

    // Dispatch a custom event to notify components that expenses have been updated
    window.dispatchEvent(new Event("expensesUpdated"))
  } catch (error) {
    console.error("Failed to add expense to local storage:", error)
    throw error
  }
}

// Update an existing expense in local storage
export async function updateExpense(updatedExpense: Expense): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  try {
    const expenses = await getExpenses()
    const index = expenses.findIndex((expense) => expense.id === updatedExpense.id)

    if (index !== -1) {
      expenses[index] = updatedExpense
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses))
    } else {
      throw new Error(`Expense with ID ${updatedExpense.id} not found`)
    }
  } catch (error) {
    console.error("Failed to update expense in local storage:", error)
    throw error
  }
}

// Delete an expense from local storage
export async function deleteExpense(id: string): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  try {
    const expenses = await getExpenses()
    const updatedExpenses = expenses.filter((expense) => expense.id !== id)
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses))

    // Dispatch a custom event to notify components that expenses have been updated
    window.dispatchEvent(new Event("expensesUpdated"))
  } catch (error) {
    console.error("Failed to delete expense from local storage:", error)
    throw error
  }
}

// Get expense by ID
export async function getExpenseById(id: string): Promise<Expense | undefined> {
  if (typeof window === "undefined") {
    return undefined
  }

  try {
    const expenses = await getExpenses()
    return expenses.find((expense) => expense.id === id)
  } catch (error) {
    console.error("Failed to get expense by ID from local storage:", error)
    return undefined
  }
}
