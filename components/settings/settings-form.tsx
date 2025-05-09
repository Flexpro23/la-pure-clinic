"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Save } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function SettingsForm() {
  const { language, setLanguage, t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    fullName: "Dr. John Doe",
    email: "john.doe@lapure.clinic",
    phone: "+1 (555) 123-4567",
  })
  const [clinicData, setClinicData] = useState({
    clinicName: "LaPure Medical Clinic",
    address: "123 Medical Center Blvd, Suite 500",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newCaseAlerts: true,
    weeklyReports: false,
    marketingEmails: false,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setClinicData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleLanguageChange = (value: "en" | "ar") => {
    setLanguage(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Show success message or notification
    }, 1000)
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
        <TabsTrigger value="clinic">{t("clinic")}</TabsTrigger>
        <TabsTrigger value="notifications">{t("notifications")}</TabsTrigger>
        <TabsTrigger value="language">{t("language")}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("full.name")}</Label>
                <Input id="fullName" name="fullName" value={profileData.fullName} onChange={handleProfileChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" name="email" type="email" value={profileData.email} onChange={handleProfileChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input id="phone" name="phone" value={profileData.phone} onChange={handleProfileChange} />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t("save.changes")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="clinic" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">{t("clinic.name")}</Label>
                <Input id="clinicName" name="clinicName" value={clinicData.clinicName} onChange={handleClinicChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t("address")}</Label>
                <Input id="address" name="address" value={clinicData.address} onChange={handleClinicChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input id="city" name="city" value={clinicData.city} onChange={handleClinicChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">{t("state")}</Label>
                  <Input id="state" name="state" value={clinicData.state} onChange={handleClinicChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">{t("zip.code")}</Label>
                <Input id="zipCode" name="zipCode" value={clinicData.zipCode} onChange={handleClinicChange} />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t("save.changes")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">{t("email.notifications")}</Label>
                    <p className="text-sm text-slate-500">{t("email.notifications.description")}</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newCaseAlerts">{t("new.case.alerts")}</Label>
                    <p className="text-sm text-slate-500">{t("new.case.alerts.description")}</p>
                  </div>
                  <Switch
                    id="newCaseAlerts"
                    checked={notificationSettings.newCaseAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("newCaseAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weeklyReports">{t("weekly.reports")}</Label>
                    <p className="text-sm text-slate-500">{t("weekly.reports.description")}</p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">{t("marketing.emails")}</Label>
                    <p className="text-sm text-slate-500">{t("marketing.emails.description")}</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                  />
                </div>
              </div>

              <div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t("save.changes")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="language" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("language")}</h3>
                <RadioGroup value={language} onValueChange={handleLanguageChange} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="language-en" />
                    <Label htmlFor="language-en" className="cursor-pointer">
                      {t("language.english")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ar" id="language-ar" />
                    <Label htmlFor="language-ar" className="cursor-pointer">
                      {t("language.arabic")}
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-slate-500 mt-2">
                  {language === "en"
                    ? "Changing the language will affect the entire application."
                    : "تغيير اللغة سيؤثر على التطبيق بأكمله."}
                </p>
              </div>

              <div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t("save.changes")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
