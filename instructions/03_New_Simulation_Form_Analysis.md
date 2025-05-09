# `new-simulation-form.tsx` Component Analysis

This component is responsible for the multi-step process of creating a new simulation.

## Key Functionalities:

*   **Tabbed Navigation:** Uses `Tabs` from `@/components/ui/tabs` to structure the form into three sections:
    1.  `client-info`: For name, age, notes.
    2.  `images`: For uploading a frontal image.
    3.  `hairline`: For selecting hairline and hairstyle.
*   **State Management:** Uses `useState` for:
    *   `activeTab`: Current active tab.
    *   `isLoading`: Submission loading state.
    *   `clientInfo`: Object for name, age, notes.
    *   `frontImage`: Stores the `File` object for the uploaded front image.
    *   `selectedHairline`: Stores the ID of the selected hairline.
    *   `selectedHairstyle`: Stores the ID of the selected hairstyle.
*   **Input Handling:**
    *   `handleClientInfoChange`: Updates `clientInfo` state.
    *   `handleFrontImageUpload`: Updates `frontImage` state via the `ImageUpload` component.
    *   `handleHairlineSelect`: Updates `selectedHairline` state via the `HairlineSelector` component.
    *   `handleHairstyleSelect`: Updates `selectedHairstyle` state via the `HairstylePreview` component.
*   **Navigation Control:**
    *   `handleNextTab`: Moves to the next tab if the current tab's requirements are met.
    *   `handlePrevTab`: Moves to the previous tab.
    *   `isTabComplete`: Checks if the current tab's required fields are filled.
*   **Submission:**
    *   `handleSubmit`:
        *   Sets `isLoading` to true.
        *   **Currently simulates an API call using `setTimeout`.**
        *   Generates a random simulation ID.
        *   Redirects to `/dashboard/[simulationId]` using Next.js `router`.

## Dependencies and Child Components:

*   **`@/components/ui/*`**: Various UI primitives from shadcn/ui (Button, Input, Label, Card, Tabs, Loader2).
*   **`@/components/case/image-upload`**: Used for selecting the frontal image. Its internal implementation for actual upload to a server is not detailed in this analysis but is crucial for functionality.
*   **`@/components/case/hairline-selector`**:
    *   Presents options for hairline types.
    *   **Data Source:** Hairline options are **hardcoded** as an array of objects within `hairline-selector.tsx`.
*   **`@/components/case/hairstyle-preview`**:
    *   Presents hairstyle options based on the selected `hairlineType`.
    *   **Data Source:** Hairstyle options are **hardcoded** as a `Record<string, any[]>` (an object mapping hairline IDs to arrays of hairstyle objects) within `hairstyle-preview.tsx`.
    *   Includes a static placeholder section for "Simulation Preview" which does not render actual images or simulation results.
*   **`@/contexts/language-context`**: Provides internationalization through the `useLanguage` hook and `t()` function.

## Current Limitations within the Component:

*   **Mocked API Call:** The submission process is not connected to a real backend.
*   **Static Data:** Hairline and hairstyle options are not fetched dynamically.
*   **No Real Simulation Display:** The preview section is a placeholder. 