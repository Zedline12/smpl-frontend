import { LeftPanel } from "./_components/LeftPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-black flex">
      {/* Left panel — hidden on mobile, 70% on desktop */}
      <div className="hidden md:flex md:flex-[8] min-w-0">
        <LeftPanel />
      </div>

      {/* Right panel — full width on mobile, 30% on desktop */}
      <div
        className="flex-1 md:flex-[2] flex flex-col items-center justify-center overflow-y-auto md:border-l md:border-white/[0.08]"
        style={{
          background: "#080808",
          padding: "48px 24px",
        }}
      >
        <div
          className="w-full max-w-[340px]"
          style={{ animation: "fadeUp 0.6s ease-out 0.1s both" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
