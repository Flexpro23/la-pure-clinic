"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"

// Mock data for cases
const mockCases = [
  {
    id: "case-001",
    clientName: "James Wilson",
    date: "2023-05-15",
    status: "completed",
    hairlineType: "Arch",
    healthScore: 85,
  },
  {
    id: "case-002",
    clientName: "Robert Johnson",
    date: "2023-05-18",
    status: "completed",
    hairlineType: "V-Shape",
    healthScore: 78,
  },
  {
    id: "case-003",
    clientName: "Sarah Thompson",
    date: "2023-05-20",
    status: "in-progress",
    hairlineType: "Oval",
    healthScore: 92,
  },
  {
    id: "case-004",
    clientName: "Michael Brown",
    date: "2023-05-22",
    status: "pending",
    hairlineType: "Semi-V",
    healthScore: 65,
  },
  {
    id: "case-005",
    clientName: "Emily Davis",
    date: "2023-05-25",
    status: "pending",
    hairlineType: "Arch",
    healthScore: 88,
  },
]

interface CaseListProps {
  statusFilter: string | null
}

export default function CaseList({ statusFilter }: CaseListProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCases = mockCases
    .filter((caseItem) => {
      // Apply status filter
      if (statusFilter === "completed") return caseItem.status === "completed"
      if (statusFilter === "pending") return caseItem.status === "pending"
      return true
    })
    .filter((caseItem) => caseItem.clientName.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder={t("search.cases")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("client.name")}</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hairline Type</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length > 0 ? (
              filteredCases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.clientName}</TableCell>
                  <TableCell>{new Date(caseItem.date).toLocaleDateString()}</TableCell>
                  <TableCell>{caseItem.hairlineType}</TableCell>
                  <TableCell>{caseItem.healthScore}%</TableCell>
                  <TableCell>
                    <StatusBadge status={caseItem.status} />
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost" className="pointer-events-auto">
                      <Link href={`/dashboard/${caseItem.id}`} onClick={(e) => e.stopPropagation()}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No cases found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage()
  let variant: "default" | "secondary" | "outline" = "default"
  let label = "Unknown"

  switch (status) {
    case "completed":
      variant = "default"
      label = t("completed.cases")
      break
    case "in-progress":
      variant = "secondary"
      label = "In Progress"
      break
    case "pending":
      variant = "outline"
      label = t("pending.cases")
      break
  }

  return <Badge variant={variant}>{label}</Badge>
}
