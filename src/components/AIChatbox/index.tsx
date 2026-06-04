'use client';

import { sendGet, sendPost } from '@/api/axios';
import { useUser } from '@/context/useUserContext';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '@/components/ui/mdi-icon';
import { mdiHistory, mdiPencilOutline, mdiRobotOutline } from '@mdi/js';
import { IconSparkles } from '@tabler/icons-react';

import { formatMarkdown, getWelcomeMessage, useChatStore } from '@/store/useChatStore';
import { ChatHistoryPanel } from './ChatHistoryPanel';

const ChatBotWidget = dynamic(
  () => import('chatbot-widget-ui').then((mod) => mod.ChatBotWidget),
  { ssr: false }
);

export default function AIChatbox() {
  const {
    messages, addMessage, setMessages,
    sessionId, initSessionId, resetSession,
    isLoadingHistory, setLoadingHistory,
  } = useChatStore();

  const { user, isAuthenticated } = useUser();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  
  // Portal node for header buttons
  const [headerNode, setHeaderNode] = useState<HTMLElement | null>(null);

  // ── Init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const sid = initSessionId();
    loadHistory(sid);
  }, []);

  // Detect chatbot mở/đóng qua MutationObserver trên body
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check trạng thái khởi tạo ban đầu
    setIsChatOpen(document.body.classList.contains('show-chatbot'));

    const obs = new MutationObserver(() => {
      const open = document.body.classList.contains('show-chatbot');
      setIsChatOpen(open);
      if (!open) setIsHistoryOpen(false); // đóng history khi chatbot đóng
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Tìm header của chatbot để inject nút vào
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setInterval(() => {
      const node = document.querySelector('.chatbot header');
      if (node) {
        setHeaderNode(node as HTMLElement);
        // Style lại header để có chỗ chứa nút
        (node as HTMLElement).style.position = 'relative';
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // ── Load history của 1 session ────────────────────────────────────
  const loadHistory = async (sid: string) => {
    if (!sid) return;
    try {
      setLoadingHistory(true);
      const res = await sendGet(`/ai/chat/history?sessionId=${sid}`);
      const msgs: { role: string; content: string }[] = res?.data?.messages || res?.messages || [];
      if (msgs.length > 0) {
        setMessages(msgs.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: formatMarkdown(m.content),
        })));
      } else {
        setMessages([getWelcomeMessage(user?.role)]);
      }
    } catch { 
      setMessages([getWelcomeMessage(user?.role)]);
    }
    finally { setLoadingHistory(false); }
  };

  // ── Chọn session từ panel → load + mở chatbot ────────────────────
  const handleSelectSession = async (sid: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('chat-session-id', sid);
    useChatStore.setState({ sessionId: sid });
    await loadHistory(sid);

    // Auto-mở chatbot nếu đang đóng
    if (!document.body.classList.contains('show-chatbot')) {
      const toggler = document.querySelector('.chatbot-toggler') as HTMLElement;
      toggler?.click();
    }
  };

  // ── Tạo cuộc trò chuyện mới ───────────────────────────────────────
  const handleNewConversation = async () => {
    if (sessionId) {
      try { await sendPost('/ai/chat/end', { sessionId }); } catch { /* ignore */ }
    }
    resetSession(user?.role);
    setIsHistoryOpen(false);
    setHistoryRefresh(n => n + 1);
  };

  // ── API chat ──────────────────────────────────────────────────────
  const handleCallApi = async (message: string) => {
    try {
      const res = await sendPost('/ai/chat', { message, sessionId: sessionId || undefined });
      const reply =
        res?.data?.data?.reply || res?.data?.reply || res?.reply ||
        (typeof res?.data === 'string' ? res.data : null) ||
        'Xin lỗi bạn, tôi không thể phản hồi lúc này.';
      const retSid = res?.data?.data?.sessionId;
      if (retSid && retSid !== sessionId && typeof window !== 'undefined') {
        localStorage.setItem('chat-session-id', retSid);
      }
      return reply;
    } catch {
      return 'Xin lỗi, đã xảy ra lỗi kết nối với hệ thống AI.';
    }
  };

  const handleNewMessage = (msg: { role: string; content: string }) => addMessage(msg as any);
  const handleBotResponse = (reply: string) => addMessage({ role: 'assistant', content: reply });

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. TOÀN BỘ KHUNG CHAT */
        .chatbot {
          border-radius: 20px !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05) !important;
          overflow: hidden !important;
          z-index: 9999 !important;
        }

        /* 2. HEADER SANG TRỌNG (DARK THEME) */
        .chatbot header {
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%) !important;
          text-align: left !important;
          padding-left: 18px !important;
          padding-right: 140px !important;
          display: flex !important;
          align-items: center !important;
          height: 60px !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        .chatbot header h2 { 
          font-size: 0.95rem !important; 
          margin: 0 !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 600 !important;
          color: #f8fafc !important;
          background: none !important;
          -webkit-text-fill-color: initial !important;
          max-width: 150px;
        }

        /* 3. BODY TIN NHẮN (HOA VĂN DOT MATRIX) */
        .chatbot .chatbox {
          background-color: #f8fafc !important; 
          background-image: radial-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px) !important;
          background-size: 20px 20px !important;
          padding: 24px 16px 110px !important;
        }

        /* 4. TIN NHẮN BOT (INCOMING) */
        .chatbox .incoming p {
          background: #ffffff !important;
          color: #1e293b !important;
          border-radius: 4px 18px 18px 18px !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02) !important;
          padding: 14px 18px !important;
          font-size: 0.92rem !important;
          line-height: 1.55 !important;
          border: 1px solid rgba(17, 24, 39, 0.3) !important;
          margin-left: 4px !important;
        }
        /* Icon Bot */
        .chatbox .incoming span {
          background: linear-gradient(135deg, #1f2937 0%, #0f172a 100%) !important;
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
          align-self: flex-end !important;
          margin-right: 8px !important;
          margin-bottom: 2px !important;
        }

        /* 5. TIN NHẮN USER (OUTGOING) */
        .chatbox .outgoing p {
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%) !important;
          color: #ffffff !important;
          border-radius: 18px 4px 18px 18px !important;
          box-shadow: 0 4px 15px rgba(17, 24, 39, 0.25) !important;
          padding: 14px 18px !important;
          font-size: 0.92rem !important;
          line-height: 1.55 !important;
          border: 1px solid rgba(17, 24, 39, 0.1) !important;
        }

        /* 6. INPUT AREA VÀ NÚT SEND */
        .chatbot .chat-input {
          background: #ffffff !important;
          border-top: 1px solid rgba(0,0,0,0.06) !important;
          padding: 14px 20px !important;
        }
        .chat-input textarea { 
          font-size: 0.95rem !important; 
          background: #f8fafc !important;
          border-radius: 14px !important;
          padding: 14px 16px !important;
          border: 1px solid rgba(0,0,0,0.06) !important;
          transition: all 0.2s ease !important;
        }
        .chat-input textarea:focus {
          background: #ffffff !important;
          border-color: #111827 !important;
          box-shadow: 0 0 0 3px rgba(17,24,39,0.1) !important;
        }
        .chat-input textarea::placeholder { 
          font-size: 0.88rem !important; 
          color: #94a3b8 !important;
        }
        
        /* Hiển thị Nút Send luôn luôn và có Icon SVG xịn */
        .chat-input span {
          visibility: visible !important;
          opacity: 0.5 !important;
          pointer-events: none !important;
          color: transparent !important; /* Ẩn chữ 'send' mặc định */
          background-color: #f1f5f9 !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23111827'%3E%3Cpath d='M3 20v-6l8-2-8-2V4l19 8z'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          background-size: 20px !important;
          height: 44px !important;
          width: 44px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-self: center !important;
          margin-left: 10px !important;
          transition: all 0.2s !important;
        }
        .chat-input textarea:valid ~ span {
          opacity: 1 !important;
          pointer-events: auto !important;
          background-color: #111827 !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3 20v-6l8-2-8-2V4l19 8z'/%3E%3C/svg%3E") !important;
          box-shadow: 0 4px 12px rgba(17,24,39,0.25) !important;
        }
        .chat-input textarea:valid ~ span:hover {
          transform: scale(1.05) !important;
          background-color: #1f2937 !important;
        }

        /* 7. NÚT TOGGLER (Bật/tắt chat) */
        .chatbot-toggler { 
          width: 54px !important; 
          height: 54px !important; 
          z-index: 9998 !important; 
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4) !important;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        .chatbot-toggler:hover { transform: scale(1.08) !important; }
        
        /* 8. CÁC NÚT TRÊN HEADER (Lịch sử / Mới) */
        .hdr-actions {
          position: absolute;
          top: 50%;
          right: 16px; 
          transform: translateY(-50%);
          display: flex;
          gap: 8px;
          z-index: 1000;
        }
        .hdr-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 11px;
          font-weight: 500;
          padding: 6px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }
        .hdr-btn:hover { 
          background: rgba(255,255,255,0.15); 
          color: #fff;
          transform: translateY(-1px);
        }

        @media (max-width: 992px) {
          .hdr-actions { right: 46px; }
          .chatbot header h2 { max-width: 130px; }
        }

        /* 9. NÚT LỊCH SỬ NỔI (KHI ĐÓNG CHAT) */
        .hist-float {
          position: fixed;
          bottom: 45px;
          right: 104px; 
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(0,0,0,0.1);
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
          z-index: 9997;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .hist-float:hover {
          background: #ffffff;
          border-color: #111827;
          color: #111827;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(17,24,39,0.3);
        }
        @media (max-width: 991px) {
          .hist-float { bottom: 25px; right: 84px; }
        }

        /* TYPOGRAPHY FIXES */
        .chatbox .chat p { white-space: pre-wrap !important; }
        .chatbox .chat p strong { font-weight: 700 !important; }
        .chatbox .chat span { display: flex !important; align-items: center !important; justify-content: center !important; }
        .chatbox .chat span svg { margin: 0 !important; }
      `}} />

      {/* Chat History Panel */}
      <ChatHistoryPanel
        isOpen={isHistoryOpen}
        activeSessionId={sessionId}
        isLoggedIn={isAuthenticated}
        isChatOpen={isChatOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectSession}
        onNewConversation={handleNewConversation}
        refreshTrigger={historyRefresh}
      />

      <ChatBotWidget
        callApi={handleCallApi}
        chatbotName={`Chatbox AI${user ? ` · ${user.fullName?.split(' ').pop()}` : ''}`}
        primaryColor="#3b82f6"
        chatIcon={
          <div className="flex items-center justify-center w-full h-full text-white">
            <IconSparkles size={28} stroke={1.5} />
          </div>
        }
        botIcon={
          <div className="flex items-center justify-center w-full h-full text-white">
            <Icon path={mdiRobotOutline} size={1} />
          </div>
        }
        inputMsgPlaceholder={isLoadingHistory ? 'Đang tải lịch sử...' : 'Hỏi về sân, giá, lịch đặt...'}
        isTypingMessage="AI đang soạn câu trả lời..."
        IncommingErrMsg="Lỗi kết nối AI. Vui lòng thử lại!"
        messages={messages}
        handleNewMessage={handleNewMessage}
        onBotResponse={handleBotResponse}
        useInnerHTML={true}
      />

      {/* Inject Action Buttons vào header của Chatbot */}
      {headerNode && createPortal(
        <div className="hdr-actions">
          <button className="hdr-btn" onClick={() => setIsHistoryOpen(v => !v)} title="Xem lịch sử trò chuyện">
            <Icon path={mdiHistory} size={0.55} />
            Lịch sử
          </button>
          <button className="hdr-btn" onClick={handleNewConversation} title="Bắt đầu cuộc hội thoại mới">
            <Icon path={mdiPencilOutline} size={0.55} />
            Mới
          </button>
        </div>,
        headerNode
      )}

      {/* Nút Lịch sử nổi bên ngoài (khi đóng chat) */}
      {!isChatOpen && isAuthenticated && (
        <button className="hist-float" onClick={() => setIsHistoryOpen(v => !v)} title="Xem lịch sử trò chuyện">
          <Icon path={mdiHistory} size={1} />
        </button>
      )}
    </>
  );
}
