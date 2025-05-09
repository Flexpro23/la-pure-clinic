import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import GraftPlannerResults from "@/components/planner/graft-planner-results"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Graft Planner | Hair Transplant Clinic",
  description: "AI-powered graft distribution planning",
}

export default function GraftPlannerPage({ params }: { params: { caseId: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Graft Planner</h1>
            <p className="text-slate-600 mt-2">Case ID: {params.caseId}</p>
          </div>

          <div className="flex space-x-4">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/${params.caseId}/diagnosis`}>Back to Diagnosis</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Save & Finish</Link>
            </Button>
          </div>
        </div>

        <GraftPlannerResults caseId={params.caseId} />
      </main>
    </div>
  )
}
