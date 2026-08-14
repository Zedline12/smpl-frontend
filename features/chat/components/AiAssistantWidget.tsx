"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useChatStore } from "@/stores/useChatStore";
import { useComposerOffset } from "../hooks/use-composer-offset";
import { ChatFab } from "./ChatFab";

// Client-only: keeps react-markdown and date formatting out of the server
// bundle and off every protected page's critical path.
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

export default function AiAssistantWidget() {
  const isOpen = useChatStore((state) => state.isOpen);
  const toggle = useChatStore((state) => state.toggle);
  const bottomOffset = useComposerOffset();

  // Only pay for the panel chunk once the user actually opens it.
  const [hasOpened, setHasOpened] = useState(false);
  useEffect(() => {
    if (isOpen) setHasOpened(true);
  }, [isOpen]);

  return (
    <>
      <ChatFab isOpen={isOpen} onClick={toggle} bottomOffset={bottomOffset} />
      {hasOpened && <ChatPanel />}
    </>
  );
}
