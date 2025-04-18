"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function DemoUser() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      // First, try to sign in with the original demo email
      let { error } = await supabase.auth.signInWithPassword({
        email: "demo@fridgeapp.com",
        password: "demo123456",
      })

      // If that fails, try to create a new demo user
      if (error) {
        console.log("Original demo user not found, creating a new one...")
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: "demo2@fridgeapp.com",
          password: "demo123456",
        })

        if (signUpError) throw signUpError

        // Sign in with the new demo user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: "demo2@fridgeapp.com",
          password: "demo123456",
        })

        if (signInError) throw signInError
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Demo login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleDemoLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging in...
        </>
      ) : (
        "Continue with Demo Account"
      )}
    </Button>
  )
}

