"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, Database, AlertTriangle, CheckCircle } from "lucide-react"
import { createDailyBackup, importBackup, restoreFromBackup, getBackupFiles } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

interface BackupFiles {
  csv: string[]
  sql: string[]
}

export function BackupManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [backupFiles, setBackupFiles] = useState<BackupFiles>({ csv: [], sql: [] })
  const [selectedCsvFile, setSelectedCsvFile] = useState<string>("")
  const [selectedSqlFile, setSelectedSqlFile] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadBackupFiles = async () => {
    try {
      const files = await getBackupFiles()
      setBackupFiles(files)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load backup files",
        variant: "destructive",
      })
    }
  }

  const handleOpenDialog = () => {
    setIsOpen(true)
    loadBackupFiles()
  }

  const handleCreateBackup = async () => {
    setIsLoading(true)
    try {
      const result = await createDailyBackup()
      
      if (result.success) {
        toast({
          title: "Backup Success",
          description: result.message,
        })
        // Reload backup files list
        await loadBackupFiles()
      } else {
        toast({
          title: "Backup Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleImportBackup = async () => {
    if (!selectedCsvFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await importBackup(selectedCsvFile)
      
      if (result.success) {
        toast({
          title: "Import Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import backup",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleRestoreBackup = async () => {
    if (!selectedSqlFile) {
      toast({
        title: "No File Selected",
        description: "Please select a SQL file to restore",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await restoreFromBackup(selectedSqlFile)
      
      if (result.success) {
        toast({
          title: "Restore Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Restore Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore backup",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleOpenDialog}>
          <Database className="h-4 w-4 mr-2" />
          Backup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Backup & Restore</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create Daily Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Create Daily Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Creates CSV (for Excel) and PostgreSQL backup files if not already done today
              </p>
              <Button 
                onClick={handleCreateBackup} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Backup"}
              </Button>
            </CardContent>
          </Card>

          {/* Import Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Missing Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Import missing transactions from CSV backup (only adds new data)
              </p>
              <Select value={selectedCsvFile} onValueChange={setSelectedCsvFile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CSV backup file" />
                </SelectTrigger>
                <SelectContent>
                  {backupFiles.csv.map((file) => (
                    <SelectItem key={file} value={file}>
                      {file}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleImportBackup} 
                disabled={isLoading || !selectedCsvFile}
                className="w-full"
                variant="secondary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Importing..." : "Import Missing Data"}
              </Button>
            </CardContent>
          </Card>

          {/* Restore Backup */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Restore Database (Danger Zone)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ⚠️ This will completely replace your database with the backup file
              </p>
              <Select value={selectedSqlFile} onValueChange={setSelectedSqlFile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select SQL backup file" />
                </SelectTrigger>
                <SelectContent>
                  {backupFiles.sql.map((file) => (
                    <SelectItem key={file} value={file}>
                      {file}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleRestoreBackup} 
                disabled={isLoading || !selectedSqlFile}
                className="w-full"
                variant="destructive"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {isLoading ? "Restoring..." : "Restore Database"}
              </Button>
            </CardContent>
          </Card>

          {/* Available Files Info */}
          <Card>
            <CardHeader>
              <CardTitle>Available Backup Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">CSV Files ({backupFiles.csv.length})</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    {backupFiles.csv.slice(0, 3).map((file) => (
                      <li key={file} className="truncate">{file}</li>
                    ))}
                    {backupFiles.csv.length > 3 && (
                      <li>... and {backupFiles.csv.length - 3} more</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">SQL Files ({backupFiles.sql.length})</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    {backupFiles.sql.slice(0, 3).map((file) => (
                      <li key={file} className="truncate">{file}</li>
                    ))}
                    {backupFiles.sql.length > 3 && (
                      <li>... and {backupFiles.sql.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 