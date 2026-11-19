"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CatalogData, readCachedCatalog, useCatalogStore } from "./catalog";

async function fetchCatalog(): Promise<CatalogData> {
  const res = await fetch("/api/catalog");
  if (!res.ok) throw new Error("Couldn't load the catalog");
  return res.json();
}

/** Loads the catalog (names, visibility) into the store; renders nothing. */
export function CatalogSync() {
  const { data } = useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalog,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const set = useCatalogStore((s) => s.set);
  // The last catalog this browser saw, right after hydration (before the fetch returns).
  useEffect(() => {
    const cached = readCachedCatalog();
    if (cached?.offerings && useCatalogStore.getState().version === 0) set(cached);
  }, [set]);
  useEffect(() => {
    if (data?.offerings) set(data);
  }, [data, set]);
  return null;
}
