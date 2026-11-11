import { GenerationTimesManager } from "@/features/admin/generation-times/GenerationTimesManager";

export default function GenerationTimesPage() {
  return (
    <div className="p-6">
      <h1 className="text-primary-foreground mb-2 text-3xl font-bold">Generation times</h1>
      <p className="mb-8 max-w-2xl text-sm text-white/50">
        How long each model takes, for the progress bars users see. Set a base per model and settings; it adjusts
        automatically as real jobs finish.
      </p>
      <GenerationTimesManager />
    </div>
  );
}
