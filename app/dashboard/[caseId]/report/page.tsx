"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ArrowLeft, Printer, Share2, Sparkles, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useFirebase } from "@/contexts/firebase-context"
import { useLanguage } from "@/contexts/language-context"
import { doc, getDoc } from "firebase/firestore"
import { httpsCallable, getFunctions, connectFunctionsEmulator } from "firebase/functions"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { chargeUserForService } from "@/lib/user-utils"

// Define types for the report data
interface Severity {
  score: number
  category: string
}

interface HairLossAssessment {
  pattern: string
  severity: Severity
  hairlineRecession: string
  crownThinning: string
  overallDensity: string
  distinctiveCharacteristics: string
}

interface Characteristics {
  hairColor: string
  hairTexture: string
  hairThickness: string
  hairDensity: string
  faceShape: string
  scalpCondition: string
  growthPattern: string
}

interface Recommendations {
  approach: string
  graftCount: number
  specialConsiderations: string
  expectedResults: string
}

interface ReportData {
  clientInformation?: {
    name: string;
    age: string | number;
    gender: string;
    phoneNumber: string;
    emailAddress: string;
  };
  hairLossAssessment: HairLossAssessment
  characteristics: Characteristics
  recommendations: Recommendations
  summary: string
}

interface ClientData {
  name: string
  age: number | null
  gender: string | null
  phoneNumber: string | null
  emailAddress: string | null
  frontImageUrl: string
  hairlineTitle: string
  hairstyleTitle: string
  generatedLookUrl?: string
}

// Helper function to parse rawText to JSON with improved error handling
const parseRawTextToJSON = (rawText: string): ReportData | null => {
  if (!rawText) return null
  
  try {
    // Remove code fence markers if they exist
    let cleanText = rawText.trim();
    
    // Remove ```json and ``` markers if they exist
    const jsonStartRegex = /```json\s*/g;
    const jsonEndRegex = /\s*```/g;
    
    cleanText = cleanText.replace(jsonStartRegex, '');
    cleanText = cleanText.replace(jsonEndRegex, '');
    
    // Find valid JSON - look for opening { and its matching }
    const jsonMatch = cleanText.match(/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/);
    if (jsonMatch && jsonMatch[0]) {
      return JSON.parse(jsonMatch[0]) as ReportData;
    }
    
    // If the above method failed, try a more basic approach
    // Find the first { and last }
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSubstring = cleanText.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSubstring) as ReportData;
    }
    
    // If we get here, we couldn't extract valid JSON
    console.error("Could not extract valid JSON from the text");
    return null;
  } catch (error) {
    console.error("Error parsing raw text to JSON:", error);
    return null;
  }
}

export default function HairTransplantReport() {
  const [isGeneratingLook, setIsGeneratingLook] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const { db, user, userData } = useFirebase()
  const { t } = useLanguage()
  const [showGenerateConfirmation, setShowGenerateConfirmation] = useState(false)

  useEffect(() => {
    // Fetch client and report data
    const fetchReportData = async () => {
      try {
        if (!params.caseId) return;
        
        // First try to get client data from Firestore to get the image URL
        try {
          const clientDocRef = doc(db, "clients", params.caseId as string);
          const clientDocSnap = await getDoc(clientDocRef);
          
          if (clientDocSnap.exists()) {
            const clientDocData = clientDocSnap.data();
            setClientData({
              name: clientDocData.name || "Client",
              age: clientDocData.age || null,
              gender: clientDocData.gender || null,
              phoneNumber: clientDocData.phoneNumber || null,
              emailAddress: clientDocData.emailAddress || null,
              frontImageUrl: clientDocData.frontImageUrl || null,
              hairlineTitle: clientDocData.hairlineTitle || "Oval",
              hairstyleTitle: clientDocData.hairstyleTitle || "Textured Quiff",
              generatedLookUrl: clientDocData.generatedLookUrl || null
            });
          }
        } catch (firestoreError) {
          console.warn("Failed to fetch client data from Firestore:", firestoreError);
          // Non-critical, continue to localStorage report data
        }
        
        // Try to get report data from localStorage
        const storedReport = localStorage.getItem(`report_${params.caseId}`);
        
        if (storedReport) {
          // Parse stored report if it exists
          const parsedData = parseRawTextToJSON(storedReport);
          if (parsedData) {
            setReportData(parsedData);
            return;
          }
        }
        
        // Fallback to default data if no stored report
        setReportData({
          hairLossAssessment: {
            pattern: "Norwood 3V",
            severity: {
              score: 6,
              category: "Moderate",
            },
            hairlineRecession:
              "Significant recession at the temples, creating a receding hairline that is more pronounced at the sides. The frontal hairline shows miniaturization and thinning.",
            crownThinning: "Minimal thinning is observed at the crown area, currently not a significant concern.",
            overallDensity:
              "Hair density is reduced in the frontal and temporal regions, with noticeable thinning compared to the crown and occipital areas. Overall density is moderate to low in the affected areas.",
            distinctiveCharacteristics:
              "The pattern of hair loss appears typical of androgenetic alopecia (male pattern baldness), with a more significant recession at the temples than the center of the hairline.",
          },
          characteristics: {
            hairColor: "Dark Brown",
            hairTexture: "Straight to slightly wavy",
            hairThickness: "Medium",
            hairDensity: "Sparse in the frontal region, medium to dense in the crown and occipital regions",
            faceShape: "Oval to slightly rectangular face shape, providing a good canvas for a textured quiff hairstyle.",
            scalpCondition: "Scalp appears healthy with no visible signs of inflammation, scarring, or disease.",
            growthPattern:
              "Hair growth pattern appears consistent with typical male growth distribution. The areas of thinning are consistent with androgenetic alopecia.",
          },
          recommendations: {
            approach:
              "A follicular unit transplantation (FUT) or Follicular Unit Extraction (FUE) procedure is recommended to restore the hairline and improve density in the frontal and temporal regions. The chosen technique will depend on Mohamad's preferences and our assessment during a physical consultation. The chosen hairline will be an oval, soft, curved shape, to create a natural framing of his face. A textured quiff style will be suitable to maximize the impact of the transplant.",
            graftCount: 2500,
            specialConsiderations:
              "Mohamad's desired hairstyle and face shape will be taken into account during the surgical planning to ensure a natural-looking result. Pre-operative blood tests and a scalp evaluation are necessary.",
            expectedResults:
              "With a successful hair transplant, Mohamad can expect a significant improvement in the density and appearance of his hairline, creating a fuller and more youthful look. The textured quiff should complement the restored hairline well. Full results will be visible after about 9-12 months, with continued gradual thickening over the following year.",
          },
          summary:
            "Mohamad presents with moderate androgenetic alopecia, primarily affecting his hairline. A hair transplant procedure, involving approximately 2500 grafts, is recommended to restore his hairline to his desired oval, soft, curved shape and achieve his textured quiff hairstyle. The procedure will focus on improving density in the frontal and temporal regions for a natural and youthful appearance.",
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };
    
    fetchReportData();
  }, [params.caseId, db]);

  const handleGenerateNewLook = async () => {
    try {
      setIsGeneratingLook(true);
      
      if (!params.caseId) {
        toast.error("Missing client ID");
        return;
      }
      
      // Use the HTTP endpoint directly with Fetch API instead of Firebase callable
      const url = 'https://us-central1-la-pure-a34c0.cloudfunctions.net/generateNewLookHttp';
      
      console.log("Calling cloud function with clientId:", params.caseId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ clientId: params.caseId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate new look');
      }
      
      const data = await response.json();
      
      console.log("Cloud function response:", data);
      
      // Process the result
      if (data.success && data.imageUrl) {
        // Update the UI with the new image
        setGeneratedImageUrl(data.imageUrl);
        toast.success("New look generated successfully!");
        
        // Charge the user for the service
        if (user) {
          try {
            // Charge the user $0.39 for the image generation
            await chargeUserForService(user.uid, 0.39, 'image_generation');
            console.log("User charged successfully for image generation");
          } catch (chargeError) {
            console.error("Failed to charge user for image generation:", chargeError);
            // Non-critical error, so we continue
          }
        }
        
        // Refresh client data to get the latest image URL
        if (params.caseId) {
          const clientDocRef = doc(db, "clients", params.caseId as string);
          const clientDocSnap = await getDoc(clientDocRef);
          
          if (clientDocSnap.exists()) {
            const clientDocData = clientDocSnap.data();
            setClientData(prevData => ({
              ...prevData!,
              generatedLookUrl: clientDocData.generatedLookUrl || null
            }));
          }
        }
      } else {
        toast.error(data.message || "Failed to generate new look");
      }
    } catch (error: any) {
      console.error("Error generating new look:", error);
      toast.error("Error generating new look: " + (error.message || "Unknown error"));
    } finally {
      setIsGeneratingLook(false);
    }
  };

  // Handler for showing the confirmation dialog
  const handleShowGenerateConfirmation = () => {
    setShowGenerateConfirmation(true);
  };

  // Handler for confirmation dialog
  const handleConfirmGenerate = () => {
    setShowGenerateConfirmation(false);
    handleGenerateNewLook();
  };

  const handlePrint = () => {
    window.print();
  };

  // If report data is not loaded yet, show loading state
  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-slate-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  const clientImageUrl = clientData?.frontImageUrl || "/placeholder.svg";
  const clientName = clientData?.name || "Client";
  const clientAge = clientData?.age || "";
  const clientGender = clientData?.gender || "";
  const clientPhoneNumber = clientData?.phoneNumber || "";
  const clientEmailAddress = clientData?.emailAddress || "";
  const hairlineTitle = clientData?.hairlineTitle || "Oval";
  const hairstyleTitle = clientData?.hairstyleTitle || "Textured Quiff";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirmation Dialog for Generate New Look */}
      <ConfirmationDialog
        isOpen={showGenerateConfirmation}
        onClose={() => setShowGenerateConfirmation(false)}
        onConfirm={handleConfirmGenerate}
        title="Generate AI Hair Simulation Image"
        description="You are about to generate an AI-powered visualization of the recommended hairstyle for this client."
        costRange="$0.35-$0.50"
        exactCost={0.39}
      />

      <div className="max-w-4xl mx-auto bg-white shadow-sm" ref={reportRef}>
        {/* Header with navigation and actions */}
        <div className="p-4 border-b flex justify-between items-center">
          <Link href="/dashboard/simulation-history" className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          
          {/* Balance Display */}
          <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <Wallet className="h-4 w-4 mr-1" />
            <span className="font-medium">${userData?.balance?.toFixed(2) || "0.00"}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center py-6 relative">
          <h1 className="text-2xl font-bold text-gray-900">Hair Transplant Consultation Report</h1>
          <p className="text-sm text-gray-500 mt-1">Report generated on {new Date().toLocaleDateString()}</p>
          <Button
            variant="default"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            onClick={handleShowGenerateConfirmation}
            disabled={isGeneratingLook}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isGeneratingLook ? "Generating..." : "Generate New Look"}
          </Button>
        </div>

        {/* Client Information */}
        <div className="border rounded-lg mx-4 mb-4">
          <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
            <h2 className="font-semibold text-gray-900">Client Information</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Client Name</p>
              <p className="text-gray-900">{clientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Age</p>
              <p className="text-gray-900">{clientAge}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-gray-900">{clientGender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="text-gray-900">{clientPhoneNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="text-gray-900">{clientEmailAddress}</p>
            </div>
          </div>
        </div>

        {/* Client Photo and Recommended Style */}
        <div className="grid grid-cols-2 gap-4 mx-4 mb-6">
          <div className="border rounded-lg">
            <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
              <h2 className="font-semibold text-gray-900">{t("client.photo")}</h2>
            </div>
            <div className="p-4 relative aspect-square overflow-hidden bg-gray-100 rounded-b-lg">
              <Image
                src={clientImageUrl}
                alt="Client Photo"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-b-lg"
              />
            </div>
          </div>
          
          <div className="border rounded-lg">
            <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
              <h2 className="font-semibold text-gray-900">Recommended Style</h2>
            </div>
            <div className="p-4 relative aspect-square overflow-hidden bg-gray-100 rounded-b-lg">
              {generatedImageUrl || clientData?.generatedLookUrl ? (
                <Image
                  src={generatedImageUrl || clientData?.generatedLookUrl || "/placeholder.svg"}
                  alt="Generated Style"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-b-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500">Click "Generate New Look" to visualize the recommended style</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis & Recommendations */}
        <div className="border rounded-lg mx-4 mb-4">
          <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
            <h2 className="font-semibold text-gray-900">Analysis & Recommendations</h2>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[500px]">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Hair Loss Assessment</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-500">Pattern</p>
                  <p className="text-sm text-gray-900">{reportData.hairLossAssessment.pattern}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Severity</p>
                  <p className="text-sm text-gray-900">
                    {reportData.hairLossAssessment.severity.category} ({reportData.hairLossAssessment.severity.score}
                    /10)
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500">Hairline Recession</p>
                <p className="text-sm text-gray-900">{reportData.hairLossAssessment.hairlineRecession}</p>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500">Crown Thinning</p>
                <p className="text-sm text-gray-900">{reportData.hairLossAssessment.crownThinning}</p>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500">Overall Density</p>
                <p className="text-sm text-gray-900">{reportData.hairLossAssessment.overallDensity}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Distinctive Characteristics</p>
                <p className="text-sm text-gray-900">{reportData.hairLossAssessment.distinctiveCharacteristics}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hair Characteristics */}
        <div className="border rounded-lg mx-4 mb-4">
          <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
            <h2 className="font-semibold text-gray-900">Hair Characteristics</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Hair Color</p>
              <p className="text-gray-900">{reportData.characteristics.hairColor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hair Texture</p>
              <p className="text-gray-900">{reportData.characteristics.hairTexture}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hair Thickness</p>
              <p className="text-gray-900">{reportData.characteristics.hairThickness}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hair Density</p>
              <p className="text-gray-900">{reportData.characteristics.hairDensity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Face Shape</p>
              <p className="text-gray-900">{reportData.characteristics.faceShape}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Scalp Condition</p>
              <p className="text-gray-900">{reportData.characteristics.scalpCondition}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Growth Pattern</p>
              <p className="text-gray-900">{reportData.characteristics.growthPattern}</p>
            </div>
          </div>
        </div>

        {/* Treatment Recommendations */}
        <div className="border rounded-lg mx-4 mb-4">
          <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
            <h2 className="font-semibold text-gray-900">Treatment Recommendations</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Recommended Approach</p>
              <p className="text-gray-900">{reportData.recommendations.approach}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estimated Graft Count</p>
              <p className="text-gray-900">{reportData.recommendations.graftCount} grafts</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Special Considerations</p>
              <p className="text-gray-900">{reportData.recommendations.specialConsiderations}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Expected Results</p>
              <p className="text-gray-900">{reportData.recommendations.expectedResults}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border rounded-lg mx-4 mb-4">
          <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
            <h2 className="font-semibold text-gray-900">Summary</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-900">{reportData.summary}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 p-4 border-t">
          <p>
            This report is generated based on AI analysis and is intended for consultation purposes only. Final
            treatment decisions should be made in consultation with a qualified hair transplant specialist.
          </p>
          <p>© 2025 Hair Clinic. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 