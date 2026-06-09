import { useState, useCallback } from "react";

interface UseAiOptions {
  endpoint: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useAi({ endpoint, onSuccess, onError }: UseAiOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const generate = useCallback(
    async (payload: Record<string, any>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.statusText}`);
        }

        const data = await response.json();
        setResult(data.content || data.answer || "");
        onSuccess?.(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        onError?.(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, error, result, generate, reset };
}
