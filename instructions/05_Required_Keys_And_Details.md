# Required Keys & Technical Details for Development

To take the existing frontend codebase, particularly the `new-simulation-form.tsx`, and develop it into a fully functional application, the following key information, specifications, and decisions would be required:

## 1. Backend API Specification (Crucial)

*   **Authentication:**
    *   Method (e.g., JWT, OAuth2, session-based).
    *   Endpoints for login, registration, logout, password reset, etc.
    *   Token handling and secure storage on the client-side.
*   **Client/Case Management API:**
    *   Endpoints for CRUD operations on client/patient records.
    *   Data models/schemas for client information.
*   **Image Handling API:**
    *   Endpoint for image uploads (e.g., `POST /api/images/upload`).
    *   Expected format (e.g., `multipart/form-data`).
    *   Response format (e.g., image URL, ID).
    *   Image storage solution details (e.g., S3 bucket name, access credentials if frontend uploads directly, or if backend handles transfer).
*   **Hairline/Hairstyle Data API (if made dynamic):**
    *   Endpoints to `GET` hairline options.
    *   Endpoints to `GET` hairstyle options (possibly filterable by hairline type).
    *   Data models for hairlines and hairstyles.
*   **Simulation API:**
    *   Endpoint to submit simulation request (e.g., `POST /api/simulations`):
        *   Expected payload: client ID, image ID(s)/URL(s), selected hairline ID, selected hairstyle ID, any other parameters.
    *   Endpoint(s) to check simulation status and retrieve results (e.g., `GET /api/simulations/{simulationId}`):
        *   Response format: URL to simulated image, other metadata.
*   **Error Codes & Messages:** Standardized API error responses.

## 2. Simulation Engine Details

*   **Interface:** How does the frontend/backend interact with the simulation engine? (e.g., direct API call to a microservice, SDK, internal library call on the backend).
*   **Input Requirements:**
    *   Image format, resolution, size constraints.
    *   Specific data points required (e.g., facial landmarks if needed by the engine).
*   **Output Format:**
    *   Format of the simulated image (e.g., JPEG, PNG).
    *   Any accompanying metadata.
*   **Processing Time:** Expected latency for a simulation to be generated.
*   **Authentication/Access for the Engine:** If it's a separate service.

## 3. Database Schema

*   An understanding of the backend database structure for:
    *   Users
    *   Clients/Patients
    *   Cases
    *   Images
    *   Simulations (linking inputs to outputs and users/clients)
    *   Hairline options (if dynamic)
    *   Hairstyle options (if dynamic)

## 4. Image Storage and CDN

*   **Storage Service:** (e.g., AWS S3, Google Cloud Storage, Azure Blob Storage).
*   **Access Control:** How will images be secured?
*   **CDN:** Will a Content Delivery Network be used for serving images efficiently?

## 5. Content Assets

*   **Hairline/Hairstyle Visuals:** If the UI is to show example images for hairlines or hairstyles (beyond just names), these assets would be needed.
*   **Actual "Simulated Result" Examples:** To replace placeholders if a more representative UI is needed before full integration.

## 6. Deployment and Infrastructure

*   Hosting environment for the Next.js frontend.
*   Hosting environment for the backend API and database.
*   CI/CD pipeline setup.
*   Environment variables (API base URLs, keys, etc.).

## 7. Third-Party Service Credentials

*   Any API keys for services like analytics, error tracking, email services, etc.

This list provides a starting point for the information gathering and decision-making process required to build out the application. 