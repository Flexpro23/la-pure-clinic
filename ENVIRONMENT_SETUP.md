# Environment Variables Setup

This project requires several environment variables to function correctly. These variables contain sensitive API keys and configuration that should **not** be committed to the repository.

## Required Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```
# Firebase configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Gemini API keys
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
FUNCTIONS_GEMINI_API_KEY=your_functions_gemini_api_key
```

## For Firebase Cloud Functions

When deploying Cloud Functions, you'll need to set environment variables using the Firebase CLI:

```bash
firebase functions:config:set gemini.apikey="your_gemini_api_key"
```

Then, in your functions code, access them with:

```typescript
const apiKey = process.env.FUNCTIONS_GEMINI_API_KEY || functions.config().gemini.apikey;
```

## Security Notes

- Never commit `.env*` files to your repository
- Ensure `.env*` files are in your `.gitignore`
- Rotate API keys if you suspect they've been exposed
- Use different API keys for development and production environments 