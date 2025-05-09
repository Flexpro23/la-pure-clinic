import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import CaseDetails from "@/components/case/case-details"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Case Details | Hair Transplant Clinic",
  description: "View case details and results",
}

export default function CaseDetailsPage({ params }: { params: { caseId: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button asChild variant="ghost" className="mr-4">
            <Link href="/dashboard">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Case Details</h1>
        </div>

        <CaseDetails caseId={params.caseId} />
      </main>
    </div>
  )
}
