import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IMessage {
  role: string;
  content: string;
}

export const formatMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
};

const INITIAL_MESSAGES: IMessage[] = [
  {
    role: 'assistant',
    content: formatMarkdown('Xin chào! Tôi là trợ lý ảo BadmintonHub. Tôi có thể giúp gì cho bạn hôm nay? 🏸'),
  },
];

interface ChatState {
  messages: IMessage[];
  addMessage: (msg: IMessage) => void;
  resetMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: INITIAL_MESSAGES,
      addMessage: (msg) => set((state) => ({
        messages: [...state.messages, { ...msg, content: formatMarkdown(msg.content) }],
      })),
      resetMessages: () => set({ messages: INITIAL_MESSAGES }),
    }),
    {
      name: 'chatbot-storage', // name of the item in the storage (must be unique)
    }
  )
);
