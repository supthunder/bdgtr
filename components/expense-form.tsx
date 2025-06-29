"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Check, ChevronsUpDown, Clipboard } from "lucide-react"
import { format } from "date-fns"
import type { Expense } from "@/types/expense"
import { toast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { addExpense, updateExpense } from "@/app/actions"
import { cn } from "@/lib/utils"

const categories = [
  { label: "🏠 Rent/Mortgage", value: "housing" },
  { label: "🔌 Utilities", value: "utilities" },
  { label: "🌐 Internet/Cable", value: "internet" },
  { label: "🪑 Furniture", value: "furniture" },
  { label: "🛋️ Home Decor", value: "decor" },
  { label: "🧰 Appliances", value: "appliances" },
  { label: "🧹 Cleaning Supplies", value: "cleaning" },
  { label: "🛠️ Home Maintenance", value: "maintenance" },
  { label: "🏡 Home Insurance", value: "insurance" },
  { label: "🚰 Plumbing", value: "plumbing" },
  { label: "⚡ Electrical", value: "electrical" },
  { label: "❄️ HVAC", value: "hvac" },
  { label: "🏺 Kitchen Items", value: "kitchen" },
  { label: "🛁 Bathroom Items", value: "bathroom" },
  { label: "🌿 Landscaping", value: "landscaping" },
  { label: "📦 Storage/Moving", value: "storage" },
  { label: "💰 Other Housing", value: "other" }
]

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  frequency: z.string({
    required_error: "Please select a frequency.",
  }),
  dueDate: z.date({
    required_error: "Please select a date.",
  }),
})

interface ExpenseFormProps {
  onSuccess?: (expense: Expense) => void
  initialData?: Expense
  isEditing?: boolean
}

export function ExpenseForm({ onSuccess, initialData, isEditing = false }: ExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      amount: initialData?.amount || 0,
      category: initialData?.category || undefined,
      frequency: initialData?.frequency || undefined,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(),
    },
  })

  // Function to parse different bank/credit card statement formats
  function parsePastedText(text: string) {
    try {
      // Remove extra whitespace and normalize
      const cleaned = text.trim()
      
      // Split by tabs or multiple spaces
      const parts = cleaned.split(/\t+|\s{2,}/).filter(part => part.trim())
      
      let parsedData: { name?: string; amount?: number; date?: Date } = {}
      
      // Look for amount (contains $ or is a number)
      const amountRegex = /^\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/
      let amountIndex = -1
      
      for (let i = 0; i < parts.length; i++) {
        const match = parts[i].match(amountRegex)
        if (match) {
          const amount = parseFloat(match[1].replace(/,/g, ''))
          if (amount > 0) {
            parsedData.amount = amount
            amountIndex = i
            break
          }
        }
      }
      
      // Look for date (MM/DD/YY or similar formats)
      const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/
      let dateIndex = -1
      
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].match(dateRegex)) {
          try {
            let dateStr = parts[i]
            // Convert MM/DD/YY to MM/DD/YYYY if needed
            if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
              const [month, day, year] = dateStr.split('/')
              const fullYear = parseInt(year) + (parseInt(year) < 50 ? 2000 : 1900)
              dateStr = `${month}/${day}/${fullYear}`
            }
            parsedData.date = new Date(dateStr)
            dateIndex = i
            break
          } catch {
            // Skip invalid dates
          }
        }
      }
      
      // Extract name/description (skip date and amount parts)
      const nameParts = parts.filter((_, index) => 
        index !== amountIndex && index !== dateIndex && index !== 0 // Skip first date if there are two dates
      )
      
      if (nameParts.length > 0) {
        // Clean up the name - remove transaction IDs and phone numbers
        let name = nameParts.join(' ')
        // Remove common patterns like phone numbers, transaction IDs
        name = name.replace(/\b\d{3}-\d{3}-\d{4}\b/g, '') // Phone numbers
        name = name.replace(/\b[A-Z0-9#]{10,}\b/g, '') // Transaction IDs
        name = name.replace(/\s+/g, ' ').trim()
        
        if (name.length > 2) {
          parsedData.name = name
        }
      }
      
      return parsedData
    } catch (error) {
      console.error('Error parsing pasted text:', error)
      return {}
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      const parsed = parsePastedText(text)
      
      if (parsed.name) {
        form.setValue('name', parsed.name)
      }
      if (parsed.amount) {
        form.setValue('amount', parsed.amount)
      }
      if (parsed.date && !isNaN(parsed.date.getTime())) {
        form.setValue('dueDate', parsed.date)
      }
      
      // Set default frequency to one-time for pasted expenses
      if (!form.getValues('frequency')) {
        form.setValue('frequency', 'ONE_TIME')
      }
      
      toast({
        title: "Data Pasted",
        description: "Form fields have been auto-filled from clipboard data",
      })
    } catch (error) {
      console.error('Failed to paste:', error)
      toast({
        title: "Paste Failed",
        description: "Could not read from clipboard. Please paste manually.",
        variant: "destructive",
      })
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const expenseData = {
        id: initialData?.id || Date.now().toString(),
        name: values.name,
        amount: values.amount,
        category: values.category,
        frequency: values.frequency,
        dueDate: values.dueDate.toISOString(),
        emoji: categories.find((c) => c.value === values.category)?.label.split(" ")[0] || "💰",
        createdAt: initialData?.createdAt || new Date().toISOString(),
      }

      if (onSuccess) {
        onSuccess(expenseData)
      }

      await (isEditing ? updateExpense(expenseData) : addExpense(expenseData))
      form.reset()
      toast({
        title: "Success",
        description: `Expense ${isEditing ? 'updated' : 'added'} successfully`,
      })
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'add'} expense:`, error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} expense. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePaste}
            className="flex items-center gap-2"
          >
            <Clipboard className="h-4 w-4" />
            Paste
          </Button>
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Internet Bill" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "0" : e.target.value;
                    field.onChange(Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Category</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? categories.find((category) => category.value === field.value)?.label
                        : "Select category"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.value}
                            value={category.value}
                            onSelect={(value) => {
                              form.setValue("category", value)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                category.value === field.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {category.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ONE_TIME">One-time</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BI_WEEKLY">Bi-weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">{isEditing ? 'Updating...' : 'Adding...'}</span>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            isEditing ? "Update Expense" : "Add Expense"
          )}
        </Button>
      </form>
    </Form>
  )
}
