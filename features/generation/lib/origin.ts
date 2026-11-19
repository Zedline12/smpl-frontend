import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";

/** What a generation was remade from (Recreate on a template or an earlier result). */
export type RecreatedFrom = {
  kind: "template" | "generation";
  id: string;
  /** Only counts for a generation with this model. */
  model: string;
};

/** Where in the app a generation was started; analytics only. */
export type GenerationOrigin = {
  surface?: string;
  device?: "desktop" | "mobile" | "tablet";
  recreatedFrom?: { kind: RecreatedFrom["kind"]; id: string };
};

const OBJECT_ID = /^[a-f0-9]{24}$/i;

function device(): GenerationOrigin["device"] {
  if (window.matchMedia("(max-width: 639px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet";
  return "desktop";
}

/** This page, the device, and what Recreate loaded (when it's for this model). */
export function clientOrigin(model: string): GenerationOrigin | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const recreated = useAiGenerationControlStore.getState().recreatedFrom;
    return {
      surface: window.location.pathname.slice(0, 100),
      device: device(),
      ...(recreated && recreated.model === model && OBJECT_ID.test(recreated.id)
        ? { recreatedFrom: { kind: recreated.kind, id: recreated.id } }
        : {}),
    };
  } catch {
    return undefined;
  }
}

/** After a generation starts, later ones aren't remakes any more. */
export function clearRecreatedFrom() {
  useAiGenerationControlStore.getState().setRecreatedFrom(null);
}
