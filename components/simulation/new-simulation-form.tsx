"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, X, Check } from "lucide-react"
import ImageUpload from "@/components/case/image-upload"
import HairlineSelector from "@/components/case/hairline-selector"
import HairstylePreview from "@/components/case/hairstyle-preview"
import { useLanguage } from "@/contexts/language-context"
import { useFirebase } from "@/contexts/firebase-context"
import { addDoc, updateDoc, collection, doc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "sonner"
import Image from "next/image"
import { generateHairTransplantReport } from "@/lib/gemini-report"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { chargeUserForService } from "@/lib/user-utils"

// Define hairline types with titles and descriptions
const hairlineTypes = [
  {
    id: "arch",
    title: "Arch",
    description: "A softly rounded, convex hairline that gently curves across the forehead without any sharp angles or deep recessions. It mimics a youthful, natural hairline. The curve should be even and symmetrical. Often considered a classic, mature, or universally flattering hairline."
  },
  {
    id: "v-shape",
    title: "V-Shape",
    description: "A distinct M-shaped or V-shaped hairline characterized by a prominent, well-defined point (widow's peak) in the center of the forehead. The hairline recedes angularly at the temples, creating a sharp, masculine look."
  },
  {
    id: "oval",
    title: "Oval",
    description: "An oval or U-shaped hairline that forms a continuous, gentle curve from one temple, across the forehead, to the other temple. It's similar to an arch but can be slightly higher or broader, framing the face elegantly."
  },
  {
    id: "semi-v",
    title: "Semi-V",
    description: "A hybrid hairline featuring a subtle or softened widow's peak. The central point is less pronounced and more rounded than a full V-shape. The sides of the hairline maintain a gentle curve rather than sharp angular recession."
  }
]

// Define hairstyle types with titles
const hairstyleTypes = [
  {
    id: "textured-quiff",
    title: "Textured Quiff",
    description: "A modern men's hairstyle featuring shorter hair on the sides and back, with significantly more length and volume on top. The top hair is styled upwards and slightly back off the forehead to form a quiff with noticeable, piecey texture."
  },
  {
    id: "angular-fringe",
    title: "Angular Fringe",
    description: "A contemporary men's hairstyle with short sides and back, and longer hair on top styled forward to create a fringe cut at a distinct angle across the forehead. The hair has texture and layering, with one side typically longer, sweeping across."
  },
  {
    id: "slicked-back-undercut",
    title: "Slicked Back Undercut",
    description: "A high-contrast men's hairstyle where the sides and back are cut very short, creating a sharp disconnect with the much longer hair on top. The top is combed straight back from the forehead for a smooth, polished appearance."
  }
]

interface HairlineInfo {
  id: string;
  title: string;
  description: string;
}

interface HairstyleInfo {
  id: string;
  title: string;
  description: string;
}

/**
 * Convert a File object to a base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export default function NewSimulationForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const { db, storage, user } = useFirebase()
  const [activeTab, setActiveTab] = useState("client-info")
  const [isLoading, setIsLoading] = useState(false)
  const [clientInfo, setClientInfo] = useState({
    name: "",
    age: "",
    notes: "",
    gender: "",
    phoneNumber: "",
    emailAddress: "",
    imageConsent: false,
  })
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false)
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null)
  const [frontImageBase64, setFrontImageBase64] = useState<string | null>(null)
  const [selectedHairline, setSelectedHairline] = useState("")
  const [selectedHairstyle, setSelectedHairstyle] = useState("")
  const [clientDocId, setClientDocId] = useState<string | null>(null)
  const [showReportConfirmation, setShowReportConfirmation] = useState(false)
  const [showAIConfirmation, setShowAIConfirmation] = useState(false)
  const [showStandardHairlineConfirmation, setShowStandardHairlineConfirmation] = useState(false)
  const [clientInfoSaved, setClientInfoSaved] = useState(false)
  const [hairlineInfo, setHairlineInfo] = useState<HairlineInfo>({
    id: "ai-selected",
    title: "AI Selected",
    description: "Selected by AI based on facial analysis"
  })
  const [hairstyleInfo, setHairstyleInfo] = useState<HairstyleInfo>({
    id: "ai-selected",
    title: "AI Selected",
    description: "Selected by AI based on facial analysis"
  })
  const [showPredefinedLineConfirmation, setShowPredefinedLineConfirmation] = useState(false)

  // Get the full hairline and hairstyle info based on selection
  const selectedHairlineInfo = hairlineTypes.find(h => h.id === selectedHairline)
  const selectedHairstyleInfo = hairstyleTypes.find(h => h.id === selectedHairstyle)

  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setClientInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setClientInfo((prev) => ({ ...prev, [name]: checked }))
  }

  const handleFrontImageUpload = async (file: File) => {
    try {
      setFrontImage(file);
      
      // Create object URL for preview display
      const objectUrl = URL.createObjectURL(file);
      setFrontImagePreview(objectUrl);
      
      // Convert to base64 for API calls
      console.log("Converting image to base64");
      const base64 = await fileToBase64(file);
      console.log("Base64 conversion complete, length:", base64.length);
      setFrontImageBase64(base64);
      
      return true;
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process the image. Please try again.");
      return false;
    }
  }

  const handleHairlineSelect = (hairline: string) => {
    setSelectedHairline(hairline)
  }

  const handleHairstyleSelect = (hairstyle: string) => {
    setSelectedHairstyle(hairstyle)
  }

  const removeImage = () => {
    setFrontImage(null)
    setFrontImagePreview(null)
    setFrontImageBase64(null)
  }

  const saveClientInfo = async () => {
    setIsLoading(true)
    try {
      if (!user) {
        toast.error("You must be logged in to create a simulation")
        return false
      }

      // Create a new client document in Firestore
      const clientDocRef = await addDoc(collection(db, "clients"), {
        name: clientInfo.name,
        age: clientInfo.age ? parseInt(clientInfo.age) : null,
        notes: clientInfo.notes,
        gender: clientInfo.gender,
        phoneNumber: clientInfo.phoneNumber,
        emailAddress: clientInfo.emailAddress,
        imageConsent: clientInfo.imageConsent,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        status: "draft"
      })

      setClientDocId(clientDocRef.id)
      toast.success("Client information saved")
      return true
    } catch (error) {
      console.error("Error saving client info:", error)
      toast.error("Failed to save client information")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const uploadClientImage = async () => {
    setIsLoading(true)
    try {
      if (!frontImage || !clientDocId) {
        toast.error("Missing image or client information")
        return false
      }

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `clients/${clientDocId}/front-image`)
      await uploadBytes(storageRef, frontImage)
      const imageUrl = await getDownloadURL(storageRef)

      // Update client document with image URL
      const clientDocRef = doc(db, "clients", clientDocId)
      await updateDoc(clientDocRef, {
        frontImageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      })

      toast.success("Client image uploaded")
      return true
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const saveHairlineAndHairstyle = async () => {
    setIsLoading(true)
    try {
      if (!selectedHairline || !selectedHairstyle || !clientDocId) {
        toast.error("Missing hairline or hairstyle selection")
        return false
      }

      // Get the full hairline and hairstyle information
      const hairlineInfo = selectedHairlineInfo || { id: selectedHairline, title: selectedHairline, description: "" }
      const hairstyleInfo = selectedHairstyleInfo || { id: selectedHairstyle, title: selectedHairstyle, description: "" }

      // Update client document with hairline and hairstyle selections including titles and descriptions
      const clientDocRef = doc(db, "clients", clientDocId)
      await updateDoc(clientDocRef, {
        selectedHairline,
        selectedHairstyle,
        hairlineTitle: hairlineInfo.title,
        hairlineDescription: hairlineInfo.description,
        hairstyleTitle: hairstyleInfo.title,
        hairstyleDescription: hairstyleInfo.description,
        updatedAt: new Date().toISOString()
      })

      toast.success("Hairline and hairstyle saved")
      return true
    } catch (error) {
      console.error("Error saving hairline and hairstyle:", error)
      toast.error("Failed to save hairline and hairstyle")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async (specialHairlineAdjustment?: "4-6cm" | "predefined-line") => {
    console.log("Generating report for client:", clientDocId);
    setIsLoading(true);
    try {
      // Ensure we have all the required data
      if (!clientDocId || !frontImageBase64) {
        console.error("Missing required data for report generation");
        throw new Error("Missing required data for report generation");
      }

      // Get the hairline and hairstyle data
      const hairlineData = hairlineTypes.find(h => h.id === selectedHairline) || hairlineTypes[0];
      const hairstyleData = hairstyleTypes.find(h => h.id === selectedHairstyle) || hairstyleTypes[0];

      console.log("Using hairline:", hairlineData.title);
      console.log("Using hairstyle:", hairstyleData.title);

      // Create custom image prompt if special hairline adjustment is requested
      let customImagePrompt: string | undefined = undefined;
      if (specialHairlineAdjustment === "4-6cm") {
        customImagePrompt = `
Create a photorealistic hair transplant simulation for this client.

## **CRITICAL REQUIREMENTS:**
- **PRESERVE ALL FACIAL FEATURES INCLUDING BEARD** - client's beard, facial shape, and all proportions must remain identical
- **MAINTAIN EXACT SKIN TONE & LIGHTING** from the original image
- **KEEP ALL CLOTHING/ACCESSORIES** exactly as shown

## **HAIRLINE SPECIFICATIONS:**
- Create a hairline positioned at **4-6cm distance from eyebrows** (slightly lower/more youthful position)
- Follow the **${hairlineData.title}** hairline shape specifically:
  ${hairlineData.id === "arch" ? "* **ARCH HAIRLINE**: Soft, rounded convex curve across forehead without sharp angles" : 
    hairlineData.id === "v-shape" ? "* **V-SHAPE HAIRLINE**: Distinct central point (widow's peak) with angular recession at temples" : 
    hairlineData.id === "oval" ? "* **OVAL HAIRLINE**: Continuous gentle U-shaped curve from temple to temple" : 
    "* **SEMI-V HAIRLINE**: Subtle central point with soft curves rather than sharp angles"}

## **HAIR STYLING:**
- Apply the **${hairstyleData.title}** hairstyle:
  ${hairstyleData.id === "textured-quiff" ? "* **TEXTURED QUIFF**: Volume on top styled upward and slightly back, shorter sides" : 
    hairstyleData.id === "angular-fringe" ? "* **ANGULAR FRINGE**: Longer top (3-4 inches) styled forward at an angle across forehead, with medium-short sides and textured, layered appearance" : 
    "* **SLICKED-BACK UNDERCUT**: Short sides with longer top combed straight back from forehead"}
- Match hair color and texture appropriately to complement client's features
- Create realistic hair density appropriate for a transplant result

## **IMPORTANT REMINDER:**
The final image must show the **EXACT SAME PERSON** with their **EXACT SAME FACE AND BEARD**, just with the specified hairline and hairstyle.`;
        console.log("Using custom 4-6cm hairline image prompt with markdown emphasis");
      } else if (specialHairlineAdjustment === "predefined-line") {
        customImagePrompt = `
Create a photorealistic hair transplant simulation for this client.

## **CRITICAL REQUIREMENTS:**
- **PRESERVE ALL FACIAL FEATURES INCLUDING BEARD** - client's beard, facial shape, and all proportions must remain identical
- **MAINTAIN EXACT SKIN TONE & LIGHTING** from the original image
- **KEEP ALL CLOTHING/ACCESSORIES** exactly as shown
- **REMOVE THE DRAWN LINE** - the final image should NOT show the drawn line

## **HAIRLINE SPECIFICATIONS:**
- **FOLLOW THE EXACT PRE-DRAWN HAIRLINE VISIBLE IN THE IMAGE** as a guide
- The client's forehead has a manually drawn line indicating the desired hairline position
- Use this line as the precise boundary for the new hairline
- Maintain the shape, curves and exact position of this drawn line when creating the hairline
- IMPORTANT: The drawn line itself must be completely removed/invisible in the final image

## **HAIR STYLING:**
- Apply the **${hairstyleData.title}** hairstyle:
  ${hairstyleData.id === "textured-quiff" ? "* **TEXTURED QUIFF**: Volume on top styled upward and slightly back, shorter sides" : 
    hairstyleData.id === "angular-fringe" ? "* **ANGULAR FRINGE**: Longer top (3-4 inches) styled forward at an angle across forehead, with medium-short sides and textured, layered appearance" : 
    "* **SLICKED-BACK UNDERCUT**: Short sides with longer top combed straight back from forehead"}
- Match hair color and texture appropriately to complement client's features
- Create realistic hair density starting precisely at where the drawn line was
- If the drawn line is faint, look carefully to identify it - it will be a thin line across the forehead

## **IMPORTANT REMINDER:**
The final image must show the **EXACT SAME PERSON** with their **EXACT SAME FACE AND BEARD**, with the new hairline following the drawn line's position but WITHOUT showing the actual drawn line itself.`;
        console.log("Using pre-defined hairline image prompt with line removal instructions");
      }

      // Generate the report using Gemini AI with the validated data
      const reportData = await generateHairTransplantReport(
        clientInfo,
        hairlineData,
        hairstyleData,
        frontImageBase64,
        "", // Empty string for custom prompt instead of undefined/null
        customImagePrompt // Special image prompt
      );

      console.log("Report generated, checking for errors");
      
      // Check if there was an error in the report generation - IMPORTANT CHANGE
      if (reportData.error) {
        console.error("AI analysis failed:", reportData.error);
        toast.error("AI analysis failed: " + reportData.error);
        return false; // Stop here, don't save any fallback/mockup data
      }

      console.log("No errors, updating Firestore");

      // Save the raw report text to localStorage
      try {
        // Determine if the report is structured or raw text
        let reportForLocalStorage;
        
        if (reportData.isStructured) {
          // If structured, convert to JSON string
          reportForLocalStorage = JSON.stringify(reportData.report);
        } else {
          // If it's raw text (unstructured)
          reportForLocalStorage = reportData.report.rawText;
        }
        
        // Store in localStorage
        localStorage.setItem(`report_${clientDocId}`, reportForLocalStorage);
        console.log("Report saved to localStorage");
      } catch (storageError) {
        console.warn("Failed to save report to localStorage:", storageError);
        // This is non-critical, so we continue anyway
      }

      // Add a special note in the report based on which hairline adjustment is used
      if (specialHairlineAdjustment === "4-6cm" && reportData.report && reportData.report.summary) {
        // Append a note about the standard hairline adjustment
        reportData.report.summary += " This simulation shows a hairline positioned at the 4-6cm distance from the eyebrows.";
        
        // If there are recommendations, add a note there too
        if (reportData.report.recommendations && reportData.report.recommendations.specialConsiderations) {
          reportData.report.recommendations.specialConsiderations += " This simulation specifically shows a hairline positioned at the 4-6cm distance from eyebrows to demonstrate a youthful hairline placement.";
        }
      } else if (specialHairlineAdjustment === "predefined-line" && reportData.report && reportData.report.summary) {
        // Append a note about using the pre-defined hairline
        reportData.report.summary += " This simulation shows a hairline that follows the pre-drawn line marked on the client's forehead.";
        
        // If there are recommendations, add a note there too
        if (reportData.report.recommendations && reportData.report.recommendations.specialConsiderations) {
          reportData.report.recommendations.specialConsiderations += " This simulation follows the exact hairline that was manually marked on the client's forehead by the physician.";
        }
      }

      // Update the client document with the pre-defined line flag if applicable
      const clientDocRef = doc(db, "clients", clientDocId);
      await updateDoc(clientDocRef, {
        report: reportData.report,
        imagePrompt: reportData.imagePrompt,
        selectedHairline: hairlineData.id,
        selectedHairstyle: hairstyleData.id,
        hairlineTitle: hairlineData.title,
        hairlineDescription: hairlineData.description,
        hairstyleTitle: hairstyleData.title,
        hairstyleDescription: hairstyleData.description,
        gender: clientInfo.gender,
        phoneNumber: clientInfo.phoneNumber,
        emailAddress: clientInfo.emailAddress,
        status: "completed",
        updatedAt: new Date().toISOString(),
        ...(specialHairlineAdjustment === "4-6cm" ? { standardHairlineAdjustment: true } : {}),
        ...(specialHairlineAdjustment === "predefined-line" ? { predefinedLineHairline: true } : {})
      });

      // If the report generation was successful, charge the user
      if (reportData.success && user) {
        try {
          // Charge the user $0.16 for the report generation
          await chargeUserForService(user.uid, 0.16, 'report_generation');
          console.log("User charged successfully for report generation");
        } catch (chargeError) {
          console.error("Failed to charge user for report generation:", chargeError);
          // This is non-critical for the report flow, so we don't throw an error
        }
      }

      console.log("Report saved to database successfully");
      toast.success("Report generated successfully");
      return true;
    } catch (error: any) {
      console.error("Report generation failed:", error.message, error.stack);
      toast.error(`Failed to generate report: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const handleNextTab = async () => {
    if (activeTab === "client-info") {
      const success = await saveClientInfo()
      if (success) {
        setActiveTab("images")
      }
    } else if (activeTab === "images") {
      const success = await uploadClientImage()
      if (success) {
        setActiveTab("hairline")
      }
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
      return clientInfo.name.trim() !== "" && clientInfo.imageConsent === true;
    } else if (activeTab === "images") {
      return frontImage !== null;
    } else if (activeTab === "hairline") {
      // We'll automatically select defaults if needed, so we can relax this check
      return true;
    }
    return false;
  }

  const handleSubmit = async () => {
    console.log("Handle submit called");
    setIsLoading(true);
    
    try {
      console.log("Saving hairline and hairstyle selections");
      // First save the hairline and hairstyle selections
      const saveSuccess = await saveHairlineAndHairstyle();
      if (!saveSuccess) {
        console.error("Failed to save hairline and hairstyle selections");
        throw new Error("Failed to save hairline and hairstyle selections");
      }
      
      console.log("Generating report");
      // Then generate the report
      const reportSuccess = await generateReport();
      if (!reportSuccess) {
        console.error("Report generation failed");
        throw new Error("Report generation failed");
      }
      
      if (clientDocId) {
        console.log("Report generation successful, redirecting to report viewer");
        toast.success("Report completed! Redirecting to report viewer...");
        
        // Use router.push properly without setTimeout to avoid potential issues
        router.push(`/dashboard/${clientDocId}/report`);
      } else {
        throw new Error("Missing client ID for redirection");
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const debugInfo = () => {
    console.log("--- Debug Information ---");
    console.log("Client info:", clientInfo);
    console.log("Has front image:", !!frontImage);
    console.log("Has front image preview:", !!frontImagePreview);
    console.log("Has front image base64:", !!frontImageBase64);
    console.log("Base64 length:", frontImageBase64?.length || 0);
    console.log("Selected hairline:", selectedHairline);
    console.log("Selected hairstyle:", selectedHairstyle);
    console.log("Client doc ID:", clientDocId);
    console.log("------------------------");
    
    // Display a toast with key info
    toast.info(`Debug: ${!!frontImageBase64 ? "Image ready" : "No image"}, ${!!clientDocId ? "Client saved" : "No client"}`);
  }

  // Add a separate handler function for clicking the Generate Report button
  const handleGenerateReportClick = () => {
    console.log("Generate Report button clicked");
    setShowReportConfirmation(true);
  };

  // Handler for confirmation dialog
  const handleConfirmReport = () => {
    setShowReportConfirmation(false);
    toast.info("Starting report generation...");
    handleSubmit();
  };

  // Add a new function to handle AI-based selection
  const handleGenerateWithAIClick = () => {
    console.log("Generate With AI button clicked");
    setShowAIConfirmation(true);
  };

  // Change this function name and all references to 4-6cm
  const handleStandardHairlineReportClick = () => {
    console.log("4-6cm Hairline Report button clicked");
    setShowStandardHairlineConfirmation(true);
  };

  // Handler for standard hairline confirmation dialog
  const handleConfirmStandardHairlineReport = async () => {
    setShowStandardHairlineConfirmation(false);
    toast.info("Starting 4-6cm hairline report generation...");
    
    try {
      console.log("Saving hairline and hairstyle selections");
      // First save the hairline and hairstyle selections
      const saveSuccess = await saveHairlineAndHairstyle();
      if (!saveSuccess) {
        console.error("Failed to save hairline and hairstyle selections");
        throw new Error("Failed to save hairline and hairstyle selections");
      }
      
      console.log("Generating 4-6cm hairline report");
      // Then generate the report with 4-6cm hairline adjustment
      const reportSuccess = await generateReport("4-6cm");
      if (!reportSuccess) {
        console.error("4-6cm hairline report generation failed");
        throw new Error("4-6cm hairline report generation failed");
      }
      
      if (clientDocId) {
        console.log("4-6cm hairline report generation successful, redirecting to report viewer");
        toast.success("4-6cm hairline report completed! Redirecting to report viewer...");
        router.push(`/dashboard/${clientDocId}/report`);
      } else {
        throw new Error("Missing client ID for redirection");
      }
    } catch (error: any) {
      console.error("Error in handleStandardHairlineReport:", error.message);
      toast.error(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Handler for AI confirmation dialog
  const handleConfirmAI = async () => {
    try {
      if (!clientDocId || !frontImageBase64) {
        throw new Error("Missing required data");
      }

      // Save client info and upload image if not already done
      if (!clientInfoSaved) {
        await saveClientInfo();
        setClientInfoSaved(true);
      }

      // Create custom prompt for AI analysis
      const customPrompt = `
Generate a comprehensive hair transplant consultation report based on the following client information and the attached image.

Client Information:
- Name: ${clientInfo.name}
- Age: ${clientInfo.age}
- Gender: ${clientInfo.gender || 'Not specified'}
- Phone: ${clientInfo.phoneNumber || 'Not provided'}
- Email: ${clientInfo.emailAddress || 'Not provided'}
- Notes: ${clientInfo.notes || 'None'}

Please analyze the client's image and provide:
1. A detailed assessment of their current hair pattern and loss
2. Recommendations for the most suitable hairline shape based on their facial features
3. Suggestions for the most flattering hairstyle considering their age, face shape, and overall appearance
4. Specific hair characteristics (color, texture, density) that would best complement their features

The report should be comprehensive and include:
- Detailed analysis of current hair pattern and loss
- Specific recommendations for hairline shape and hairstyle
- Hair characteristics that would best suit the client
- Expected results and special considerations

Return the report in valid JSON format with the following structure:
{
  "clientInformation": {
    "name": "${clientInfo.name}",
    "age": ${typeof clientInfo.age === 'number' ? clientInfo.age : `"${clientInfo.age}"`},
    "gender": "${clientInfo.gender || 'Not specified'}",
    "phoneNumber": "${clientInfo.phoneNumber || 'Not provided'}",
    "emailAddress": "${clientInfo.emailAddress || 'Not provided'}"
  },
  "hairLossAssessment": {
    "pattern": "string - Norwood/Ludwig scale classification",
    "severity": {
      "score": number - from 1-10,
      "category": "string - Mild/Moderate/Severe"
    },
    "hairlineRecession": "string - detailed description",
    "crownThinning": "string - detailed description",
    "overallDensity": "string - detailed description",
    "distinctiveCharacteristics": "string - any notable characteristics"
  },
  "characteristics": {
    "hairColor": "string - specific shade",
    "hairTexture": "string - straight/wavy/curly/coily",
    "hairThickness": "string - fine/medium/coarse",
    "hairDensity": "string - sparse/medium/dense",
    "faceShape": "string - detailed analysis",
    "scalpCondition": "string - observations",
    "growthPattern": "string - observations"
  },
  "recommendations": {
    "approach": "string - detailed recommended approach",
    "graftCount": number - estimated grafts required,
    "specialConsiderations": "string - any special notes for this client",
    "expectedResults": "string - what the client can expect from treatment"
  },
  "summary": "string - a brief 2-3 sentence summary of the overall assessment and recommendation"
}`;

      // Create a simpler image prompt for AI generation
      const imagePrompt = `
Create a photorealistic hair transplant simulation for a ${clientInfo.age} year old ${clientInfo.gender || 'person'}.

Key Requirements:
- Preserve the client's facial features and expression
- Maintain the same camera angle and perspective
- Keep any existing eyewear or accessories
- Match the lighting and background of the original image

Hair Design:
1. Analyze the client's facial features and current hair pattern to determine the optimal hairline shape
2. Consider the client's face shape, age, and overall appearance to create the most flattering hairstyle
3. Match the hair color and texture to any existing hair, or choose a natural shade that complements their features
4. Create a realistic, high-quality hair transplant effect with natural density and growth patterns

The goal is to show how the client would look with their new hair while maintaining their natural appearance and style.`;

      // Generate report with AI analysis
      const result = await generateHairTransplantReport(
        clientInfo,
        hairlineInfo,
        hairstyleInfo,
        frontImageBase64,
        customPrompt,
        imagePrompt
      );

      if (!result.success) {
        throw new Error("Failed to generate report");
      }

      // Update client document with generated report
      if (clientDocId) {
        await updateDoc(doc(db, "clients", clientDocId), {
          report: result.report,
          imagePrompt: result.imagePrompt,
          reportGeneratedAt: serverTimestamp(),
          reportGenerated: true,
          selectedHairline: hairlineInfo,
          selectedHairstyle: hairstyleInfo
        });
      }

      // Charge user for the service
      if (user) {
        try {
          await chargeUserForService(user.uid, 0.16, 'report_generation');
        } catch (error) {
          console.error("Error charging user:", error);
          // Continue with report generation even if charging fails
        }
      }

      toast.success("Report generated successfully!");
      if (clientDocId) {
        router.push(`/dashboard/${clientDocId}/report`);
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(error.message || "Failed to generate report");
    } finally {
      setIsLoading(false);
      setShowAIConfirmation(false);
    }
  };

  // Add a new handler function for the pre-defined line button
  const handlePredefinedLineReportClick = () => {
    console.log("Pre-defined Line Report button clicked");
    setShowPredefinedLineConfirmation(true);
  };

  // Handler for pre-defined line confirmation dialog
  const handleConfirmPredefinedLineReport = async () => {
    setShowPredefinedLineConfirmation(false);
    toast.info("Starting pre-defined line report generation...");
    
    try {
      console.log("Saving hairline and hairstyle selections");
      // First save the hairline and hairstyle selections
      const saveSuccess = await saveHairlineAndHairstyle();
      if (!saveSuccess) {
        console.error("Failed to save hairline and hairstyle selections");
        throw new Error("Failed to save hairline and hairstyle selections");
      }
      
      console.log("Generating pre-defined line hairline report");
      // Generate the report with pre-defined hairline adjustment
      const reportSuccess = await generateReport("predefined-line");
      if (!reportSuccess) {
        console.error("Pre-defined line hairline report generation failed");
        throw new Error("Pre-defined line hairline report generation failed");
      }
      
      if (clientDocId) {
        console.log("Pre-defined line hairline report generation successful, redirecting to report viewer");
        toast.success("Pre-defined line hairline report completed! Redirecting to report viewer...");
        router.push(`/dashboard/${clientDocId}/report`);
      } else {
        throw new Error("Missing client ID for redirection");
      }
    } catch (error: any) {
      console.error("Error in handlePredefinedLineReport:", error.message);
      toast.error(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="client-info">{t("client.information")}</TabsTrigger>
          <TabsTrigger value="images">{t("upload.image")}</TabsTrigger>
          <TabsTrigger value="hairline">{t("hairline.selection")}</TabsTrigger>
        </TabsList>

        <TabsContent value="client-info" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("client.name")} *</Label>
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
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    name="gender"
                    value={clientInfo.gender}
                    onValueChange={(value) => 
                      setClientInfo((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">{t("age")}</Label>
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
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+1 (123) 456-7890"
                    value={clientInfo.phoneNumber}
                    onChange={handleClientInfoChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    name="emailAddress"
                    type="email"
                    placeholder="example@email.com"
                    value={clientInfo.emailAddress}
                    onChange={handleClientInfoChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("notes")}</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder={t("notes.placeholder")}
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    value={clientInfo.notes}
                    onChange={handleClientInfoChange}
                  />
                </div>

                <div className="space-y-2 border-t pt-4 mt-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="imageConsent"
                      name="imageConsent"
                      checked={clientInfo.imageConsent}
                      onChange={handleCheckboxChange}
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="imageConsent" className="font-normal">
                      <span>I consent to the use of my images for diagnostic, simulation and training of our AI model purposes.</span>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm font-medium text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsConsentModalOpen(true);
                        }}
                      >
                        See more details
                      </Button>
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleNextTab} disabled={!isTabComplete() || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}
                      </>
                    ) : (
                      <>
                        {t("next")}: {t("upload.image")}
                      </>
                    )}
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
                  <h3 className="text-lg font-medium mb-4">{t("frontal.image")}</h3>
                  <div className="max-w-md mx-auto">
                    {/* Custom Image Upload Area */}
                    <div className="relative bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center min-h-[300px] flex flex-col items-center justify-center">
                      {frontImagePreview ? (
                        <>
                          {/* Image Preview */}
                          <div className="relative w-full h-full min-h-[250px]">
                            <Image 
                              src={frontImagePreview} 
                              alt="Front image preview" 
                              className="object-contain" 
                              fill
                            />
                          </div>
                          
                          {/* Control buttons */}
                          <div className="absolute top-2 right-2 flex space-x-2">
                            <button 
                              onClick={removeImage}
                              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                              aria-label="Confirm image"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Upload Prompt */}
                          <div className="mb-4">
                            <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          </div>
                          <h4 className="text-lg font-medium">{t("frontal.image")}</h4>
                          <p className="text-sm text-slate-500 mb-4">{t("client.frontal.view")}</p>
                          <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            {t("select.image")}
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const spinner = toast.loading("Processing image...");
                                try {
                                  await handleFrontImageUpload(file);
                                  toast.success("Image processed successfully", { id: spinner });
                                } catch (error) {
                                  toast.error("Failed to process image", { id: spinner });
                                }
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handlePrevTab}>
                    {t("back")}
                  </Button>
                  <Button onClick={handleNextTab} disabled={!isTabComplete() || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("uploading")}
                      </>
                    ) : (
                      <>
                        {t("next")}: {t("hairline.selection")}
                      </>
                    )}
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
                  <h3 className="text-lg font-medium mb-4">{t("select.hairline")}</h3>
                  <HairlineSelector onSelect={handleHairlineSelect} selected={selectedHairline} />
                  {selectedHairlineInfo && (
                    <div className="mt-2 text-center">
                      <h4 className="font-medium">{selectedHairlineInfo.title}</h4>
                      <p className="text-sm text-slate-600">{selectedHairlineInfo.description}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">{t("recommended.hairstyles")}</h3>
                  <HairstylePreview
                    hairlineType={selectedHairline}
                    onSelect={handleHairstyleSelect}
                    selected={selectedHairstyle}
                  />
                  {selectedHairstyleInfo && (
                    <div className="mt-2 text-center">
                      <h4 className="font-medium">{selectedHairstyleInfo.title}</h4>
                      <p className="text-sm text-slate-600">{selectedHairstyleInfo.description}</p>
                    </div>
                  )}
                </div>
                
                {/* Simulation Preview Section */}
                {frontImagePreview && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4 text-blue-600">Simulation Preview</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="max-w-md mx-auto">
                        <div className="text-center mb-2">
                          <h4 className="text-base font-medium">Original Image</h4>
                          <p className="text-sm text-slate-500">Patient's current appearance</p>
                        </div>
                        <div className="relative aspect-square w-full overflow-hidden rounded-md">
                          <Image 
                            src={frontImagePreview} 
                            alt="Original client image" 
                            className="object-cover"
                            fill
                          />
                        </div>
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                          >
                            Original
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <div>
                    <Button variant="outline" onClick={handlePrevTab}>
                      {t("back")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 text-xs text-slate-500" 
                      onClick={debugInfo}
                    >
                      Debug
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleGenerateReportClick} 
                      disabled={isLoading || !isTabComplete()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("processing")}
                        </>
                      ) : (
                        "Generate Report"
                      )}
                    </Button>
                    <Button 
                      onClick={handleStandardHairlineReportClick} 
                      disabled={isLoading || !isTabComplete()}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("processing")}
                        </>
                      ) : (
                        "4-6 cm"
                      )}
                    </Button>
                    <Button 
                      onClick={handleGenerateWithAIClick} 
                      disabled={isLoading || !isTabComplete()}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("processing")}
                        </>
                      ) : (
                        "Generate With AI"
                      )}
                    </Button>
                    <Button 
                      onClick={handlePredefinedLineReportClick} 
                      disabled={isLoading || !isTabComplete()}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("processing")}
                        </>
                      ) : (
                        "Pre-defined Line"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Consent Modal */}
      <Dialog open={isConsentModalOpen} onOpenChange={setIsConsentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Image Consent Agreement</DialogTitle>
            <DialogDescription>
              Please review the full consent details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              By uploading your image(s), you agree to the following:
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>Your images may be used for diagnostic, consultation, and hairline simulation purposes.</li>
              <li>Your data will be stored securely and accessed only by authorized personnel.</li>
              <li>You grant us permission to use anonymized images for AI model training to improve the accuracy of our hair simulation technology.</li>
              <li>Images used for training will not include personally identifiable information and will follow strict data privacy protocols.</li>
              <li>You may request deletion of your images from our systems at any time by contacting us.</li>
            </ul>

            <p>
              By checking the box on the form, you acknowledge that you have read and agreed to this consent agreement.
            </p>
            
            <div className="pt-4 text-right">
              <Button onClick={() => setIsConsentModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Report Generation */}
      <ConfirmationDialog
        isOpen={showReportConfirmation}
        onClose={() => setShowReportConfirmation(false)}
        onConfirm={handleConfirmReport}
        title="Generate AI Hair Consultation Report"
        description="You are about to generate an AI-powered hair transplant consultation report based on the client's photos and selected options."
        costRange="$0.10-$0.20"
        exactCost={0.16}
      />

      {/* Confirmation Dialog for 4-6cm Hairline */}
      <ConfirmationDialog
        isOpen={showStandardHairlineConfirmation}
        onClose={() => setShowStandardHairlineConfirmation(false)}
        onConfirm={handleConfirmStandardHairlineReport}
        title="Generate Report with Youthful Hairline"
        description="You are about to generate a report with the hairline positioned at the 4-6cm distance from the eyebrows, while keeping the selected hairline shape and style."
        costRange="$0.10-$0.20"
        exactCost={0.16}
      />

      {/* Confirmation Dialog for AI Analysis */}
      <ConfirmationDialog
        isOpen={showAIConfirmation}
        onClose={() => setShowAIConfirmation(false)}
        onConfirm={handleConfirmAI}
        title="AI Analysis Confirmation"
        description="You are about to generate an AI-powered hair transplant consultation report based on the client's photos and selected options."
        costRange="$0.10-$0.20"
        exactCost={0.16}
      />

      {/* Confirmation Dialog for Pre-defined Line */}
      <ConfirmationDialog
        isOpen={showPredefinedLineConfirmation}
        onClose={() => setShowPredefinedLineConfirmation(false)}
        onConfirm={handleConfirmPredefinedLineReport}
        title="Generate Report with Pre-defined Hairline"
        description="You are about to generate a report with the hairline following the pre-drawn line marked on the client's forehead."
        costRange="$0.10-$0.20"
        exactCost={0.16}
      />
    </>
  )
}
