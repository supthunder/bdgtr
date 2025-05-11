export const dynamic = 'force-dynamic'
export const revalidate = 0

import { ExpenseList } from "@/components/expense-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCards, TopCategories } from "@/components/dashboard-cards"
import { IncomeList } from "@/components/income-list"
import { getExpenses, getIncome } from "@/app/actions"
import { unstable_noStore as noStore } from 'next/cache'

export default async function DashboardPage() {
  noStore()
  
  // Fetch initial data
  const [expenses, income] = await Promise.all([
    getExpenses(),
    getIncome()
  ])

  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader />
      <DashboardCards expenses={expenses} income={income} />
      <TopCategories expenses={expenses} income={income} />
      <ExpenseList initialExpenses={expenses} />
      <IncomeList initialIncome={income} />
    </div>
  )
}
