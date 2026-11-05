import McpButton from "./_components/McpButton";
import McpConnections from "./_components/McpConnections";
import { SettingsHeader } from "../_components/SettingsUi";

export default function McpPage() {
  return (
    <div className="flex flex-col gap-5">
      <SettingsHeader title="MCP" subtitle="Connect SMPL to your AI tools" />
      <McpButton />
      <McpConnections />
    </div>
  );
}
