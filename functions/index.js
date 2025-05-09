const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const cors = require('cors')({ origin: true, credentials: true });

// Initialize Firebase Admin
admin.initializeApp();

// Use the provided API key
const GEMINI_API_KEY = 'AIzaSyCX6MTCqXqXdjYEL8loEaJu8mF8wYKdNIs';

/**
 * Cloud function to generate a new hair look using Gemini API
 * This function must be deployed in us-central1 region where Gemini API is available
 */
exports.generateNewLook = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 300, // Increased timeout for potentially long AI generation (max 540)
    memory: '1GB',       // Increased memory for image processing
    minInstances: 0,     // Keep at least 0 instances warm
    invoker: 'public',   // Allow public access temporarily (remove for production)
  })
  .https.onCall(async (data, context) => {
    // CORS is automatically handled for callable functions, but we add more detailed logging
    console.log("Function invoked with clientId:", data.clientId);
    console.log("Origin:", context.rawRequest?.headers?.origin || 'Unknown origin');
    console.log("Auth:", context.auth ? 'Authenticated' : 'Unauthenticated');
    
    // Skip authentication check temporarily for testing
    // if (!context.auth) {
    //   console.error("Authentication required");
    //   throw new functions.https.HttpsError(
    //     'unauthenticated',
    //     'You must be logged in to use this function'
    //   );
    // }

    try {
      // Check if we have the required clientId
      if (!data.clientId || typeof data.clientId !== 'string') {
        console.error("Missing or invalid clientId parameter");
        throw new functions.https.HttpsError(
          'invalid-argument',
          'The function must be called with a valid "clientId" parameter'
        );
      }

      // Fetch client document from Firestore to get imageUrl and custom prompt
      const clientRef = admin.firestore().collection('clients').doc(data.clientId);
      const clientDoc = await clientRef.get();
      
      if (!clientDoc.exists) {
        console.error(`No client found with ID: ${data.clientId}`);
        throw new functions.https.HttpsError(
          'not-found',
          `No client found with ID: ${data.clientId}`
        );
      }
      
      const clientData = clientDoc.data();
      
      // Check if we have the client's frontImageUrl
      if (!clientData?.frontImageUrl) {
        console.error("Client does not have a front image URL");
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Client does not have a front image URL'
        );
      }

      // Get the image as base64
      let base64Image;
      let mimeType = 'image/jpeg';
      try {
        console.log("Downloading client image from URL:", clientData.frontImageUrl.substring(0, 50) + "...");
        // Download the image from the URL
        const imageResponse = await axios.get(clientData.frontImageUrl, { responseType: 'arraybuffer' });
        // Convert to base64
        const buffer = Buffer.from(imageResponse.data, 'binary');
        mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
        base64Image = buffer.toString('base64');
        console.log(`Image downloaded successfully. Size: ${buffer.length} bytes, Type: ${mimeType}`);
      } catch (imageError) {
        console.error("Error downloading the client image:", imageError);
        throw new functions.https.HttpsError(
          'internal',
          'Could not retrieve the client image for processing'
        );
      }

      // Use API key from request or fall back to environment
      const apiKey = data.key || GEMINI_API_KEY;
      if (!apiKey) {
        console.error("No API key available");
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No API key available for Gemini'
        );
      }

      // Initialize Gemini API with the provided key
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configure the model for image generation
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp-image-generation',
      });
      
      // Get the client's stored prompt or use the default
      let userPrompt;
      
      if (clientData.imagePrompt) {
        userPrompt = clientData.imagePrompt;
        console.log('Using client-specific prompt from Firestore');
      } else {
        // Create a default prompt using hairline and hairstyle info
        const hairlineTitle = clientData.hairlineTitle || 'natural';
        const hairstyleTitle = clientData.hairstyleTitle || 'modern';
        
        userPrompt = `
Transform this image of a client showing specific hair loss patterns.
Apply the ${hairstyleTitle} hairstyle with a ${hairlineTitle} hairline shape.
Maintain exact facial proportions, features, skin tone, and expressions from the original image.
DO NOT modify any facial features, face shape, or expressions.
ONLY add/modify the hair according to the specified style while maintaining a completely natural appearance.
Make the hair appear consistent with the client's natural color, texture, and appropriate density.
`;
        console.log('Using default prompt with client hairline/hairstyle preferences');
      }
      
      console.log("Using prompt:", userPrompt);
      
      // Prepare the request for the Gemini API with proper formatting
      const prompt = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: userPrompt },
              {
                inline_data: {
                  mimeType: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['image', 'text']
        }
      };

      console.log("Calling Gemini API for image generation");
      
      // Call the Gemini API to generate the image - using non-streaming version to avoid circular JSON issues
      const result = await model.generateContent(prompt);
      console.log("Received response from Gemini API");

      // Process the response
      const response = result.response;
      
      if (!response || !response.candidates || response.candidates.length === 0) {
        console.error("Empty or invalid response from Gemini API");
        throw new functions.https.HttpsError(
          'aborted',
          'Failed to generate new look image: Empty response from AI model'
        );
      }

      // Extract image data from response
      let generatedImageData = null;
      let generatedMimeType = 'image/jpeg';
      let textResponse = "";

      const candidate = response.candidates[0];
      if (candidate && candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            textResponse += part.text;
            console.log("Text response from model:", part.text);
          }
          
          if (part.inlineData) {
            generatedImageData = part.inlineData.data;
            generatedMimeType = part.inlineData.mimeType || 'image/jpeg';
            console.log(`Found image data in response. MIME type: ${generatedMimeType}`);
          }
        }
      }

      if (!generatedImageData) {
        console.error("No image data found in the API response");
        throw new functions.https.HttpsError(
          'aborted',
          `Failed to generate new look image. Model message: ${textResponse || "No information provided"}`
        );
      }

      // Convert the generated image to a buffer
      const generatedImage = Buffer.from(generatedImageData, 'base64');
      
      // Get the file extension from the MIME type
      let imageExtension = 'jpeg'; // Default extension
      
      if (generatedMimeType) {
        if (generatedMimeType === 'image/jpeg') imageExtension = 'jpg';
        else if (generatedMimeType === 'image/png') imageExtension = 'png';
        else if (generatedMimeType === 'image/gif') imageExtension = 'gif';
        else if (generatedMimeType === 'image/webp') imageExtension = 'webp';
        // Add more mappings as needed
      }

      // Upload the generated image to Firebase Storage
      const fileName = `generated-looks/${data.clientId}/${Date.now()}.${imageExtension}`;
      const bucket = admin.storage().bucket();
      const file = bucket.file(fileName);
      
      console.log(`Uploading generated image to Firebase Storage: ${fileName}`);
      
      let publicUrl;
      try {
        // Set metadata to make the file publicly accessible
        const metadata = {
          contentType: generatedMimeType,
          metadata: {
            firebaseStorageDownloadTokens: Date.now().toString(), // Generate a download token
          },
          public: true // Make file publicly accessible
        };

        await file.save(generatedImage, {
          metadata: metadata,
        });

        // Make the file publicly accessible
        await file.makePublic();

        // Generate a public URL that doesn't require signing
        publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        
        console.log(`Image uploaded successfully. URL: ${publicUrl.substring(0, 50)}...`);
      } catch (storageError) {
        // Fallback to Data URL if Storage operations fail
        console.error("Error saving to Firebase Storage:", storageError);
        console.log("Using Data URL as fallback...");
        
        // Create a data URL from the image buffer
        publicUrl = `data:${generatedMimeType};base64,${generatedImageData}`;
        console.log("Created Data URL fallback");
      }

      // Update the client document with the new look URL
      try {
        await clientRef.update({
          generatedLookUrl: publicUrl,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Client document updated with new image URL");
      } catch (firestoreError) {
        console.error("Error updating Firestore document:", firestoreError);
        // Continue anyway - we can still return the URL to the client
      }

      // Return success response with the image URL
      return {
        success: true,
        imageUrl: publicUrl,
        message: 'New look generated successfully'
      };
    } catch (error) {
      console.error('Error during image generation process:', error);
      
      // Detailed error logging
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      
      // If it's already an HttpsError, rethrow it
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      // Check for Gemini API specific error structures
      let errorMessage = 'An error occurred while generating the image';
      if (error.message) {
        errorMessage += `: ${error.message}`;
        console.error('Error message:', error.message);
      }
      
      // Log error details for debugging
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response statusText:', error.response.statusText);
        
        if (error.response.data) {
          try {
            console.error('Gemini API Error - Response Data:', JSON.stringify(error.response.data));
          } catch (e) {
            console.error('Gemini API Error - Cannot stringify response data:', e.message);
            console.error('Raw response data type:', typeof error.response.data);
          }
        }
      }
      
      throw new functions.https.HttpsError('internal', errorMessage);
    }
  });

// Also create a regular HTTP function with explicit CORS handling for direct HTTP access
exports.generateNewLookHttp = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .https.onRequest((req, res) => {
    // Set CORS headers for the preflight request
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    
    // For OPTIONS requests (preflight), just return 204
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    // For GET requests, return a test response
    if (req.method === 'GET') {
      res.status(200).json({ 
        message: 'API is working. Use POST with clientId to generate a new look.' 
      });
      return;
    }
    
    // For POST requests, implement the image generation functionality
    if (req.method === 'POST') {
      try {
        const clientId = req.body?.clientId;
        
        if (!clientId) {
          res.status(400).json({ error: 'clientId is required' });
          return;
        }
        
        // Execute the same function logic as the callable function
        generateNewLookImplementation(clientId)
          .then(result => {
            res.status(200).json(result);
          })
          .catch(error => {
            console.error('Error in HTTP function:', error);
            
            let statusCode = 500;
            let errorMessage = 'Internal server error';
            
            if (error.code === 'not-found') {
              statusCode = 404;
              errorMessage = error.message;
            } else if (error.code === 'invalid-argument') {
              statusCode = 400;
              errorMessage = error.message;
            }
            
            res.status(statusCode).json({ 
              error: errorMessage,
              success: false
            });
          });
      } catch (error) {
        console.error('Error in HTTP endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });

// Shared implementation function for both the callable and HTTP endpoints
async function generateNewLookImplementation(clientId) {
  console.log("Function invoked with clientId:", clientId);
  
  try {
    // Check if we have the required clientId
    if (!clientId || typeof clientId !== 'string') {
      console.error("Missing or invalid clientId parameter");
      throw { 
        code: 'invalid-argument',
        message: 'The function must be called with a valid "clientId" parameter'
      };
    }

    // Fetch client document from Firestore to get imageUrl and custom prompt
    const clientRef = admin.firestore().collection('clients').doc(clientId);
    const clientDoc = await clientRef.get();
    
    if (!clientDoc.exists) {
      console.error(`No client found with ID: ${clientId}`);
      throw {
        code: 'not-found',
        message: `No client found with ID: ${clientId}`
      };
    }
    
    const clientData = clientDoc.data();
    
    // Check if we have the client's frontImageUrl
    if (!clientData?.frontImageUrl) {
      console.error("Client does not have a front image URL");
      throw {
        code: 'failed-precondition',
        message: 'Client does not have a front image URL'
      };
    }

    // Get the image as base64
    let base64Image;
    let mimeType = 'image/jpeg';
    try {
      console.log("Downloading client image from URL:", clientData.frontImageUrl.substring(0, 50) + "...");
      // Download the image from the URL
      const imageResponse = await axios.get(clientData.frontImageUrl, { responseType: 'arraybuffer' });
      // Convert to base64
      const buffer = Buffer.from(imageResponse.data, 'binary');
      mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
      base64Image = buffer.toString('base64');
      console.log(`Image downloaded successfully. Size: ${buffer.length} bytes, Type: ${mimeType}`);
    } catch (imageError) {
      console.error("Error downloading the client image:", imageError);
      throw {
        code: 'internal',
        message: 'Could not retrieve the client image for processing'
      };
    }

    // Initialize Gemini API with the provided key
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Configure the model for image generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp-image-generation',
    });
    
    // Get the client's stored prompt or use the default
    let userPrompt;
    
    if (clientData.imagePrompt) {
      userPrompt = clientData.imagePrompt;
      console.log('Using client-specific prompt from Firestore');
    } else {
      // Create a default prompt using hairline and hairstyle info
      const hairlineTitle = clientData.hairlineTitle || 'natural';
      const hairstyleTitle = clientData.hairstyleTitle || 'modern';
      
      userPrompt = `
Transform this image of a client showing specific hair loss patterns.
Apply the ${hairstyleTitle} hairstyle with a ${hairlineTitle} hairline shape.
Maintain exact facial proportions, features, skin tone, and expressions from the original image.
DO NOT modify any facial features, face shape, or expressions.
ONLY add/modify the hair according to the specified style while maintaining a completely natural appearance.
Make the hair appear consistent with the client's natural color, texture, and appropriate density.
`;
      console.log('Using default prompt with client hairline/hairstyle preferences');
    }
    
    console.log("Using prompt:", userPrompt);
    
    // Prepare the request for the Gemini API with proper formatting
    const prompt = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: userPrompt },
            {
              inline_data: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['image', 'text']
      }
    };

    console.log("Calling Gemini API for image generation");
    
    // Call the Gemini API to generate the image - using non-streaming version to avoid circular JSON issues
    const result = await model.generateContent(prompt);
    console.log("Received response from Gemini API");

    // Process the response
    const response = result.response;
    
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error("Empty or invalid response from Gemini API");
      throw {
        code: 'aborted',
        message: 'Failed to generate new look image: Empty response from AI model'
      };
    }

    // Extract image data from response
    let generatedImageData = null;
    let generatedMimeType = 'image/jpeg';
    let textResponse = "";

    const candidate = response.candidates[0];
    if (candidate && candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          textResponse += part.text;
          console.log("Text response from model:", part.text);
        }
        
        if (part.inlineData) {
          generatedImageData = part.inlineData.data;
          generatedMimeType = part.inlineData.mimeType || 'image/jpeg';
          console.log(`Found image data in response. MIME type: ${generatedMimeType}`);
        }
      }
    }

    if (!generatedImageData) {
      console.error("No image data found in the API response");
      throw {
        code: 'aborted',
        message: `Failed to generate new look image. Model message: ${textResponse || "No information provided"}`
      };
    }

    // Convert the generated image to a buffer
    const generatedImage = Buffer.from(generatedImageData, 'base64');
    
    // Get the file extension from the MIME type
    let imageExtension = 'jpeg'; // Default extension
    
    if (generatedMimeType) {
      if (generatedMimeType === 'image/jpeg') imageExtension = 'jpg';
      else if (generatedMimeType === 'image/png') imageExtension = 'png';
      else if (generatedMimeType === 'image/gif') imageExtension = 'gif';
      else if (generatedMimeType === 'image/webp') imageExtension = 'webp';
      // Add more mappings as needed
    }

    // Upload the generated image to Firebase Storage
    const fileName = `generated-looks/${clientId}/${Date.now()}.${imageExtension}`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(fileName);
    
    console.log(`Uploading generated image to Firebase Storage: ${fileName}`);
    
    let publicUrl;
    try {
      // Set metadata to make the file publicly accessible
      const metadata = {
        contentType: generatedMimeType,
        metadata: {
          firebaseStorageDownloadTokens: Date.now().toString(), // Generate a download token
        },
        public: true // Make file publicly accessible
      };

      await file.save(generatedImage, {
        metadata: metadata,
      });

      // Make the file publicly accessible
      await file.makePublic();

      // Generate a public URL that doesn't require signing
      publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      console.log(`Image uploaded successfully. URL: ${publicUrl.substring(0, 50)}...`);
    } catch (storageError) {
      // Fallback to Data URL if Storage operations fail
      console.error("Error saving to Firebase Storage:", storageError);
      console.log("Using Data URL as fallback...");
      
      // Create a data URL from the image buffer
      publicUrl = `data:${generatedMimeType};base64,${generatedImageData}`;
      console.log("Created Data URL fallback");
    }

    // Update the client document with the new look URL
    try {
      await clientRef.update({
        generatedLookUrl: publicUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Client document updated with new image URL");
    } catch (firestoreError) {
      console.error("Error updating Firestore document:", firestoreError);
      // Continue anyway - we can still return the URL to the client
    }

    // Return success response with the image URL
    return {
      success: true,
      imageUrl: publicUrl,
      message: 'New look generated successfully'
    };
  } catch (error) {
    console.error('Error during image generation process:', error);
    
    // Detailed error logging
    console.error('Error type:', typeof error);
    console.error('Error name:', error.name);
    
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response statusText:', error.response.statusText);
      
      if (error.response.data) {
        try {
          console.error('API Error - Response Data:', JSON.stringify(error.response.data));
        } catch (e) {
          console.error('API Error - Cannot stringify response data:', e.message);
          console.error('Raw response data type:', typeof error.response.data);
        }
      }
    }
    
    // Rethrow the error for handling by the caller
    throw error;
  }
} 