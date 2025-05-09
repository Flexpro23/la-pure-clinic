"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirebase } from "@/contexts/firebase-context"
import { updateUserBalance } from "@/lib/user-utils"
import { toast } from "sonner"
import { PlusCircle, MinusCircle } from "lucide-react"

export default function BalanceUpdateDemo() {
  const { user, userData } = useFirebase()
  const [amount, setAmount] = useState<number>(10)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAddBalance = async () => {
    if (!user || !amount) return
    
    setIsUpdating(true)
    try {
      await updateUserBalance(user.uid, amount)
      toast.success(`Added $${amount} to your balance`)
    } catch (error) {
      toast.error("Failed to update balance")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubtractBalance = async () => {
    if (!user || !amount) return
    
    // Check if there's enough balance
    if ((userData?.balance || 0) < amount) {
      toast.error("Insufficient balance")
      return
    }
    
    setIsUpdating(true)
    try {
      await updateUserBalance(user.uid, -amount)
      toast.success(`Subtracted $${amount} from your balance`)
    } catch (error) {
      toast.error("Failed to update balance")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Balance Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Amount"
              className="w-32"
            />
            <Button 
              onClick={handleAddBalance} 
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
            <Button 
              onClick={handleSubtractBalance} 
              disabled={isUpdating}
              variant="destructive"
            >
              <MinusCircle className="mr-2 h-4 w-4" />
              Spend Funds
            </Button>
          </div>
          <div className="text-sm text-slate-500">
            Current balance: <span className="font-medium">${(userData?.balance || 0).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 