"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateBrandThemeMutation,
  useCreateManualBrandThemeMutation,
} from "../hooks/use-brand-themes";
import { CreateBrandThemeForm } from "./CreateBrandThemeForm";
import { CreateManualBrandThemeForm } from "./CreateManualBrandThemeForm";

const LIST_HREF = "/marketing-studio/brand-themes";

export function CreateBrandThemeWorkspace() {
  const router = useRouter();
  const createTheme = useCreateBrandThemeMutation();
  const createManualTheme = useCreateManualBrandThemeMutation();

  const goToList = () => router.push(LIST_HREF);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-5 md:p-8">
      <div>
        <Link
          href={LIST_HREF}
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Brand Themes
        </Link>
        <header>
          <h1 className="text-foreground text-2xl font-bold">
            Create a brand theme
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pull a brand&apos;s colours, fonts and logo from its website, or set
            them yourself.
          </p>
        </header>
      </div>

      <Tabs defaultValue="website">
        <TabsList className="bg-background-light h-10 gap-1 rounded-xl p-1">
          <TabsTrigger
            value="website"
            className="cursor-pointer rounded-lg text-xs sm:text-sm data-[state=active]:shadow-none"
          >
            From website
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className="cursor-pointer rounded-lg text-xs sm:text-sm data-[state=active]:shadow-none"
          >
            Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="mt-3">
          <CreateBrandThemeForm
            onSubmit={(values) =>
              createTheme.mutate(values, { onSuccess: goToList })
            }
            isSubmitting={createTheme.isPending}
          />
        </TabsContent>

        <TabsContent value="manual" className="mt-3">
          <CreateManualBrandThemeForm
            onSubmit={(values) =>
              createManualTheme.mutate(values, { onSuccess: goToList })
            }
            isSubmitting={createManualTheme.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
