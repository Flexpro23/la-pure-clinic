"use client"

import { useState } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import CaseList from "@/components/dashboard/case-list"
import { Button } from "@/components/ui/button"
import { PlusCircle, Wand2, History } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function DashboardClientPage() {
  const { t } = useLanguage()
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const handleFilterClick = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/simulation-history">
                <History className="mr-2 h-5 w-5" /> Simulation History
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/new-simulation">
                <Wand2 className="mr-2 h-5 w-5" /> {t("new.simulation")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/new-case">
                <PlusCircle className="mr-2 h-5 w-5" /> {t("new.case")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title={t("total.cases")}
            value="24"
            icon="📊"
            onClick={() => handleFilterClick(null)}
            isActive={statusFilter === null}
          />
          <StatCard
            title={t("completed.simulations")}
            value="18"
            icon="💇"
            onClick={() => handleFilterClick("completed")}
            isActive={statusFilter === "completed"}
          />
          <StatCard
            title={t("pending.analysis")}
            value="6"
            icon="⏳"
            onClick={() => handleFilterClick("pending")}
            isActive={statusFilter === "pending"}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {statusFilter
              ? `${statusFilter === "completed" ? t("completed.cases") : t("pending.cases")}`
              : t("recent.cases")}
          </h2>
          <CaseList statusFilter={statusFilter} />
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: string
  onClick?: () => void
  isActive?: boolean
}

function StatCard({ title, value, icon, onClick, isActive = false }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-lg transform hover:-translate-y-1" : ""
      } ${isActive ? "ring-2 ring-slate-800 ring-offset-2" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}
