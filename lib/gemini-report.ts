import { GoogleGenerativeAI } from '@google/generative-ai';

type ClientInfo = {
  name: string;
  age: string | number;
  notes: string;
  gender?: string;
  phoneNumber?: string;
  emailAddress?: string;
};

type HairlineInfo = {
  id: string;
  title: string;
  description: string;
};

type HairstyleInfo = {
  id: string;
  title: string;
  description: string;
};

// Use the hardcoded API key if process.env is not available
const GEMINI_API_KEY = "AIzaSyBOlZSEpVPyidZN84POQju5wGjmVVIUlZ0";

export async function generateHairTransplantReport(
  clientInfo: ClientInfo,
  hairlineInfo: HairlineInfo,
  hairstyleInfo: HairstyleInfo,
  imageBase64: string
) {
  try {
    // Try to get API key from env vars, fallback to hardcoded key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Gemini API key not found");
    }

    console.log("Initializing Gemini API with key", apiKey.substring(0, 5) + "...");
    const ai = new GoogleGenerativeAI(apiKey);

    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    console.log("Preparing report prompt for client:", clientInfo.name);
    const reportPrompt = `
Generate a comprehensive hair transplant consultation report based on the following client information and the attached image. 

Client name: ${clientInfo.name}
Client age: ${clientInfo.age}
Client gender: ${clientInfo.gender || 'Not specified'}
Phone number: ${clientInfo.phoneNumber || 'Not provided'}
Email address: ${clientInfo.emailAddress || 'Not provided'}
Additional notes: ${clientInfo.notes}

Selected hairline shape: ${hairlineInfo.title}
Selected hairline description: ${hairlineInfo.description}
Selected hairstyle: ${hairstyleInfo.title}

IMPORTANT: Return the report in valid JSON format with the following structure:
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
}

Ensure all values are appropriate for the client based on the image and provided information.
`;

    // For the image generation prompt (not part of the visible report, store separately):
    const aiImagePrompt = `
Objective: Photorealistic hair transplant simulation using an input image.
Input Client: ${clientInfo.age} year old ${clientInfo.gender || 'person'}.

************************************************
⚠️ ABSOLUTE HIGHEST PRIORITY INSTRUCTION ⚠️
KEEP ALL EYEWEAR/SUNGLASSES EXACTLY AS THEY ARE
If client is wearing sunglasses or eyeglasses in the original image, they MUST be wearing the EXACT SAME eyewear in the output image.
DO NOT REMOVE OR MODIFY ANY EYEWEAR UNDER ANY CIRCUMSTANCES.
************************************************

************************************************
⚠️ CRITICAL CAMERA & GAZE INSTRUCTION ⚠️
MAINTAIN EXACT SAME CAMERA ANGLE AND EYE DIRECTION
- If person is looking directly at camera, they MUST be looking directly at camera in result
- If person is looking to the side/up/down, maintain that EXACT gaze direction
- DO NOT change where the eyes are looking or the camera perspective
************************************************

**CRITICAL INSTRUCTION: FACIAL FIDELITY PARAMOUNT.**
The client's facial features (eyes, nose, mouth, jawline, chin), overall face shape, skin tone, skin texture (including moles, freckles, wrinkles), and exact expression from the original input image MUST BE PRESERVED IDENTICALLY. DO NOT ALTER THE FACE IN ANY WAY. The original face is the non-negotiable base.

**ADDITIONAL CRITICAL REQUIREMENTS:**
- MAINTAIN EXACT EYE GAZE DIRECTION: If client is looking at camera, they must still be looking at camera. If looking away, maintain exact same direction.
- SUNGLASSES/EYEGLASSES MUST REMAIN: If the client is wearing sunglasses or eyeglasses, they MUST appear EXACTLY the same in the result image.
- MAINTAIN EXACT HEAD POSE AND ANGLE: Do NOT change the client's head orientation. If the original shows a frontal view, do NOT create a side profile. If the client is looking slightly to the side, maintain that exact angle.
- PRESERVE ALL ACCESSORIES: Do NOT remove or modify any eyeglasses, sunglasses, piercings, earrings, hats, or other accessories present in the original image.
- MAINTAIN EXACT FRAMING AND DISTANCE: Keep the same camera distance, perspective, and framing as the original image. Do NOT zoom in or out.
- PRESERVE LIGHTING CONDITIONS: Maintain the same lighting, shadows, and overall ambience from the original image.

**EXAMPLES OF WHAT NOT TO DO:**
- ❌ DO NOT REMOVE SUNGLASSES OR EYEGLASSES - This is the most common error and is strictly prohibited
- ❌ DO NOT change where the person is looking - maintain exact eye gaze direction
- ❌ DO NOT change camera angle, perspective or distance - the viewpoint must remain exactly the same
- ❌ DO NOT zoom in more on the face - maintain the exact same framing
- ❌ Do NOT replace sunglasses with regular eyeglasses or vice versa
- ❌ Do NOT change a frontal view to a side profile or vice versa
- ❌ Do NOT alter facial expressions
- ❌ Do NOT change the camera distance or zoom level
- ❌ Do NOT alter the background or environment

Hair Modification Details:
1. Target Hairline Shape: ${hairlineInfo.title} - detailed as: "${hairlineInfo.description}"
   Keywords for this hairline type: ${
     hairlineInfo.id === "arch" ? "rounded hairline, soft curve hairline, arched forehead, even hairline, natural hairline, no widow's peak, full frontal hairline" :
     hairlineInfo.id === "v-shape" ? "V-shape hairline, defined widow's peak, M-shape hairline, angular hairline, receding temples (styled), pointed hairline, masculine hairline" :
     hairlineInfo.id === "oval" ? "oval hairline, U-shape hairline, curved forehead hairline, soft framing hairline, gentle curve hairline, high arch hairline" :
     "semi-V hairline, subtle widow's peak, soft V-shape, broken arch hairline, natural M-shape, masculine versatile hairline"
   }

2. Target Hairstyle: ${hairstyleInfo.title} - detailed as: "${hairstyleInfo.description}"
   Keywords for this hairstyle: ${
     hairstyleInfo.id === "textured-quiff" ? "textured quiff, men's quiff hairstyle, voluminous top, short sides long top, piecey hair texture, modern messy quiff, styled up hair, lifted fringe" :
     hairstyleInfo.id === "angular-fringe" ? "angular fringe, men's fringe hairstyle, side-swept fringe, textured fringe, undercut with fringe, asymmetrical bangs, modern men's bangs" :
     "slicked back undercut, men's slick back hair, undercut hairstyle, long top short sides, pomade hairstyle, classic slick back, disconnected undercut, polished hair"
   }

3. Hair Characteristics:
   * Color & Texture: Match the color and texture of any existing hair visible on the client in the input image. If minimal or no original hair is present, use a natural color and texture that would suit the client. The new hair must blend seamlessly.
   * Appearance & Density: Create a realistic, high-quality hair transplant effect. The new hairline should be soft, feathered, and natural, avoiding harsh lines or a "pluggy" look. Individual hair strands should mimic natural growth patterns. Ensure full density along the new hairline, but avoid an unnatural wig-like appearance.

4. Styling Execution: Render the chosen ${hairstyleInfo.title} in a manner that is styled naturally and appears suitable for a ${clientInfo.age} year old ${clientInfo.gender || 'person'}.

The final image should show the *exact same person* from the input image, but with the specified new hair. Focus ONLY on adding/modifying the hair. The goal is to show the client with their exact same face and appearance, just with different hair.

FINAL REMINDERS: 
- If the client is wearing sunglasses in the original image, they MUST be wearing the EXACT SAME sunglasses in the result.
- If the client is looking directly at the camera in the original, they MUST be looking directly at the camera in the result.
- The camera angle, perspective, and distance MUST be identical to the original image.
`;

    // Add image to the request
    console.log("Preparing image for API request");
    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error("Invalid image data");
    }
    
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    console.log("Calling Gemini API to generate content");
    const result = await model.generateContent([reportPrompt, imagePart]);
    console.log("Received response from Gemini API");
    
    const response = await result.response;
    const text = response.text();
    
    console.log("Report generated successfully with length:", text.length);

    // Try to parse the response as JSON
    let jsonReport;
    try {
      jsonReport = JSON.parse(text);
      console.log("Successfully parsed report as JSON");
    } catch (e) {
      console.warn("Could not parse response as JSON, using text format instead");
      // If parsing fails, create a structured format from the text
      jsonReport = {
        rawText: text,
        isStructured: false
      };
    }

    return {
      report: jsonReport,
      imagePrompt: aiImagePrompt,
      isStructured: jsonReport.isStructured !== false,
      success: true // Add success flag for charging
    };
  } catch (error: any) {
    console.error("Error details:", error.message, error.stack);
    
    // Create a fallback report in JSON format if the API fails
    const fallbackReport = {
      isStructured: true,
      clientInformation: {
        name: clientInfo.name,
        age: clientInfo.age || "Unknown",
        gender: clientInfo.gender || "Not specified",
        phoneNumber: clientInfo.phoneNumber || "Not provided",
        emailAddress: clientInfo.emailAddress || "Not provided"
      },
      hairLossAssessment: {
        pattern: "Unable to assess",
        severity: {
          score: 0,
          category: "Unable to assess"
        },
        hairlineRecession: "Unable to assess due to technical error",
        crownThinning: "Unable to assess due to technical error",
        overallDensity: "Unable to assess due to technical error",
        distinctiveCharacteristics: "Unable to assess due to technical error"
      },
      characteristics: {
        hairColor: "Unknown",
        hairTexture: "Unknown",
        hairThickness: "Unknown",
        hairDensity: "Unknown",
        faceShape: "Unknown",
        scalpCondition: "Unknown",
        growthPattern: "Unknown"
      },
      recommendations: {
        approach: `Selected hairline shape: ${hairlineInfo.title}, Selected hairstyle: ${hairstyleInfo.title}`,
        graftCount: 0,
        specialConsiderations: "Please consult with a specialist for personalized treatment recommendations",
        expectedResults: "Unable to predict due to technical error"
      },
      summary: "Unable to generate AI assessment due to technical error. Please contact support."
    };

    // Return the fallback report with error details
    return {
      report: fallbackReport,
      imagePrompt: "Error occurred: " + error.message,
      error: error.message,
      isStructured: true,
      success: false // Add success flag for charging
    };
  }
} 