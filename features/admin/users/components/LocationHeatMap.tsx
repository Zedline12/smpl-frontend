"use client";

import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface LocationData {
  country: string;
  countryCode: string;
  count: number;
}

interface Props {
  /** filter the locations to paid or free users */
  isSubscribed?: boolean;
  /** single-user mode: highlight this country */
  countryCode?: string | null;
  country?: string | null;
  city?: string | null;
  onClose: () => void;
}

function interpolateColor(value: number, max: number): string {
  if (max === 0) return "#1e1e2e";
  const t = Math.min(value / max, 1);
  // dark background → purple
  const r = Math.round(30 + t * (124 - 30));
  const g = Math.round(30 + t * (58 - 30));
  const b = Math.round(46 + t * (237 - 46));
  return `rgb(${r},${g},${b})`;
}

export default function LocationHeatMap({
  isSubscribed,
  countryCode: singleCountryCode,
  country: singleCountry,
  city: singleCity,
  onClose,
}: Props) {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [tooltip, setTooltip] = useState<{ name: string; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const isSingleUser = singleCountryCode !== undefined;

  useEffect(() => {
    if (isSingleUser) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    if (isSubscribed !== undefined) params.set("isSubscribed", String(isSubscribed));
    fetch(`/api/admin/users/locations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setLocations(d?.data ?? d ?? []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, [isSubscribed, isSingleUser]);

  const countByCode = Object.fromEntries(
    locations.map((l) => [l.countryCode, { count: l.count, country: l.country }]),
  );
  const max = Math.max(...locations.map((l) => l.count), 1);

  const locationAvailable = !isSingleUser || !!singleCountryCode;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0e0e1a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isSingleUser
              ? "User Location"
              : `User Locations${isSubscribed ? " · Paid" : isSubscribed === false ? " · Free" : ""}`}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {isSingleUser && !locationAvailable ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <MapPin className="h-8 w-8 opacity-40" />
              <p className="text-sm">Location not available</p>
            </div>
          ) : loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          ) : (
            <>
              {isSingleUser && singleCountryCode && (
                <p className="mb-3 text-sm text-muted-foreground">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  {[singleCity, singleCountry].filter(Boolean).join(", ") || singleCountryCode}
                </p>
              )}
              <div className="relative overflow-hidden rounded-xl bg-[#090912]">
                <ComposableMap
                  projectionConfig={{ scale: 140 }}
                  style={{ width: "100%", height: "420px" }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const code = (geo.properties?.iso_a2 ?? "") as string;
                        const entry = countByCode[code];
                        let fill: string;
                        if (isSingleUser) {
                          fill =
                            code === singleCountryCode
                              ? "#7c3aed"
                              : "#1e1e2e";
                        } else {
                          fill = entry
                            ? interpolateColor(entry.count, max)
                            : "#1e1e2e";
                        }
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fill}
                            stroke="#2a2a40"
                            strokeWidth={0.5}
                            style={
                              {
                                default: { outline: "none" },
                                hover: { outline: "none", opacity: 0.85 },
                                pressed: { outline: "none" },
                              } as any
                            }
                            onMouseEnter={() => {
                              if (!isSingleUser && entry) {
                                setTooltip({ name: entry.country, count: entry.count });
                              }
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {isSingleUser && singleCountryCode === "US" && (
                    <Marker coordinates={[-95, 38]}>
                      <circle r={5} fill="#7c3aed" stroke="#fff" strokeWidth={1.5} />
                    </Marker>
                  )}
                </ComposableMap>
                {tooltip && (
                  <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/80 px-3 py-1.5 text-xs text-white backdrop-blur">
                    {tooltip.name} · {tooltip.count} user{tooltip.count !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {!isSingleUser && locations.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">0</span>
                    <div
                      className="h-2 flex-1 rounded-full"
                      style={{
                        background:
                          "linear-gradient(to right, #1e1e2e, #7c3aed)",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{max}</span>
                  </div>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    Users per country
                  </p>
                </div>
              )}

              {!isSingleUser && locations.length === 0 && !loading && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No location data available.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
