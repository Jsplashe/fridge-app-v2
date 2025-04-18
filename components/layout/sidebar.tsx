"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Home, ChefHat, ShoppingCart, Calendar, Settings, LogOut, PanelLeft, User, BarChart } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = React.useState(false)

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Analytics", path: "/analytics", icon: BarChart },
    { name: "Recipes", path: "/recipes", icon: ChefHat },
    { name: "Shopping List", path: "/shopping-list", icon: ShoppingCart },
    { name: "Meal Calendar", path: "/meal-planner", icon: Calendar },
    { name: "Preferences", path: "/preferences", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    // In a real app, we would call Supabase or Firebase auth logout here
    // await supabase.auth.signOut();
    router.push("/login")
  }

  // If on mobile, don't render the sidebar
  if (isMobile) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "flex h-full flex-col border-r bg-white transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[240px]",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center border-b px-4">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-emerald-600">FRiDGE</span>
            </div>
          ) : (
            <Logo className="mx-auto h-8 w-8 text-emerald-600" />
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-1 flex-col justify-between p-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={cn("w-full justify-start", collapsed && "justify-center px-0")}
                onClick={() => router.push(item.path)}
              >
                <item.icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
                {!collapsed && <span>{item.name}</span>}
              </Button>
            ))}
          </div>

          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn("w-full justify-start text-red-500", collapsed && "justify-center px-0")}
              onClick={handleLogout}
            >
              <LogOut className={cn("h-5 w-5", !collapsed && "mr-2")} />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>

        {/* Collapse Button */}
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setCollapsed(!collapsed)}>
            <PanelLeft className={cn("h-5 w-5", collapsed && "rotate-180")} />
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-auto">{children}</div>
    </div>
  )
}

