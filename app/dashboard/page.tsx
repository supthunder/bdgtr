import { ExpenseList } from "@/components/expense-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCards, TopCategories } from "@/components/dashboard-cards"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />
      <DashboardCards />
      <TopCategories />
      <ExpenseList />
    </div>
  )
}
