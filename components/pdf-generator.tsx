"use client"

import { useRef } from "react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface PdfGeneratorProps {
  reportData: any
  clientImageUrl: string
}

export default function PdfGenerator({ reportData, clientImageUrl }: PdfGeneratorProps) {
  const handleDownload = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4")
      const width = doc.internal.pageSize.getWidth()
      
      // Add title
      doc.setFontSize(16)
      doc.text("Hair Transplant Consultation Report", width / 2, 20, { align: "center" })
      
      // Add client info
      doc.setFontSize(12)
      doc.text("Client: Mohamad", 20, 30)
      doc.text("Age: 34", 20, 37)
      
      // Add report sections
      let yPosition = 50
      
      // Hair Loss Assessment
      doc.setFontSize(14)
      doc.text("Hair Loss Assessment", 20, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      doc.text(`Pattern: ${reportData.hairLossAssessment.pattern}`, 20, yPosition)
      yPosition += 6
      
      doc.text(`Severity: ${reportData.hairLossAssessment.severity.category} (${reportData.hairLossAssessment.severity.score}/10)`, 20, yPosition)
      yPosition += 10
      
      // Hair Characteristics
      doc.setFontSize(14)
      doc.text("Hair Characteristics", 20, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      doc.text(`Hair Color: ${reportData.characteristics.hairColor}`, 20, yPosition)
      yPosition += 6
      
      doc.text(`Hair Texture: ${reportData.characteristics.hairTexture}`, 20, yPosition)
      yPosition += 10
      
      // Treatment Recommendations
      doc.setFontSize(14)
      doc.text("Treatment Recommendations", 20, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      doc.text(`Graft Count: ${reportData.recommendations.graftCount}`, 20, yPosition)
      yPosition += 10
      
      // Summary
      doc.setFontSize(14)
      doc.text("Summary", 20, yPosition)
      yPosition += 8
      
      // Handle wrapping long text
      const splitSummary = doc.splitTextToSize(reportData.summary, width - 40)
      doc.setFontSize(10)
      doc.text(splitSummary, 20, yPosition)
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text("© 2025 Hair Clinic. All rights reserved.", width / 2, 290, { align: "center" })
      }
      
      doc.save("hair-transplant-report.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleDownload}>
      <Download className="h-4 w-4" />
      Download
    </Button>
  )
} 