import { ExpenseList } from "@/components/expense-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCards, TopCategories } from "@/components/dashboard-cards"
import { IncomeList } from "@/components/income-list"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader />
      <DashboardCards />
      <TopCategories />
      <ExpenseList />
      <IncomeList />
    </div>
  )
}
