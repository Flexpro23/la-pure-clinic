import type { Metadata } from "next"
import SimulationHistory from "./SimulationHistoryPage"

export const metadata: Metadata = {
  title: "Simulation History | LaPure Medical Clinic",
  description: "View your hair transplant simulation history",
}

export default function Page() {
  return <SimulationHistory />
} 