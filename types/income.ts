export interface Income {
  id: string
  name: string
  amount: number
  category: string
  frequency: string
  receiveDate: string
  emoji: string
  createdAt: string
}

export type IncomeCreate = Omit<Income, 'id'> & { id?: string } 