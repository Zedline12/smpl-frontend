import { LeftPanel } from "./_components/LeftPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-black flex">
      <LeftPanel />

      <div
        className="flex-shrink-0 flex flex-col items-center justify-center overflow-y-auto"
        style={{
          width: 440,
          background: "#080808",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          padding: "48px 44px",
        }}
      >
        <div
          className="w-full"
          style={{ maxWidth: 340, animation: "fadeUp 0.6s ease-out 0.1s both" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
