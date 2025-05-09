"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"

interface HairstylePreviewProps {
  hairlineType: string
  onSelect: (hairstyle: string) => void
  selected: string
}

// Mock data for hairstyles based on hairline type
const hairstylesByHairline: Record<string, any[]> = {
  arch: [
    {
      id: "textured-quiff",
      name: "Textured Quiff",
    },
    {
      id: "angular-fringe",
      name: "Angular Fringe",
    },
    {
      id: "slicked-back-undercut",
      name: "Slicked Back Undercut",
    },
  ],
  "v-shape": [
    {
      id: "textured-quiff",
      name: "Textured Quiff",
    },
    {
      id: "angular-fringe",
      name: "Angular Fringe",
    },
    {
      id: "slicked-back-undercut",
      name: "Slicked Back Undercut",
    },
  ],
  oval: [
    {
      id: "textured-quiff",
      name: "Textured Quiff",
    },
    {
      id: "angular-fringe",
      name: "Angular Fringe",
    },
    {
      id: "slicked-back-undercut",
      name: "Slicked Back Undercut",
    },
  ],
  "semi-v": [
    {
      id: "textured-quiff",
      name: "Textured Quiff",
    },
    {
      id: "angular-fringe",
      name: "Angular Fringe",
    },
    {
      id: "slicked-back-undercut",
      name: "Slicked Back Undercut",
    },
  ],
}

export default function HairstylePreview({ hairlineType, onSelect, selected }: HairstylePreviewProps) {
  const { t } = useLanguage()
  const [hairstyles, setHairstyles] = useState<any[]>([])

  useEffect(() => {
    if (hairlineType && hairstylesByHairline[hairlineType]) {
      const styles = hairstylesByHairline[hairlineType];
      setHairstyles(styles);
      
      // Auto-select the first hairstyle if no selection exists
      // or if the current selection is not valid for this hairline
      if (!selected || !styles.find((style) => style.id === selected)) {
        console.log("Auto-selecting first hairstyle for hairline:", hairlineType);
        onSelect(styles[0].id);
      }
    } else {
      setHairstyles([]);
    }
  }, [hairlineType, onSelect, selected]);

  // Ensure we have a valid selection whenever the component renders
  useEffect(() => {
    if (hairstyles.length > 0 && (!selected || !hairstyles.find(style => style.id === selected))) {
      console.log("Ensuring a default hairstyle is selected");
      onSelect(hairstyles[0].id);
    }
  }, [hairstyles, selected, onSelect]);

  if (!hairlineType) {
    return (
      <div className="text-center p-8 border rounded-lg bg-slate-50">
        <p className="text-slate-600">{t("select.hairline.first")}</p>
      </div>
    )
  }

  if (hairstyles.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-slate-50">
        <p className="text-slate-600">{t("no.hairstyles")}</p>
      </div>
    )
  }

  return (
    <div>
      <RadioGroup value={selected} onValueChange={onSelect} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {hairstyles.map((style) => (
          <div key={style.id} className="relative">
            <RadioGroupItem value={style.id} id={style.id} className="peer sr-only" />
            <Label
              htmlFor={style.id}
              className="flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 peer-data-[state=checked]:border-slate-800 peer-data-[state=checked]:bg-slate-50 h-full"
            >
              <div className="w-full flex-1">
                <div className="aspect-square w-full bg-slate-100 rounded-md flex flex-col items-center justify-center p-2">
                  <div className="text-base font-medium text-slate-700">{style.name}</div>
                  <p className="text-xs text-slate-500 text-center mt-1">Hairstyle</p>
                </div>
              </div>
              <div className="text-center mt-2">
                <h4 className="text-sm font-medium">{style.name}</h4>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selected && (
        <div className="mt-6 p-4 border rounded-lg bg-slate-50">
          <h4 className="font-medium mb-2">{t("simulation.preview")}</h4>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/2 aspect-video bg-slate-100 rounded-md flex flex-col items-center justify-center p-4">
              <div className="text-lg font-medium text-slate-700">Original Image</div>
              <p className="text-sm text-slate-500 text-center mt-2">Patient's current appearance</p>
              <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">Original</div>
            </div>
            <div className="relative w-full md:w-1/2 aspect-video bg-slate-100 rounded-md flex flex-col items-center justify-center p-4">
              <div className="text-lg font-medium text-slate-700">Simulated Result</div>
              <p className="text-sm text-slate-500 text-center mt-2">Predicted post-procedure appearance</p>
              <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">Simulated</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
