# Firebase Cloud Functions for La Pure Clinic

This directory contains the Firebase Cloud Functions used by the La Pure Clinic application.

## Setup Instructions

### Prerequisites

1. Install Firebase CLI globally if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

### Initial Setup

1. Navigate to the functions directory:
   ```
   cd functions
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables for Gemini API:
   ```
   firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
   ```

   Make sure you're using a Gemini API key that works with the "gemini-2.0-flash-preview-image-generation" model.

### Local Development

1. To run functions locally for testing:
   ```
   npm run serve
   ```

2. For continuous development with auto-rebuild:
   ```
   npm run build:watch
   ```

### Deployment

1. To deploy all functions:
   ```
   firebase deploy --only functions
   ```

2. To deploy a specific function:
   ```
   firebase deploy --only functions:generateNewLook
   ```

## Important Notes

- The `generateNewLook` function must be deployed to the `us-central1` region as the Gemini API is only available in US regions.
- Make sure your Firebase project has the Blaze (pay as you go) plan active, as Cloud Functions require this plan.
- The function uses the Gemini API to generate new hairstyle visualizations based on client photos.

## Troubleshooting

- If you get CORS errors, ensure your Firebase project is properly configured to allow requests from your domains.
- If you encounter "Function not found" errors, make sure the function is properly deployed and referenced with the correct region (`us-central1`).
- Check Firebase function logs for detailed error messages:
  ```
  firebase functions:log
  ``` 