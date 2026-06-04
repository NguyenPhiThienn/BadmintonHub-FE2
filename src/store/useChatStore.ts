'use client';

import { create } from 'zustand';

export interface IMessage {
  role: 'user' | 'assistant';
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

// Tạo sessionId mới (UUID v4 đơn giản)
const generateSessionId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();
  const stored = localStorage.getItem('chat-session-id');
  if (stored) return stored;
  const newId = generateSessionId();
  localStorage.setItem('chat-session-id', newId);
  return newId;
};

export const getWelcomeMessage = (role?: string): IMessage => {
  if (role === 'ADMIN') {
    return {
      role: 'assistant',
      content: formatMarkdown('Xin chào Quản trị viên! 👑\nTôi là trợ lý AI BadmintonHub.\nTôi có thể giúp bạn tóm tắt số liệu hệ thống, kiểm tra yêu cầu duyệt sân và các tác vụ quản lý.\nBạn cần báo cáo gì hôm nay?'),
    };
  }
  if (role === 'OWNER') {
    return {
      role: 'assistant',
      content: formatMarkdown('Xin chào Chủ sân! 🏟️\nTôi là trợ lý AI BadmintonHub.\nTôi có thể giúp bạn xem danh sách sân đang quản lý, các đơn đặt sân gần đây và tình hình kinh doanh.\nBạn cần tôi hỗ trợ gì?'),
    };
  }
  return {
    role: 'assistant',
    content: formatMarkdown('Xin chào! Tôi là trợ lý ảo BadmintonHub 🏸\nTôi có thể giúp bạn tìm sân, hỏi giá, xem lịch đặt và giải đáp thắc mắc về cầu lông.\nBạn cần hỗ trợ gì hôm nay?'),
  };
};

const INITIAL_MESSAGES: IMessage[] = [getWelcomeMessage()];

interface ChatState {
  messages: IMessage[];
  sessionId: string;
  isLoadingHistory: boolean;
  addMessage: (msg: IMessage) => void;
  setMessages: (msgs: IMessage[]) => void;
  resetSession: (role?: string) => void;
  initSessionId: () => string;
  setLoadingHistory: (v: boolean) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: INITIAL_MESSAGES,
  sessionId: '',
  isLoadingHistory: false,

  initSessionId: () => {
    const sid = getOrCreateSessionId();
    set({ sessionId: sid });
    return sid;
  },

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, content: formatMarkdown(msg.content) },
      ],
    })),

  setMessages: (msgs) => set({ messages: msgs }),

  setLoadingHistory: (v) => set({ isLoadingHistory: v }),

  resetSession: (role?: string) => {
    const newId = generateSessionId();
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-session-id', newId);
    }
    set({
      sessionId: newId,
      messages: [getWelcomeMessage(role)],
      isLoadingHistory: false,
    });
  },
}));
