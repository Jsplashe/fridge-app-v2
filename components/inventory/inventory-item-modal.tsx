"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Loader2, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface InventoryItem {
  id: string
  name: string
  expiryDate: string
  daysLeft: number
  quantity: number
  unit: string
  category: string
}

interface InventoryItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
}

export function InventoryItemModal({ isOpen, onClose, item }: InventoryItemModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [name, setName] = useState(item?.name || "")
  const [quantity, setQuantity] = useState(item?.quantity.toString() || "1")
  const [unit, setUnit] = useState(item?.unit || "")
  const [category, setCategory] = useState(item?.category || "")
  const [date, setDate] = useState<Date | undefined>(item?.expiryDate ? new Date(item.expiryDate) : undefined)

  // Update form when item changes
  if (item && item.id !== (name ? item.id : "")) {
    setName(item.name)
    setQuantity(item.quantity.toString())
    setUnit(item.unit)
    setCategory(item.category)
    setDate(new Date(item.expiryDate))
  }

  const handleSave = () => {
    setIsSaving(true)

    // Simulate saving to database
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      onClose()
    }, 1000)
  }

  const handleDelete = () => {
    setIsDeleting(true)

    // Simulate deleting from database
    setTimeout(() => {
      setIsDeleting(false)
      onClose()
    }, 1000)
  }

  const getDaysLeft = () => {
    if (!date) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiryDate = new Date(date)
    expiryDate.setHours(0, 0, 0, 0)
    const diffTime = expiryDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft <= 1) return "bg-red-100 text-red-800"
    if (daysLeft <= 3) return "bg-orange-100 text-orange-800"
    return "bg-yellow-100 text-yellow-800"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Item" : "Item Details"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Make changes to this inventory item." : "View details about this item in your inventory."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isEditing ? (
            // View mode
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{item?.name}</h3>
                {date && <Badge className={getStatusColor(getDaysLeft())}>{getDaysLeft()} days left</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantity</p>
                  <p>
                    {item?.quantity} {item?.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p>{item?.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                  <p>{item?.expiryDate ? format(new Date(item.expiryDate), "PPP") : "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Added On</p>
                  <p>{format(new Date(), "PPP")}</p>
                </div>
              </div>
            </>
          ) : (
            // Edit mode
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="items">Items</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                      <SelectItem value="gallon">Gallon</SelectItem>
                      <SelectItem value="cups">Cups</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Meat">Meat</SelectItem>
                    <SelectItem value="Produce">Produce</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                    <SelectItem value="Frozen">Frozen</SelectItem>
                    <SelectItem value="Pantry">Pantry</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this item from your inventory.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
              <Button onClick={onClose}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

