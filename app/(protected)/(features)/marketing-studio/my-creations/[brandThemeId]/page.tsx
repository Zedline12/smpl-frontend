"use client";

import { useParams } from "next/navigation";
import { ThemeCreationsWorkspace } from "@/features/marketing-studio/components/ThemeCreationsWorkspace";

export default function ThemeCreationsPage() {
  const { brandThemeId } = useParams<{ brandThemeId: string }>();
  return <ThemeCreationsWorkspace brandThemeId={brandThemeId} />;
}
