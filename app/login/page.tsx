import type { Metadata } from "next"
import Image from "next/image"
import LoginForm from "@/components/auth/login-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Login | LaPure Medical Clinic",
  description: "Login to your clinic account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative h-20 w-20">
              <Image src="/images/lapure-logo.png" alt="LaPure Medical Clinic Logo" fill className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-slate-600 mt-2">Login to access your clinic dashboard</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center space-y-4">
          <div>
            <Link href="/forgot-password" className="text-slate-600 hover:text-slate-900 text-sm">
              Forgot your password?
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-slate-600 text-sm">Don't have an account?</span>
            <Button asChild variant="link" className="p-0 h-auto">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
          <div>
            <Button asChild variant="link" className="text-slate-600 text-sm">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
