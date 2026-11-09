import { Statistics } from "../types/statistics.types";

export const getStatistics = async (): Promise<Statistics> => {
  const res = await fetch("/api/admin/users/statistics");
  if (!res.ok) throw new Error("Failed to load statistics");
  return res.json();
};
