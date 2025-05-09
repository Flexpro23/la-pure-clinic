import type { Metadata } from "next"
import DashboardClientPage from "./DashboardClientPage"

export const metadata: Metadata = {
  title: "Dashboard | LaPure Medical Clinic",
  description: "Manage your hair transplant cases",
}

export default function DashboardPage() {
  return <DashboardClientPage />
}
