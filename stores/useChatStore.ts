import { create } from "zustand";

type ChatState = {
  isOpen: boolean;
  /** `null` shows the conversation list, otherwise the thread for that id. */
  activeConversationId: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setActiveConversationId: (id: string | null) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  activeConversationId: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));
