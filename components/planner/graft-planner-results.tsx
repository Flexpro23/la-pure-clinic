"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Download, Printer, Share2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface GraftPlannerResultsProps {
  caseId: string
}

export default function GraftPlannerResults({ caseId }: GraftPlannerResultsProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("heatmap")
  const [graftDistribution, setGraftDistribution] = useState({
    frontal: 1200,
    midScalp: 1000,
    crown: 600,
  })
  const totalGrafts = Object.values(graftDistribution).reduce((a, b) => a + b, 0)

  // Simulate loading of AI analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDistributionChange = (area: keyof typeof graftDistribution, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setGraftDistribution((prev) => ({
      ...prev,
      [area]: numValue,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md">
        <Loader2 className="h-12 w-12 animate-spin text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("generating.graft.plan")}</h3>
        <p className="text-slate-600 text-center max-w-md">{t("graft.plan.description")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="heatmap">{t("heatmap.visualization")}</TabsTrigger>
          <TabsTrigger value="distribution">{t("graft.distribution")}</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("graft.distribution.heatmap")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                    <div className="text-lg font-medium text-slate-700">Graft Distribution Heatmap</div>
                    <p className="text-sm text-slate-500 text-center mt-2">
                      Visual representation of graft density across scalp regions
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/40 via-yellow-500/30 to-green-500/20 pointer-events-none" />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                      {t("high.density")}
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                      {t("medium.density")}
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                      {t("low.density")}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">{t("graft.distribution.summary")}</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("frontal.area")}</span>
                        <span className="font-medium">
                          {graftDistribution.frontal} {t("grafts")}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-red-500 h-2.5 rounded-full"
                          style={{ width: `${(graftDistribution.frontal / totalGrafts) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("mid.scalp")}</span>
                        <span className="font-medium">
                          {graftDistribution.midScalp} {t("grafts")}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{ width: `${(graftDistribution.midScalp / totalGrafts) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{t("crown")}</span>
                        <span className="font-medium">
                          {graftDistribution.crown} {t("grafts")}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: `${(graftDistribution.crown / totalGrafts) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium mb-2">{t("recommendation.notes")}</h4>
                    <p className="text-slate-700 text-sm">{t("graft.recommendation.description")}</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">{t("total.grafts")}</h4>
                    <div className="text-3xl font-bold">{totalGrafts.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("customize.graft.distribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t("adjust.distribution")}</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="frontal">{t("frontal.area")}</Label>
                      <Input
                        id="frontal"
                        type="number"
                        value={graftDistribution.frontal}
                        onChange={(e) => handleDistributionChange("frontal", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="midScalp">{t("mid.scalp")}</Label>
                      <Input
                        id="midScalp"
                        type="number"
                        value={graftDistribution.midScalp}
                        onChange={(e) => handleDistributionChange("midScalp", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crown">{t("crown")}</Label>
                      <Input
                        id="crown"
                        type="number"
                        value={graftDistribution.crown}
                        onChange={(e) => handleDistributionChange("crown", e.target.value)}
                      />
                    </div>

                    <div className="pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{t("total.grafts")}</span>
                        <span className="font-bold">{totalGrafts.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700">
                        <p>{t("recommended.maximum")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">{t("distribution.chart")}</h3>
                  <div className="aspect-square relative bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="w-full h-full p-8">
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold">{totalGrafts}</div>
                            <div className="text-slate-600">{t("total.grafts")}</div>
                          </div>
                        </div>
                        <div
                          className="absolute bg-red-500 rounded-t-full"
                          style={{
                            width: "100%",
                            height: `${(graftDistribution.frontal / totalGrafts) * 100}%`,
                            bottom: 0,
                            opacity: 0.7,
                          }}
                        ></div>
                        <div
                          className="absolute bg-yellow-500 rounded-t-full"
                          style={{
                            width: "100%",
                            height: `${(graftDistribution.midScalp / totalGrafts) * 100}%`,
                            bottom: 0,
                            left: 0,
                            opacity: 0.5,
                          }}
                        ></div>
                        <div
                          className="absolute bg-green-500 rounded-t-full"
                          style={{
                            width: "100%",
                            height: `${(graftDistribution.crown / totalGrafts) * 100}%`,
                            bottom: 0,
                            right: 0,
                            opacity: 0.5,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">{t("export.options")}</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="flex items-center">
                        <Download className="mr-2 h-4 w-4" /> {t("pdf.report")}
                      </Button>
                      <Button variant="outline" className="flex items-center">
                        <Printer className="mr-2 h-4 w-4" /> {t("print")}
                      </Button>
                      <Button variant="outline" className="flex items-center">
                        <Share2 className="mr-2 h-4 w-4" /> {t("share")}
                      </Button>
                    </div>
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
