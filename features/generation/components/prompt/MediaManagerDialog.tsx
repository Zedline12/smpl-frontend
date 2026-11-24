"use client";

import dynamic from "next/dynamic";
import { useState, type ComponentProps } from "react";
import type { MediaManagerDialog as Impl } from "./MediaManagerDialog.impl";

/** Loaded on first open: it's large (uploads, editors, library tabs) and many pages only maybe open it. */
const LazyDialog = dynamic(() => import("./MediaManagerDialog.impl").then((m) => m.MediaManagerDialog), {
  ssr: false,
});

/**
 * The upload / library picker. Its code downloads the first time it opens; after that
 * it stays mounted, so an upload started in it keeps going while it's closed.
 */
export function MediaManagerDialog(props: ComponentProps<typeof Impl>) {
  const [everOpened, setEverOpened] = useState(props.open);
  if (props.open && !everOpened) setEverOpened(true);
  if (!everOpened) return null;
  return <LazyDialog {...props} />;
}
