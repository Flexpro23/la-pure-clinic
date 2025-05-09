import type { Metadata } from "next"
import Image from "next/image"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Forgot Password | LaPure Medical Clinic",
  description: "Reset your password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative h-20 w-20">
              <Image src="/images/lapure-logo.png" alt="LaPure Medical Clinic Logo" fill className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-slate-600 mt-2">Enter your email to receive a password reset link</p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-6 text-center">
          <Button asChild variant="link">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
