import OnboardingSlider from "@/components/onboarding/onboarding-slider"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "LaPure Medical Clinic | AI-Powered Hair Transplant Solutions",
  description: "Professional hair transplant simulation and planning tool for clinics",
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <OnboardingSlider />
    </main>
  )
}
