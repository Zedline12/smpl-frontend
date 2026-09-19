import McpButton from "./_components/McpButton";
import McpConnections from "./_components/McpConnections";

export default function McpPage() {
  return (
    <div className="max-w-lg flex flex-col gap-6">
      <McpButton />
      <McpConnections />
    </div>
  );
}
