"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"
import { useFirebase } from "@/contexts/firebase-context"
import { sendPasswordResetEmail } from "firebase/auth"
import { toast } from "sonner"

export default function ForgotPasswordForm() {
  const { auth } = useFirebase()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await sendPasswordResetEmail(auth, email)
      setIsSubmitted(true)
      toast.success("Reset link sent successfully")
    } catch (error: any) {
      setIsLoading(false)
      const errorMessage = error.message || "Failed to send reset link"
      
      if (errorMessage.includes("auth/user-not-found")) {
        setError("No account found with this email address")
      } else if (errorMessage.includes("auth/invalid-email")) {
        setError("Invalid email address")
      } else {
        setError(errorMessage)
      }
      
      toast.error("Failed to send reset link")
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Reset Link Sent</h3>
            <p className="text-slate-600 mb-4">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the
              instructions.
            </p>
            <p className="text-sm text-slate-500">If you don't see the email, please check your spam folder.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="clinic@example.com"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
