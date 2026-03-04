import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Helper to log Zod errors
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    // Still throw to let react-query handle the error state
    throw result.error;
  }
  return result.data;
}

export function useSymptomChecks() {
  return useQuery({
    queryKey: [api.symptomChecks.list.path],
    queryFn: async () => {
      const res = await fetch(api.symptomChecks.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch symptom checks");
      const data = await res.json();
      return parseWithLogging(api.symptomChecks.list.responses[200], data, "symptomChecks.list");
    },
  });
}

export function useSymptomCheck(id: number) {
  return useQuery({
    queryKey: [api.symptomChecks.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.symptomChecks.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch symptom check");
      const data = await res.json();
      return parseWithLogging(api.symptomChecks.get.responses[200], data, "symptomChecks.get");
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateSymptomCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { symptoms: string[]; description?: string }) => {
      const validated = api.symptomChecks.create.input.parse(input);
      const res = await fetch(api.symptomChecks.create.path, {
        method: api.symptomChecks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create symptom check");
      }
      
      const data = await res.json();
      return parseWithLogging(api.symptomChecks.create.responses[201], data, "symptomChecks.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.symptomChecks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) {
        // Return fallback data if endpoint is missing/fails
        return { checksToday: 0, avgRiskScore: 0, highRiskCases: 0 };
      }
      const data = await res.json();
      return parseWithLogging(api.stats.get.responses[200], data, "stats.get");
    },
    retry: false, // Don't block UI if stats fail
  });
}
