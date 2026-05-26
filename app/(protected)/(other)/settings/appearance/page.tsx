import { ThemeToggle } from "./_components/ThemeToggle";

export default function AppearancePage() {
  return (
    <div className="max-w-lg flex flex-col gap-6">
      <div>
        <h2 className="text-foreground font-semibold text-base leading-tight">Appearance</h2>
        <p className="text-sm mt-1 text-muted-foreground">
          Choose how the interface looks for you.
        </p>
      </div>

      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Theme
        </p>
        <ThemeToggle />
      </div>
    </div>
  );
}
