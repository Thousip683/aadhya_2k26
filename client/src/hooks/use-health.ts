import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type SymptomCheck } from "@shared/schema";

// We define our local types based on the prompt's schema and route definitions
type CreateSymptomCheckRequest = {
  symptoms: string[];
  description?: string;
};

type StatsResponse = {
  checksToday: number;
  avgRiskScore: number;
  highRiskCases: number;
};

// --- GET ALL SYMPTOM CHECKS ---
export function useSymptomChecks() {
  return useQuery({
    queryKey: ["/api/symptom-checks"],
    queryFn: async () => {
      const res = await fetch("/api/symptom-checks", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch symptom checks");
      return (await res.json()) as SymptomCheck[];
    },
  });
}

// --- GET SINGLE SYMPTOM CHECK ---
export function useSymptomCheck(id: number) {
  return useQuery({
    queryKey: [`/api/symptom-checks/${id}`],
    queryFn: async () => {
      if (isNaN(id)) return null;
      const res = await fetch(`/api/symptom-checks/${id}`, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch symptom check details");
      return (await res.json()) as SymptomCheck;
    },
    enabled: !!id,
  });
}

// --- CREATE SYMPTOM CHECK ---
export function useCreateSymptomCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSymptomCheckRequest) => {
      const res = await fetch("/api/symptom-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Failed to analyze symptoms");
      }
      return (await res.json()) as SymptomCheck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptom-checks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

// --- GET STATS ---
export function useStats() {
  return useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return (await res.json()) as StatsResponse;
    },
  });
}
