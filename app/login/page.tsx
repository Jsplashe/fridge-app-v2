import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/logo"
import { DemoUser } from "@/components/auth/demo-user"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-emerald-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo className="h-12 w-12" />
          <h1 className="text-3xl font-bold text-emerald-600">FRiDGE</h1>
          <p className="text-gray-500">Your smart kitchen assistant</p>
        </div>
        <LoginForm />
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gradient-to-b from-white to-emerald-50 px-2 text-muted-foreground">Or try a demo</span>
          </div>
        </div>
        <DemoUser />
      </div>
    </div>
  )
}

