import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/reports">
              <Button
                variant={pathname === "/reports" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                Reports
              </Button>
            </Link>
            <Link href="/migrate">
              <Button
                variant={pathname === "/migrate" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                Migrate Data
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 