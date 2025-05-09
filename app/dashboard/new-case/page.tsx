import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import NewCaseForm from "@/components/case/new-case-form"

export const metadata: Metadata = {
  title: "New Case | Hair Transplant Clinic",
  description: "Create a new hair transplant case",
}

export default function NewCasePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Case</h1>
          <p className="text-slate-600 mt-2">Upload client images and select hairline options to begin the analysis</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <NewCaseForm />
        </div>
      </main>
    </div>
  )
}
