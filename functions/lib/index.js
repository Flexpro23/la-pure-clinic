"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewLook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
const mime = require("mime");
const axios_1 = require("axios");
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
    memory: '1GB', // Increased memory for image processing
})
    .https.onCall(async (data, context) => {
    var _a, e_1, _b, _c;
    console.log("Function invoked with clientId:", data.clientId);
    // Check authentication
    if (!context.auth) {
        console.error("Authentication required");
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to use this function');
    }
    try {
        // Check if we have the required clientId
        if (!data.clientId || typeof data.clientId !== 'string') {
            console.error("Missing or invalid clientId parameter");
            throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "clientId" parameter');
        }
        // Fetch client document from Firestore to get imageUrl and custom prompt
        const clientRef = admin.firestore().collection('clients').doc(data.clientId);
        const clientDoc = await clientRef.get();
        if (!clientDoc.exists) {
            console.error(`No client found with ID: ${data.clientId}`);
            throw new functions.https.HttpsError('not-found', `No client found with ID: ${data.clientId}`);
        }
        const clientData = clientDoc.data();
        // Check if we have the client's frontImageUrl
        if (!(clientData === null || clientData === void 0 ? void 0 : clientData.frontImageUrl)) {
            console.error("Client does not have a front image URL");
            throw new functions.https.HttpsError('failed-precondition', 'Client does not have a front image URL');
        }
        // Get the image as base64
        let base64Image;
        try {
            console.log("Downloading client image from URL:", clientData.frontImageUrl.substring(0, 50) + "...");
            // Download the image from the URL
            const imageResponse = await axios_1.default.get(clientData.frontImageUrl, { responseType: 'arraybuffer' });
            // Convert to base64
            const buffer = Buffer.from(imageResponse.data, 'binary');
            const imageType = imageResponse.headers['content-type'] || 'image/jpeg';
            base64Image = buffer.toString('base64');
            console.log(`Image downloaded successfully. Size: ${buffer.length} bytes, Type: ${imageType}`);
        }
        catch (imageError) {
            console.error("Error downloading the client image:", imageError);
            throw new functions.https.HttpsError('internal', 'Could not retrieve the client image for processing');
        }
        // Use API key from request or fall back to environment
        const apiKey = data.key || GEMINI_API_KEY;
        if (!apiKey) {
            console.error("No API key available");
            throw new functions.https.HttpsError('failed-precondition', 'No API key available for Gemini');
        }
        // Initialize Gemini API with the provided key
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        // Configure the model for image generation
        // Use the experimental image generation model mentioned in the reference
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp-image-generation',
            // No generationConfig needed for this model
        });
        // Get the client's stored prompt or use the default
        let userPrompt;
        if (clientData.imagePrompt) {
            userPrompt = clientData.imagePrompt;
            console.log('Using client-specific prompt from Firestore');
        }
        else {
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
        // Prepare the parts for the Gemini API
        const parts = [
            { text: userPrompt },
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image
                }
            }
        ];
        console.log("Calling Gemini API for image generation");
        // Call the Gemini API to generate the image
        const result = await model.generateContentStream(parts);
        console.log("Received stream response from Gemini API. Processing chunks...");
        // Process the stream response
        let responseData = null;
        let accumulatedText = "";
        try {
            for (var _d = true, _e = __asyncValues(result.stream), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const chunk = _c;
                if (!chunk.candidates || chunk.candidates.length === 0 || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
                    console.log("Skipping chunk: no relevant candidates or parts");
                    continue;
                }
                const parts = chunk.candidates[0].content.parts;
                for (const part of parts) {
                    if (part.inlineData) {
                        const inlineData = part.inlineData;
                        console.log(`Found image data in stream. Mime type: ${inlineData.mimeType}, Data length: ${inlineData.data ? inlineData.data.length : 0}`);
                        responseData = {
                            imageData: inlineData.data,
                            mimeType: inlineData.mimeType
                        };
                        break;
                    }
                    else if (part.text) {
                        console.log("Received text part in stream:", part.text);
                        accumulatedText += part.text + "\n";
                    }
                }
                if (responseData) {
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // If no image was generated, return an error
        if (!responseData) {
            console.error("No image data found in the API response");
            if (accumulatedText) {
                console.log("Accumulated text from stream:", accumulatedText.trim());
                throw new functions.https.HttpsError('aborted', "No image generated. Model output: " + accumulatedText.trim());
            }
            throw new functions.https.HttpsError('aborted', 'Failed to generate new look image');
        }
        console.log("Successfully extracted image data from stream");
        // Extract image data
        const generatedImage = Buffer.from(responseData.imageData, 'base64');
        const imageExtension = mime.extension(responseData.mimeType) || 'jpeg';
        // Upload the generated image to Firebase Storage
        const fileName = `generated-looks/${data.clientId}/${Date.now()}.${imageExtension}`;
        const bucket = admin.storage().bucket();
        const file = bucket.file(fileName);
        console.log(`Uploading generated image to Firebase Storage: ${fileName}`);
        await file.save(generatedImage, {
            metadata: {
                contentType: responseData.mimeType,
            },
        });
        // Get the public URL for the uploaded image
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500', // Long-lived URL
        });
        console.log(`Image uploaded successfully. URL: ${url.substring(0, 50)}...`);
        // Update the client document with the new look URL
        await clientRef.update({
            generatedLookUrl: url,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Client document updated with new image URL");
        // Return success response with the image URL
        return {
            success: true,
            imageUrl: url,
            message: 'New look generated successfully'
        };
    }
    catch (error) {
        console.error('Error during image generation process:', error);
        // If it's already an HttpsError, rethrow it
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        // Check for Gemini API specific error structures
        let errorMessage = 'An error occurred while generating the image';
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        if (error.response && error.response.data) {
            console.error('Gemini API Error - Response Data:', JSON.stringify(error.response.data));
        }
        else if (error.cause) {
            console.error('Gemini API Error - Cause:', error.cause);
        }
        throw new functions.https.HttpsError('internal', errorMessage);
    }
});
//# sourceMappingURL=index.js.map