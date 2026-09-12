"use client";

import { useState } from "react";

const MCP_URL = "https://smpl-backend.onrender.com/api/v1/mcp";

export default function McpButton() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(MCP_URL);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button onClick={copyToClipboard}>
      {copied ? "Copied!" : "Copy MCP URL"}
    </button>
  );
}
