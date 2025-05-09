"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface ImageUploadProps {
  label: string
  onImageUpload: (file: File) => void
  imageType: "frontal" | "diagnostic"
  imageName?: string
  description?: string
  size?: "normal" | "small"
}

export default function ImageUpload({
  label,
  onImageUpload,
  imageType,
  imageName = "Patient Image",
  description = "This image will be used for analysis and simulation",
  size = "normal",
}: ImageUploadProps) {
  const { t } = useLanguage()
  const [image, setImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setIsUploaded(true)
      onImageUpload(file)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setImage(null)
    setIsUploaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Determine aspect ratio based on size
  const aspectRatio = size === "small" ? "aspect-[4/3]" : "aspect-video"

  return (
    <div className="w-full">
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      {!image ? (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging ? "border-slate-500 bg-slate-50" : "border-slate-300 hover:border-slate-500"
          } ${size === "small" ? "py-3" : "p-6"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className={size === "small" ? "h-6 w-6 text-slate-500" : "h-8 w-8 text-slate-500"} />
            <p className={size === "small" ? "text-xs font-medium" : "text-sm font-medium"}>{label}</p>
            <p className={size === "small" ? "text-xs text-slate-500" : "text-xs text-slate-500"}>{t("drag.drop")}</p>
          </div>
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden">
          <div className={`${aspectRatio} relative`}>
            <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
              <p className={size === "small" ? "text-sm font-medium text-slate-700" : "font-medium text-slate-700"}>
                {imageType === "frontal" ? "Frontal Image" : "Diagnostic Image"}
              </p>
              <p
                className={size === "small" ? "text-xs text-slate-500 mt-1" : "text-sm text-slate-500 text-center mt-2"}
              >
                {imageType === "frontal"
                  ? "Client frontal view for hairline simulation"
                  : `${label} for comprehensive analysis`}
              </p>
            </div>
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              size="icon"
              variant="destructive"
              className={size === "small" ? "h-6 w-6 rounded-full" : "h-8 w-8 rounded-full"}
              onClick={handleRemove}
            >
              <X className={size === "small" ? "h-3 w-3" : "h-4 w-4"} />
            </Button>
            {isUploaded && (
              <div
                className={
                  size === "small"
                    ? "h-6 w-6 rounded-full bg-green-500 flex items-center justify-center"
                    : "h-8 w-8 rounded-full bg-green-500 flex items-center justify-center"
                }
              >
                <Check className={size === "small" ? "h-3 w-3 text-white" : "h-4 w-4 text-white"} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
