"use client"

import { BackupManager } from "@/components/backup-manager"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budget Dashboard</h1>
        <p className="text-muted-foreground">Track and manage your monthly expenses</p>
      </div>
      <div className="flex items-center gap-2">
        <BackupManager />
      </div>
    </div>
  )
}
