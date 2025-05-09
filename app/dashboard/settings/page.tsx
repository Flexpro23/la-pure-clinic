"use client"

import DashboardHeader from "@/components/dashboard/dashboard-header"
import SettingsForm from "@/components/settings/settings-form"
import { useLanguage } from "@/contexts/language-context"

export default function SettingsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
          <p className="text-slate-600 mt-2">{t("settings.description")}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <SettingsForm />
        </div>
      </main>
    </div>
  )
}
