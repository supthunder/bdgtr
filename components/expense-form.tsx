"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
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
    required_error: "Please select a due date.",
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
