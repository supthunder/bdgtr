"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart3, CreditCard, Settings, Calendar, DollarSign, Tags, Menu, LayoutDashboard, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"


const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-6 h-6" />,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: <Calendar className="w-6 h-6" />,
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <DollarSign className="h-6 w-6" />
              <span>Budget Tracker</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/reports"}>
                  <Link href="/reports">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/calendar"}>
                  <Link href="/calendar">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Calendar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden ml-2 mt-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <DollarSign className="h-6 w-6" />
                  <span>Budget Tracker</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <div className="space-y-1 px-2">
                  <Button
                    variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/reports" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/reports">
                      <FileText className="mr-2 h-4 w-4" />
                      Reports
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/calendar" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/calendar">
                      <Calendar className="mr-2 h-4 w-4" />
                      Calendar
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="border-t p-4">
                <Button
                  variant={pathname === "/settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger className="hidden md:flex" />
          </header>
          <main className="flex-1 w-full p-4 lg:p-6">
            <div className="mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
