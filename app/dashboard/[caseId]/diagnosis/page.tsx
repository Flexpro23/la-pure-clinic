import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DiagnosisResults from "@/components/diagnosis/diagnosis-results"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "AI Diagnosis | Hair Transplant Clinic",
  description: "AI-powered scalp and follicle analysis",
}

export default function DiagnosisPage({ params }: { params: { caseId: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Diagnosis</h1>
            <p className="text-slate-600 mt-2">Case ID: {params.caseId}</p>
          </div>

          <Button asChild>
            <Link href={`/dashboard/${params.caseId}/graft-planner`}>Continue to Graft Planner</Link>
          </Button>
        </div>

        <DiagnosisResults caseId={params.caseId} />
      </main>
    </div>
  )
}
