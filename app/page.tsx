import { redirect } from "next/navigation"

export default function Home() {
  // For demo purposes, we'll redirect to the login page
  // In a real app, we would check for authentication here
  redirect("/login")
}

