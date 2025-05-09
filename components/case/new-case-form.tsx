"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import ImageUpload from "@/components/case/image-upload"
import HairlineSelector from "@/components/case/hairline-selector"
import HairstylePreview from "@/components/case/hairstyle-preview"

export default function NewCaseForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("client-info")
  const [isLoading, setIsLoading] = useState(false)
  const [clientInfo, setClientInfo] = useState({
    name: "",
    age: "",
    notes: "",
  })
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [diagnosticImages, setDiagnosticImages] = useState<{
    front?: File
    left?: File
    right?: File
    back?: File
  }>({})
  const [selectedHairline, setSelectedHairline] = useState("")
  const [selectedHairstyle, setSelectedHairstyle] = useState("")

  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setClientInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleFrontImageUpload = (file: File) => {
    setFrontImage(file)
  }

  const handleDiagnosticImageUpload = (position: string, file: File) => {
    setDiagnosticImages((prev) => ({ ...prev, [position]: file }))
  }

  const handleHairlineSelect = (hairline: string) => {
    setSelectedHairline(hairline)
  }

  const handleHairstyleSelect = (hairstyle: string) => {
    setSelectedHairstyle(hairstyle)
  }

  const handleNextTab = () => {
    if (activeTab === "client-info") {
      setActiveTab("images")
    } else if (activeTab === "images") {
      setActiveTab("hairline")
    } else if (activeTab === "hairline") {
      handleSubmit()
    }
  }

  const handlePrevTab = () => {
    if (activeTab === "images") {
      setActiveTab("client-info")
    } else if (activeTab === "hairline") {
      setActiveTab("images")
    }
  }

  const isTabComplete = () => {
    if (activeTab === "client-info") {
      return clientInfo.name.trim() !== ""
    } else if (activeTab === "images") {
      return (
        frontImage !== null &&
        diagnosticImages.front !== undefined &&
        diagnosticImages.left !== undefined &&
        diagnosticImages.right !== undefined &&
        diagnosticImages.back !== undefined
      )
    } else if (activeTab === "hairline") {
      return selectedHairline !== "" && selectedHairstyle !== ""
    }
    return false
  }

  const handleSubmit = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Generate a random case ID for demo purposes
      const caseId = `case-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`
      router.push(`/dashboard/${caseId}/diagnosis`)
    }, 1500)
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="client-info">Client Information</TabsTrigger>
        <TabsTrigger value="images">Upload Images</TabsTrigger>
        <TabsTrigger value="hairline">Hairline Selection</TabsTrigger>
      </TabsList>

      <TabsContent value="client-info" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  value={clientInfo.name}
                  onChange={handleClientInfoChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="35"
                  value={clientInfo.age}
                  onChange={handleClientInfoChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional information about the client..."
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={clientInfo.notes}
                  onChange={handleClientInfoChange}
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleNextTab} disabled={!isTabComplete()}>
                  Next: Upload Images
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="images" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Frontal Image for Simulation</h3>
                <ImageUpload label="Upload frontal image" onImageUpload={handleFrontImageUpload} imageType="frontal" />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Diagnostic Images (All Angles)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUpload
                    label="Front View"
                    onImageUpload={(file) => handleDiagnosticImageUpload("front", file)}
                    imageType="diagnostic"
                  />
                  <ImageUpload
                    label="Left Side"
                    onImageUpload={(file) => handleDiagnosticImageUpload("left", file)}
                    imageType="diagnostic"
                  />
                  <ImageUpload
                    label="Right Side"
                    onImageUpload={(file) => handleDiagnosticImageUpload("right", file)}
                    imageType="diagnostic"
                  />
                  <ImageUpload
                    label="Back View"
                    onImageUpload={(file) => handleDiagnosticImageUpload("back", file)}
                    imageType="diagnostic"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePrevTab}>
                  Back
                </Button>
                <Button onClick={handleNextTab} disabled={!isTabComplete()}>
                  Next: Hairline Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hairline" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Select Hairline Shape</h3>
                <HairlineSelector onSelect={handleHairlineSelect} selected={selectedHairline} />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Recommended Hairstyles</h3>
                <HairstylePreview
                  hairlineType={selectedHairline}
                  onSelect={handleHairstyleSelect}
                  selected={selectedHairstyle}
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePrevTab}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !isTabComplete()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Create Case & Continue to Analysis"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
