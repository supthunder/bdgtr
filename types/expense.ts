export interface Expense {
  id: string
  name: string
  amount: number
  category: string
  frequency: string
  dueDate: string
  emoji: string
  createdAt: string
}

export type ExpenseCreate = Omit<Expense, 'id'> & { id?: string }
