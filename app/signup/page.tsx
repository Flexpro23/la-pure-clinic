import type { Metadata } from "next"
import Image from "next/image"
import SignupForm from "@/components/auth/signup-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Sign Up | LaPure Medical Clinic",
  description: "Create a new clinic account",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative h-20 w-20">
              <Image src="/images/lapure-logo.png" alt="LaPure Medical Clinic Logo" fill className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-slate-600 mt-2">Join our platform to enhance your clinic's capabilities</p>
        </div>

        <SignupForm />

        <div className="mt-6 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-slate-600 text-sm">Already have an account?</span>
            <Button asChild variant="link" className="p-0 h-auto">
              <Link href="/login">Login</Link>
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
