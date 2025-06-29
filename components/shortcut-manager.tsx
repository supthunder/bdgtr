"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, ExternalLink, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import { getShortcuts, addShortcut, deleteShortcut } from "@/app/actions"
import type { Shortcut, ShortcutCreate } from "@/types/shortcut"
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
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  })
})

export function ShortcutManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      category: undefined,
    },
  })

  const loadShortcuts = async () => {
    setIsLoading(true)
    try {
      const data = await getShortcuts()
      setShortcuts(data)
    } catch (error) {
      console.error("Failed to load shortcuts:", error)
      toast({
        title: "Error",
        description: "Failed to load shortcuts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShortcuts()
  }, [])

  useEffect(() => {
    if (isDialogOpen) {
      loadShortcuts()
    }
  }, [isDialogOpen])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const selectedCategory = categories.find(c => c.value === values.category)
      const emoji = selectedCategory?.label.split(" ")[0] || "🔗"

      const shortcutData: ShortcutCreate = {
        name: values.name,
        url: values.url,
        category: values.category,
        emoji: emoji
      }

      await addShortcut(shortcutData)
      
      form.reset()
      await loadShortcuts()
      
      toast({
        title: "Success",
        description: "Shortcut added successfully",
      })
    } catch (error) {
      console.error("Failed to add shortcut:", error)
      toast({
        title: "Error",
        description: "Failed to add shortcut. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteShortcut(id)
      await loadShortcuts()
      toast({
        title: "Success",
        description: "Shortcut deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete shortcut:", error)
      toast({
        title: "Error",
        description: "Failed to delete shortcut. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShortcutClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Shortcut buttons */}
      {shortcuts.map((shortcut) => (
        <Button
          key={shortcut.id}
          variant="outline"
          size="sm"
          onClick={() => handleShortcutClick(shortcut.url)}
          className="flex items-center gap-2"
          title={`${shortcut.name} - ${shortcut.url}`}
        >
          <span>{shortcut.emoji}</span>
          <span className="hidden sm:inline">{shortcut.name}</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      ))}

      {/* Add shortcut dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Shortcuts</DialogTitle>
            <DialogDescription>
              Add quick links to frequently visited sites like your mortgage or utility providers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add new shortcut form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Mortgage Site" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
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
                      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
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
                                      setCategoryOpen(false)
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

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Shortcut"}
                </Button>
              </form>
            </Form>

            {/* Existing shortcuts list */}
            {shortcuts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Current Shortcuts</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {shortcuts.map((shortcut) => (
                    <div key={shortcut.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span>{shortcut.emoji}</span>
                        <div>
                          <div className="font-medium">{shortcut.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {shortcut.url}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(shortcut.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 