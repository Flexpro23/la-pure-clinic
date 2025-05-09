"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut, Settings, PlusCircle, Wand2, History, Wallet } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useFirebase } from "@/contexts/firebase-context"

export default function DashboardHeader() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user, userData } = useFirebase()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    // In a real app, you would handle logout logic here
    router.push("/login")
  }

  const handleSettingsClick = () => {
    router.push("/dashboard/settings")
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="relative h-10 w-10 mr-2">
                <Image src="/images/lapure-logo.png" alt="LaPure Medical Clinic Logo" fill className="object-contain" />
              </div>
              <span className="font-medium text-lg">{t("app.name")}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
              {t("dashboard")}
            </Link>
            <Link href="/dashboard/simulation-history" className="text-slate-600 hover:text-slate-900">
              <History className="inline-block mr-1 h-4 w-4" /> Simulation History
            </Link>
            <Link href="/dashboard/new-case" className="text-slate-600 hover:text-slate-900">
              <PlusCircle className="inline-block mr-1 h-4 w-4" /> {t("new.case")}
            </Link>
            <Link href="/dashboard/new-simulation" className="text-slate-600 hover:text-slate-900">
              <Wand2 className="inline-block mr-1 h-4 w-4" /> {t("new.simulation")}
            </Link>
            <Link href="/dashboard/settings" className="text-slate-600 hover:text-slate-900">
              <Settings className="inline-block mr-1 h-4 w-4" /> {t("settings")}
            </Link>
          </nav>

          {/* Balance Display (Desktop) */}
          <div className="hidden md:flex items-center mr-4">
            <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
              <Wallet className="h-4 w-4 mr-1" />
              <span className="font-medium">${(userData?.balance || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userData?.fullName || "User"}</p>
                    <p className="text-sm text-slate-600">{userData?.clinicName || t("app.name")}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Wallet className="mr-2 h-4 w-4" /> Balance: ${(userData?.balance || 0).toFixed(2)}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" /> {t("settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {/* Balance Display (Mobile) */}
            <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full mr-2">
              <Wallet className="h-3 w-3 mr-1" />
              <span className="text-sm font-medium">${(userData?.balance || 0).toFixed(2)}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                {t("dashboard")}
              </Link>
              <Link href="/dashboard/simulation-history" className="text-slate-600 hover:text-slate-900">
                <History className="inline-block mr-1 h-4 w-4" /> Simulation History
              </Link>
              <Link href="/dashboard/new-case" className="text-slate-600 hover:text-slate-900">
                <PlusCircle className="inline-block mr-1 h-4 w-4" /> {t("new.case")}
              </Link>
              <Link href="/dashboard/new-simulation" className="text-slate-600 hover:text-slate-900">
                <Wand2 className="inline-block mr-1 h-4 w-4" /> {t("new.simulation")}
              </Link>
              <Link href="/dashboard/settings" className="text-slate-600 hover:text-slate-900">
                <Settings className="inline-block mr-1 h-4 w-4" /> {t("settings")}
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="justify-start px-0">
                <LogOut className="mr-2 h-4 w-4" /> {t("logout")}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
