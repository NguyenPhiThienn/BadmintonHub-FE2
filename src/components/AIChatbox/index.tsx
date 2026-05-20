'use client';

import { sendPost } from '@/api/axios';
import dynamic from 'next/dynamic';

import { Icon } from '@/components/ui/mdi-icon';
import { mdiRobotOutline } from '@mdi/js';

// Tải động ChatBotWidget để tránh lỗi Server-Side Rendering (SSR) trong Next.js App Router
const ChatBotWidget = dynamic(
  () => import('chatbot-widget-ui').then((mod) => mod.ChatBotWidget),
  { ssr: false }
);

interface IMessage {
  role: string;
  content: string;
}

import { useChatStore } from '@/store/useChatStore';

export default function AIChatbox() {
  const { messages, addMessage } = useChatStore();

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

  const handleNewMessage = (newMsg: { role: string, content: string }) => {
    addMessage(newMsg);
  };

  const handleBotResponse = (reply: string) => {
    addMessage({ role: 'assistant', content: reply });
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
        /* Fix icon alignment inside avatar */
        .chatbox .chat span {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .chatbox .chat span svg {
          margin: 0 !important;
        }
        /* Resize toggle button */
        .chatbot-toggler {
          width: 44px !important;
          height: 44px !important;
        }
      `}} />
      <ChatBotWidget
        callApi={handleCallApi}
        chatbotName="BadmintonHub Assistant"
        primaryColor="#41C651"
        botIcon={<div className="flex items-center justify-center w-full h-full text-white"><Icon path={mdiRobotOutline} size={1} /></div>}
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


