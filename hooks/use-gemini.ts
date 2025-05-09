'use client';

import { useState } from 'react';
import { generateWithGemini } from '@/lib/gemini';

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function generateResponse(prompt: string) {
    setLoading(true);
    setError(null);
    
    try {
      const response = await generateWithGemini(prompt);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    generateResponse,
    loading,
    error,
  };
} 