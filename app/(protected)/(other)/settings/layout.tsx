import { SettingsNav } from "./_components/SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-8 pb-6 border-b border-white/[0.06]">
        <h1 className="text-foreground text-xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Manage your account and preferences
        </p>
      </div>

      {/* Column on md+, the nav collapsing to a scrollable strip below it. */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        <aside
          className="custom-scrollbar flex-shrink-0 overflow-x-auto border-b border-white/[0.06] p-3 md:w-52 md:overflow-x-visible md:border-r md:border-b-0"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <SettingsNav />
        </aside>

        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
