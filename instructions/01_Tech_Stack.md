# Technology Stack

Based on the analysis of the codebase, primarily `components/simulation/new-simulation-form.tsx`, `package.json`, `next.config.mjs`, `tailwind.config.ts`, and other configuration files, the following technology stack is inferred:

*   **Frontend Framework/Library:** React
*   **Meta-Framework:** Next.js (using App Router)
*   **Language:** TypeScript
*   **Styling:**
    *   Tailwind CSS
    *   Likely `clsx` or a similar utility for conditional class names (common with Tailwind).
*   **UI Components:**
    *   [shadcn/ui](https://ui.shadcn.com/) (indicated by `@/components/ui/...` imports and `components.json`).
    *   Custom components organized within the `components/` directory.
*   **State Management:**
    *   Local component state: React `useState`.
    *   Global state: React `useContext` (as seen with `useLanguage` from `language-context`).
*   **Routing:** Next.js Router (`next/navigation`).
*   **Package Manager:** pnpm (inferred from `pnpm-lock.yaml`).
*   **Internationalization (i18n):** Custom solution using a `useLanguage` hook and `t()` function, likely powered by a context provider (`contexts/language-context.tsx`).
*   **Linting/Formatting:** (Assumed, but not explicitly detailed in the provided file) ESLint, Prettier are common in such stacks.
*   **Build Tool:** Next.js CLI / Webpack / Turbopack (managed by Next.js). 