import { useQuery } from "@tanstack/react-query";

export function useAdminStats() {
  return useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
    refetchInterval: 30000, // refresh every 30s
  });
}

export function useAdminChecks(limit = 100) {
  return useQuery({
    queryKey: ["/api/admin/checks", limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/checks?limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin checks");
      return res.json();
    },
  });
}

export function useCriticalChecks(limit = 20) {
  return useQuery({
    queryKey: ["/api/admin/critical-checks", limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/critical-checks?limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch critical checks");
      return res.json();
    },
    refetchInterval: 15000, // refresh every 15s for critical alerts
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin users");
      return res.json();
    },
  });
}
