"use client"

import DashboardHeader from "@/components/dashboard/dashboard-header"
import NewSimulationForm from "@/components/simulation/new-simulation-form"
import { useLanguage } from "@/contexts/language-context"

export default function NewSimulationPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("create.new.simulation")}</h1>
          <p className="text-slate-600 mt-2">{t("create.new.simulation.description")}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <NewSimulationForm />
        </div>
      </main>
    </div>
  )
}
