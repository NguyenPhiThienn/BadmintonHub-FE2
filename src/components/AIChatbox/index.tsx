'use client';

import { sendPost } from '@/api/axios';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Tải động ChatBotWidget để tránh lỗi Server-Side Rendering (SSR) trong Next.js App Router
const ChatBotWidget = dynamic(
  () => import('chatbot-widget-ui').then((mod) => mod.ChatBotWidget),
  { ssr: false }
);

interface IMessage {
  role: string;
  content: string;
}

// Hàm format Markdown đơn giản (chuyển đổi **text** thành <strong>text</strong> và bảo toàn xuống dòng)
const formatMarkdown = (text: string) => {
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

export default function AIChatbox() {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      role: 'assistant',
      content: formatMarkdown('Xin chào! Tôi là trợ lý ảo BadmintonHub. Tôi có thể giúp gì cho bạn hôm nay? 🏸'),
    },
  ]);

  const handleCallApi = async (message: string) => {
    try {
      const response = await sendPost('/ai/chat', { message });

      const reply =
        response?.data?.data?.reply ||
        response?.data?.reply ||
        response?.reply ||
        (typeof response?.data === 'string' ? response.data : null) ||
        (typeof response === 'string' ? response : null) ||
        'Xin lỗi bạn, tôi không thể phản hồi lúc này.';

      console.log('AIChatbox extracted reply:', reply);
      return reply;
    } catch (error) {
      console.error('AIChatbox Error calling API:', error);
      return 'Xin lỗi, đã xảy ra lỗi kết nối với hệ thống AI.';
    }
  };

  const handleNewMessage = (newMsg: IMessage) => {
    setMessages((prev) => [...prev, { ...newMsg, content: formatMarkdown(newMsg.content) }]);
  };

  const handleBotResponse = (reply: string) => {
    setMessages((prev) => [...prev, { role: 'assistant', content: formatMarkdown(reply) }]);
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-[9999]">
      <style dangerouslySetInnerHTML={{
        __html: `
        .chatbot header h2 {
          font-size: 1.1rem !important;
        }
        .chat-input textarea {
          font-size: 0.85rem !important;
        }
        .chat-input textarea::placeholder {
          font-size: 0.8rem !important;
        }
        .chatbox .chat p {
          white-space: pre-wrap !important;
        }
        .chatbox .chat p strong {
          font-weight: 700 !important;
        }
      `}} />
      <ChatBotWidget
        callApi={handleCallApi}
        chatbotName="BadmintonHub Assistant"
        primaryColor="#41C651"
        inputMsgPlaceholder="Chúng tôi sẽ trả lời ngay lập tức..."
        isTypingMessage="AI đang soạn câu trả lời..."
        IncommingErrMsg="Lỗi kết nối AI. Vui lòng thử lại!"
        messages={messages}
        handleNewMessage={handleNewMessage}
        onBotResponse={handleBotResponse}
        useInnerHTML={true}
      />
    </div>
  );
}


