"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Sparkles, Save, Moon, Mail, Key, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { PremiumModal } from "@/components/premium-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function SettingsView() {
  const { toast } = useToast()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Notification settings
  const [expiryReminders, setExpiryReminders] = useState(true)
  const [mealSuggestions, setMealSuggestions] = useState(true)
  const [shoppingReminders, setShoppingReminders] = useState(false)

  // Preference settings
  const [darkMode, setDarkMode] = useState(false)
  const [dietaryTags, setDietaryTags] = useState<string[]>(["Vegetarian", "Low Carb"])
  const [cuisinePreference, setCuisinePreference] = useState("all")

  // Account settings
  const [email, setEmail] = useState("john.doe@example.com")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleUpgradeClick = () => {
    setShowPremiumModal(true)
  }

  const handleSaveSettings = (tab: string) => {
    setIsSaving(true)

    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings saved",
        description: `Your ${tab} settings have been updated successfully.`,
      })
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Display Settings</h3>

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
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dietary Preferences</h3>

                  <div className="space-y-2">
                    <Label htmlFor="dietary-tags">Dietary Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Low Carb", "Keto", "Paleo"].map((tag) => (
                        <Badge
                          key={tag}
                          variant={dietaryTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (dietaryTags.includes(tag)) {
                              setDietaryTags(dietaryTags.filter((t) => t !== tag))
                            } else {
                              setDietaryTags([...dietaryTags, tag])
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Select all that apply. These will be used to filter recipe suggestions.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisine-preference">Cuisine Preference</Label>
                    <Select value={cuisinePreference} onValueChange={setCuisinePreference}>
                      <SelectTrigger id="cuisine-preference">
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
                    <p className="text-xs text-gray-500">We'll prioritize recipes from your favorite cuisine</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("preference")} disabled={isSaving}>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Settings</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="expiry-reminders" className="flex items-center">
                        <Bell className="mr-2 h-4 w-4 text-emerald-600" />
                        Expiry Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Get notified when items in your fridge are about to expire
                      </p>
                    </div>
                    <Switch id="expiry-reminders" checked={expiryReminders} onCheckedChange={setExpiryReminders} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="meal-suggestions">Meal Suggestions</Label>
                      <p className="text-sm text-gray-500">
                        Receive daily meal suggestions based on your fridge contents
                      </p>
                    </div>
                    <Switch id="meal-suggestions" checked={mealSuggestions} onCheckedChange={setMealSuggestions} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="shopping-reminders">Shopping Reminders</Label>
                      <p className="text-sm text-gray-500">
                        Get reminded to buy items on your shopping list when you're near a store
                      </p>
                    </div>
                    <Switch
                      id="shopping-reminders"
                      checked={shoppingReminders}
                      onCheckedChange={setShoppingReminders}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("notification")} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Notification Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Free Plan</h3>
                      <p className="text-sm text-gray-500">Your current plan</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-gray-200" />
                      <p className="text-sm">Limited recipe swipes (5 per day)</p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-gray-200" />
                      <p className="text-sm">Basic inventory management</p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-gray-200" />
                      <p className="text-sm">Manual item entry only</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="flex items-center text-lg font-medium text-emerald-800">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Premium Plan
                      </h3>
                      <p className="text-sm text-emerald-700">Unlock all features</p>
                    </div>
                    <Badge className="bg-emerald-500">$9.99/month</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-emerald-400" />
                      <p className="text-sm text-emerald-800">Unlimited recipe swipes</p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-emerald-400" />
                      <p className="text-sm text-emerald-800">AI-powered inventory management</p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-emerald-400" />
                      <p className="text-sm text-emerald-800">Receipt and barcode scanning</p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-emerald-400" />
                      <p className="text-sm text-emerald-800">Advanced meal planning</p>
                    </div>
                  </div>
                  <Button className="mt-4 w-full" onClick={handleUpgradeClick}>
                    Upgrade to Premium
                  </Button>
                </div>

                <div className="rounded-md bg-gray-50 p-3">
                  <p className="text-sm text-gray-600">Subscription management powered by Stripe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-emerald-600" />
                      Email Address
                    </Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <Key className="mr-2 h-4 w-4 text-emerald-600" />
                    Change Password
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("account")} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Account Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showPremiumModal && (
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          message="Unlock all premium features and take your kitchen management to the next level!"
        />
      )}
    </div>
  )
}

