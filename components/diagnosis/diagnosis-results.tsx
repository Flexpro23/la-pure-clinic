"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface DiagnosisResultsProps {
  caseId: string
}

export default function DiagnosisResults({ caseId }: DiagnosisResultsProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Simulate loading of AI analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md">
        <Loader2 className="h-12 w-12 animate-spin text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("ai.analysis.progress")}</h3>
        <p className="text-slate-600 text-center max-w-md">{t("ai.analysis.description")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="donor-analysis">{t("donor.analysis")}</TabsTrigger>
          <TabsTrigger value="scalp-health">{t("scalp.health")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <HealthScoreCard score={78} />
            <DonorStrengthCard strength="Moderate" />
            <GraftEstimateCard estimate={2800} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("diagnosis.summary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>{t("diagnosis.summary.p1")}</p>
                <p>{t("diagnosis.summary.p2")}</p>
                <p>{t("diagnosis.summary.p3")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donor-analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("donor.area.analysis")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t("donor.zone.visualization")}</h3>
                  <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                    <div className="text-lg font-medium text-slate-700">Donor Zone Map</div>
                    <p className="text-sm text-slate-500 text-center mt-2">Visualization of donor area density</p>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-yellow-500/30 to-red-500/30 pointer-events-none" />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                      {t("high.density")}
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                      {t("medium.density")}
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                      {t("low.density")}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">{t("follicle.density.analysis")}</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("occipital.region")}</span>
                        <span className="font-medium">85 {t("follicles.cm")}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("temporal.region")}</span>
                        <span className="font-medium">72 {t("follicles.cm")}</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("parietal.region")}</span>
                        <span className="font-medium">68 {t("follicles.cm")}</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">{t("follicle.type.distribution")}</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-slate-100 rounded-lg">
                        <div className="text-2xl font-bold">15%</div>
                        <div className="text-sm text-slate-600">{t("single.hair")}</div>
                      </div>
                      <div className="p-3 bg-slate-100 rounded-lg">
                        <div className="text-2xl font-bold">60%</div>
                        <div className="text-sm text-slate-600">{t("double.hair")}</div>
                      </div>
                      <div className="p-3 bg-slate-100 rounded-lg">
                        <div className="text-2xl font-bold">25%</div>
                        <div className="text-sm text-slate-600">{t("triple.hair")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scalp-health" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("scalp.health.assessment")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t("scalp.condition")}</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("inflammation")}</span>
                        <span className="font-medium">{t("low")}</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("scarring")}</span>
                        <span className="font-medium">{t("minimal")}</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("sebum.production")}</span>
                        <span className="font-medium">{t("normal")}</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("scalp.elasticity")}</span>
                        <span className="font-medium">{t("good")}</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">{t("microscopic.analysis")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                      <div className="text-lg font-medium text-slate-700">Frontal Microscopic View</div>
                      <p className="text-sm text-slate-500 text-center mt-2">Close-up of frontal scalp area</p>
                      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                        {t("frontal")}
                      </div>
                    </div>
                    <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                      <div className="text-lg font-medium text-slate-700">Crown Microscopic View</div>
                      <p className="text-sm text-slate-500 text-center mt-2">Close-up of crown scalp area</p>
                      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                        {t("crown")}
                      </div>
                    </div>
                    <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                      <div className="text-lg font-medium text-slate-700">Donor Microscopic View</div>
                      <p className="text-sm text-slate-500 text-center mt-2">Close-up of donor scalp area</p>
                      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                        {t("donor")}
                      </div>
                    </div>
                    <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                      <div className="text-lg font-medium text-slate-700">Temporal Microscopic View</div>
                      <p className="text-sm text-slate-500 text-center mt-2">Close-up of temporal scalp area</p>
                      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                        {t("temporal")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">{t("recommendations")}</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      <li>{t("recommendation.1")}</li>
                      <li>{t("recommendation.2")}</li>
                      <li>{t("recommendation.3")}</li>
                      <li>{t("recommendation.4")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function HealthScoreCard({ score }: { score: number }) {
  const { t } = useLanguage()
  let color = "text-red-500"
  let status = t("poor")

  if (score >= 80) {
    color = "text-green-500"
    status = t("excellent")
  } else if (score >= 60) {
    color = "text-yellow-500"
    status = t("good")
  } else if (score >= 40) {
    color = "text-orange-500"
    status = t("fair")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">{t("health.score")}</h3>
          <div className={`text-4xl font-bold ${color}`}>{score}%</div>
          <p className="text-slate-600 mt-1">{status}</p>
          <Progress value={score} className="mt-4 h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

function DonorStrengthCard({ strength }: { strength: string }) {
  const { t } = useLanguage()
  let color = "text-red-500"

  if (strength === "Excellent") {
    color = "text-green-500"
  } else if (strength === "Good") {
    color = "text-emerald-500"
  } else if (strength === "Moderate") {
    color = "text-yellow-500"
  } else if (strength === "Fair") {
    color = "text-orange-500"
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">{t("donor.strength")}</h3>
          <div className={`text-2xl font-bold ${color}`}>{strength}</div>
          <p className="text-slate-600 mt-1">{t("suitable.transplant")}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function GraftEstimateCard({ estimate }: { estimate: number }) {
  const { t } = useLanguage()
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">{t("estimated.grafts")}</h3>
          <div className="text-3xl font-bold">{estimate.toLocaleString()}</div>
          <p className="text-slate-600 mt-1">{t("available.extraction")}</p>
        </div>
      </CardContent>
    </Card>
  )
}
