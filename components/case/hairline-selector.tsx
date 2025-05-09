"use client"
import { useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"

interface HairlineSelectorProps {
  onSelect: (hairline: string) => void
  selected: string
  compact?: boolean
}

const hairlineOptions = [
  {
    id: "arch",
    name: "Arch",
    description: "Natural rounded hairline, suitable for most face shapes",
  },
  {
    id: "v-shape",
    name: "V-Shape",
    description: "Angular hairline with a defined widow's peak",
  },
  {
    id: "oval",
    name: "Oval",
    description: "Soft, curved hairline that frames the face",
  },
  {
    id: "semi-v",
    name: "Semi-V",
    description: "Balanced between arch and V-shape, versatile option",
  },
]

export default function HairlineSelector({ onSelect, selected, compact = false }: HairlineSelectorProps) {
  const { t } = useLanguage()

  // Auto-select the first option if none is selected
  useEffect(() => {
    if (!selected && hairlineOptions.length > 0) {
      console.log("Auto-selecting first hairline option:", hairlineOptions[0].id);
      onSelect(hairlineOptions[0].id);
    }
  }, [selected, onSelect]);

  return (
    <RadioGroup value={selected} onValueChange={onSelect} className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {hairlineOptions.map((option) => (
        <div key={option.id} className="relative">
          <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
          <Label
            htmlFor={option.id}
            className="flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 peer-data-[state=checked]:border-slate-800 peer-data-[state=checked]:bg-slate-50 h-full"
          >
            <div className="w-full flex-1">
              <div className="aspect-square w-full bg-slate-100 rounded-md flex flex-col items-center justify-center p-2">
                <div className="text-base font-medium text-slate-700">{option.name}</div>
                <p className="text-xs text-slate-500 text-center mt-1">Hairline shape</p>
              </div>
            </div>
            <div className="text-center mt-2">
              <h4 className="text-sm font-medium">{option.name}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{option.description}</p>
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
