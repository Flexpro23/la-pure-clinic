"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const slides = [
  {
    title: "Welcome to LaPure Medical Clinic",
    description:
      "The ultimate tool for hair transplant clinics to simulate, diagnose, and plan procedures with precision.",
    icon: "✨",
  },
  {
    title: "Hairline Simulation",
    description: "Visualize different hairline shapes and styles to help clients make informed decisions.",
    icon: "💇",
  },
  {
    title: "AI-Powered Diagnosis",
    description: "Analyze scalp health, donor viability, and generate comprehensive reports with our advanced AI.",
    icon: "🔍",
  },
  {
    title: "Intelligent Graft Planning",
    description: "Optimize follicle distribution with AI-generated heatmaps and customizable graft plans.",
    icon: "📊",
  },
]

export default function OnboardingSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="flex justify-center mb-8">
        <div className="relative h-24 w-24">
          <Image src="/images/lapure-logo.png" alt="LaPure Medical Clinic Logo" fill className="object-contain" />
        </div>
      </div>

      <Card className="w-full max-w-3xl overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div className="relative">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="text-4xl mb-4">{slide.icon}</div>
                    <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                    <p className="text-slate-600 mb-6">{slide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-6 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-slate-800" : "bg-slate-300"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="flex justify-between w-full max-w-3xl mt-6">
        <Button variant="outline" onClick={prevSlide} disabled={currentSlide === 0} className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        {currentSlide < slides.length - 1 ? (
          <Button onClick={nextSlide} className="flex items-center">
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link href="/login">Already have an account?</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
