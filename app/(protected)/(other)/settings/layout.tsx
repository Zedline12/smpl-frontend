import { SettingsNav } from "./_components/SettingsNav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-8 pb-6 border-b border-white/[0.06]">
        <h1 className="text-xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Settings sidebar */}
        <aside
          className="w-52 flex-shrink-0 border-r border-white/[0.06] p-3"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <SettingsNav />
        </aside>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
