"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ChefHat, ShoppingCart, Calendar, Settings, LogOut, Menu, Bell, User, Refrigerator } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Logo } from "@/components/logo"
import { usePathname, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Recipes", path: "/recipes", icon: ChefHat },
    { name: "Inventory", path: "/inventory", icon: Refrigerator },
    { name: "Shopping List", path: "/shopping-list", icon: ShoppingCart },
    { name: "Meal Planner", path: "/meal-planner", icon: Calendar },
    { name: "Settings", path: "/settings", icon: Settings },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 py-4">
                    <Logo className="h-8 w-8 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-600">FRiDGE</span>
                  </div>
                  <div className="flex flex-col gap-1 py-4">
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={isActive(item.path) ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => {
                          router.push(item.path)
                          setIsSidebarOpen(false)
                        }}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.name}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-auto border-t pt-4">
                    <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">FRiDGE</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center text-sm font-medium ${
                isActive(item.path) ? "text-emerald-600" : "hover:text-emerald-600"
              }`}
            >
              <item.icon className="mr-1 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium">Milk is expiring soon</div>
                  <div className="text-sm text-gray-500">Expires in 2 days</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium">New recipe suggestion</div>
                  <div className="text-sm text-gray-500">Based on your inventory</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium">Weekly meal plan ready</div>
                  <div className="text-sm text-gray-500">Check out your personalized plan</div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm font-medium text-emerald-600">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>{user?.email?.[0].toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/preferences")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

