import { SignupForm } from "@/components/auth/signup-form"
import { Logo } from "@/components/logo"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-emerald-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo className="h-12 w-12" />
          <h1 className="text-3xl font-bold text-emerald-600">FRiDGE</h1>
          <p className="text-gray-500">Create your account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}

