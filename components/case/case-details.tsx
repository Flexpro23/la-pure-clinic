"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Share2, FileText, Activity, Grid } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

interface CaseDetailsProps {
  caseId: string
}

// Mock data for a case
const mockCase = {
  id: "case-001",
  clientName: "James Wilson",
  date: "2023-05-15",
  status: "completed",
  hairlineType: "Arch",
  healthScore: 78,
  age: 42,
  notes:
    "Client has been experiencing gradual hair loss over the past 5 years. No family history of baldness on maternal side.",
  graftDistribution: {
    frontal: 1200,
    midScalp: 1000,
    crown: 600,
  },
}

export default function CaseDetails({ caseId }: CaseDetailsProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">{mockCase.clientName}</CardTitle>
              <p className="text-slate-600 mt-1">
                {t("case.id")}: {caseId} • {t("created.on")} {new Date(mockCase.date).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge className="ml-0 md:ml-2 mb-2 md:mb-0">
                {mockCase.status === "completed"
                  ? t("completed")
                  : mockCase.status === "in-progress"
                    ? t("in.progress")
                    : t("pending")}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("actions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full justify-start">
                <Link href={`/dashboard/${caseId}/report`}>
                  <FileText className="mr-2 h-4 w-4" /> {t("view.report")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start">
                <Link href={`/dashboard/${caseId}/diagnosis`}>
                  <Activity className="mr-2 h-4 w-4" /> {t("view.diagnosis")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start">
                <Link href={`/dashboard/${caseId}/graft-planner`}>
                  <Grid className="mr-2 h-4 w-4" /> {t("view.graft.plan")}
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" /> {t("export.report")}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="mr-2 h-4 w-4" /> {t("print.case")}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" /> {t("share.with.client")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
              <TabsTrigger value="images">{t("images")}</TabsTrigger>
              <TabsTrigger value="results">{t("results")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("client.information")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-slate-500">{t("client.name")}</dt>
                          <dd className="mt-1 text-lg">{mockCase.clientName}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500">{t("age")}</dt>
                          <dd className="mt-1 text-lg">{mockCase.age}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500">{t("hairline.type")}</dt>
                          <dd className="mt-1 text-lg">{mockCase.hairlineType}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500">{t("health.score")}</dt>
                          <dd className="mt-1 text-lg">{mockCase.healthScore}%</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-500">{t("notes")}</dt>
                      <dd className="mt-1 text-lg">{mockCase.notes}</dd>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{t("graft.distribution.summary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                      <div className="text-2xl font-bold">{mockCase.graftDistribution.frontal}</div>
                      <div className="text-slate-600">{t("frontal.area")}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                      <div className="text-2xl font-bold">{mockCase.graftDistribution.midScalp}</div>
                      <div className="text-slate-600">{t("mid.scalp")}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                      <div className="text-2xl font-bold">{mockCase.graftDistribution.crown}</div>
                      <div className="text-slate-600">{t("crown")}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-500">{t("total.grafts")}</div>
                      <div className="text-2xl font-bold">
                        {Object.values(mockCase.graftDistribution).reduce((a, b) => a + b, 0)}
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/dashboard/${caseId}/graft-planner`}>{t("view.full.plan")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("client.images")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">{t("frontal.image.simulation")}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                          <div className="text-lg font-medium text-slate-700">Original Frontal Image</div>
                          <p className="text-sm text-slate-500 text-center mt-2">Patient's current appearance</p>
                          <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                            {t("original")}
                          </div>
                        </div>
                        <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                          <div className="text-lg font-medium text-slate-700">Simulated Frontal Image</div>
                          <p className="text-sm text-slate-500 text-center mt-2">Predicted post-procedure appearance</p>
                          <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                            {t("simulated")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">{t("diagnostic.images")}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                          <div className="text-lg font-medium text-slate-700">Front View</div>
                          <p className="text-sm text-slate-500 text-center mt-2">Diagnostic frontal image</p>
                          <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                            {t("front")}
                          </div>
                        </div>
                        <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                          <div className="text-lg font-medium text-slate-700">Left View</div>
                          <p className="text-sm text-slate-500 text-center mt-2">Diagnostic left side image</p>
                          <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                            {t("left")}
                          </div>
                        </div>
                        <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                          <div className="text-lg font-medium text-slate-700">Right View</div>
                          <p className="text-sm text-slate-500 text-center mt-2">Diagnostic right side image</p>
                          <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                            {t("right")}
                          </div>
                        </div>
                        <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                          <div className="text-lg font-medium text-slate-700">Back View</div>
                          <p className="text-sm text-slate-500 text-center mt-2">Diagnostic back view image</p>
                          <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
                            {t("back")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analysis.results")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">{t("health.assessment")}</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>{t("overall.health.score")}</span>
                            <span className="font-medium">{mockCase.healthScore}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div
                              className="bg-yellow-500 h-2.5 rounded-full"
                              style={{ width: `${mockCase.healthScore}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>{t("donor.strength")}</span>
                            <span className="font-medium">{t("moderate")}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>{t("scalp.elasticity")}</span>
                            <span className="font-medium">{t("good")}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "80%" }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-medium mb-2">{t("diagnosis.summary")}</h4>
                        <p className="text-slate-700">{t("diagnosis.summary.short")}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">{t("graft.plan")}</h3>
                      <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                        <div className="text-lg font-medium text-slate-700">Graft Distribution Heatmap</div>
                        <p className="text-sm text-slate-500 text-center mt-2">
                          Visual representation of graft density across scalp regions
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-b from-red-500/40 via-yellow-500/30 to-green-500/20 pointer-events-none" />
                      </div>

                      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{t("total.grafts")}</span>
                          <span className="font-bold">
                            {Object.values(mockCase.graftDistribution).reduce((a, b) => a + b, 0)}
                          </span>
                        </div>
                        <Button asChild className="w-full mt-2">
                          <Link href={`/dashboard/${caseId}/graft-planner`}>{t("view.detailed.plan")}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
