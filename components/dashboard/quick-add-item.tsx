"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, Barcode, Loader2, CalendarIcon, HelpCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

interface QuickAddItemProps {
  onPremiumPrompt: (message: string) => void
}

export function QuickAddItem({ onPremiumPrompt }: QuickAddItemProps) {
  const { toast } = useToast()
  const [newItem, setNewItem] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unit, setUnit] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const [isLoading, setIsLoading] = useState(false)
  const [receiptUpload, setReceiptUpload] = useState(false)

  const handleAddItem = () => {
    if (newItem.trim()) {
      setIsLoading(true)
      // Simulate adding item to database
      setTimeout(() => {
        toast({
          title: "Item added",
          description: `${newItem} has been added to your inventory.`,
        })
        setNewItem("")
        setQuantity("1")
        setUnit("")
        setCategory("")
        setDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleScanReceipt = () => {
    onPremiumPrompt("Want AI to auto-update your inventory? Upgrade to Premium.")
  }

  const handleScanBarcode = () => {
    onPremiumPrompt("Barcode scanning is a premium feature. Upgrade to Premium for instant product recognition.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Item</CardTitle>
        <CardDescription>Add items to your fridge inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
            <TabsTrigger value="barcode">Barcode</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  placeholder="e.g., Milk, Eggs, Bread"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="quantity">Quantity</Label>
                  </div>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="unit">Unit</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select the unit of measurement for this item</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
                <div className="flex items-center gap-1">
                  <Label htmlFor="category">Category</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Categorize your item for better organization</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="pantry">Pantry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>When will this item expire? We'll remind you before it goes bad.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
              <div className="flex items-center space-x-2 pt-2">
                <Label htmlFor="receipt-upload" className="flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Upload Receipt (Optional)
                </Label>
                <input
                  type="checkbox"
                  id="receipt-upload"
                  checked={receiptUpload}
                  onChange={() => setReceiptUpload(!receiptUpload)}
                  className="ml-auto h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              {receiptUpload && (
                <div className="rounded-md border-2 border-dashed border-gray-300 p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Drag and drop a receipt photo or click to browse</p>
                </div>
              )}
              <Button className="w-full" onClick={handleAddItem} disabled={isLoading || !newItem.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Add to Fridge
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="receipt">
            <div className="space-y-4">
              <div className="rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Upload a receipt photo to automatically add items</p>
                <p className="text-xs text-gray-400">Powered by Google Vision API</p>
              </div>
              <Button className="w-full" variant="outline" onClick={handleScanReceipt}>
                <Upload className="mr-2 h-4 w-4" /> Upload Receipt
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="barcode">
            <div className="space-y-4">
              <div className="rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
                <Barcode className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Scan a barcode to instantly add items</p>
                <p className="text-xs text-gray-400">Premium feature</p>
              </div>
              <Button className="w-full" variant="outline" onClick={handleScanBarcode}>
                <Barcode className="mr-2 h-4 w-4" /> Scan Barcode
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

