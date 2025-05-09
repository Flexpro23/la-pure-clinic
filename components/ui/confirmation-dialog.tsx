"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useFirebase } from "@/contexts/firebase-context"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  costRange: string
  exactCost: number
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  costRange,
  exactCost,
}: ConfirmationDialogProps) {
  const { userData } = useFirebase()
  const userBalance = userData?.balance || 0
  const isInsufficientBalance = userBalance < exactCost

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="mt-2 p-3 bg-slate-50 rounded-md">
          <div className="font-medium text-slate-900">Cost Information:</div>
          <div className="text-slate-600 mt-1">This action will cost approximately <span className="font-medium">{costRange}</span> based on complexity.</div>
          
          <div className="mt-2 flex items-center gap-2">
            <span className="text-slate-600">Your current balance:</span>
            <span className={`font-medium ${isInsufficientBalance ? "text-red-600" : "text-green-600"}`}>
              ${userBalance.toFixed(2)}
            </span>
          </div>
          
          {isInsufficientBalance && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
              ⚠️ Insufficient balance. Please add funds to your account.
            </div>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isInsufficientBalance}
            className={`${isInsufficientBalance ? "bg-slate-400" : "bg-primary"}`}
          >
            {isInsufficientBalance ? "Add Funds Required" : "Confirm & Proceed"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 