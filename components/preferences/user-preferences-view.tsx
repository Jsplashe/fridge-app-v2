"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Moon, Calendar, Save, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function UserPreferencesView() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // Notification preferences
  const [expiryReminders, setExpiryReminders] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [weeklyMealNotifications, setWeeklyMealNotifications] = useState(true)

  // Dietary preferences
  const [dietaryPreference, setDietaryPreference] = useState("none")
  const [cuisineType, setCuisineType] = useState("all")

  const handleSavePreferences = () => {
    setIsSaving(true)

    // Simulate saving preferences
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully.",
      })
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>Customize your FRiDGE experience with these settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications & Display</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="expiry-reminders" className="flex items-center">
                  <Bell className="mr-2 h-4 w-4 text-emerald-600" />
                  Enable Expiry Reminders
                </Label>
                <p className="text-sm text-gray-500">Get notified when items in your fridge are about to expire</p>
              </div>
              <Switch id="expiry-reminders" checked={expiryReminders} onCheckedChange={setExpiryReminders} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="flex items-center">
                  <Moon className="mr-2 h-4 w-4 text-emerald-600" />
                  Dark Mode
                </Label>
                <p className="text-sm text-gray-500">Switch to dark theme for comfortable viewing in low light</p>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-meal-notifications" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-emerald-600" />
                  Weekly Meal Notifications
                </Label>
                <p className="text-sm text-gray-500">Receive weekly meal plan suggestions every Sunday</p>
              </div>
              <Switch
                id="weekly-meal-notifications"
                checked={weeklyMealNotifications}
                onCheckedChange={setWeeklyMealNotifications}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Food Preferences</h3>

            <div className="space-y-2">
              <Label htmlFor="dietary-preference">Dietary Preference</Label>
              <Select value={dietaryPreference} onValueChange={setDietaryPreference}>
                <SelectTrigger id="dietary-preference">
                  <SelectValue placeholder="Select dietary preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Specific Diet</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                  <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                  <SelectItem value="low-carb">Low Carb</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">This helps us suggest recipes that match your dietary needs</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine-type">Cuisine Type</Label>
              <Select value={cuisineType} onValueChange={setCuisineType}>
                <SelectTrigger id="cuisine-type">
                  <SelectValue placeholder="Select preferred cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">We'll prioritize recipes from your favorite cuisine</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSavePreferences} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

