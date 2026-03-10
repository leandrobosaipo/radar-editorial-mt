import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@/types/dashboard";
import { DATA_URL, REFRESH_INTERVAL } from "@/config";
import { MOCK_DATA } from "@/data/mockData";

async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch {
    // Fallback to mock data in development / when endpoint unavailable
    console.warn("Using mock data — JSON endpoint unavailable");
    return MOCK_DATA;
  }
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
    refetchInterval: REFRESH_INTERVAL,
    retry: 2,
  });
}
