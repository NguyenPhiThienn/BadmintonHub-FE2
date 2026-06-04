'use client';

import { sendGet } from '@/api/axios';
import { useEffect, useRef, useState } from 'react';

interface ChatSession {
  sessionId: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

interface Props {
  isOpen: boolean;
  activeSessionId: string;
  isLoggedIn: boolean;
  isChatOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewConversation: () => void;
  refreshTrigger?: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function ChatHistoryPanel({
  isOpen,
  activeSessionId,
  isLoggedIn,
  isChatOpen,
  onClose,
  onSelectSession,
  onNewConversation,
  refreshTrigger = 0,
}: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchSessions();
    }
  }, [isOpen, refreshTrigger, isLoggedIn]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const res = await sendGet('/ai/chat/sessions?limit=30&page=1');
      setSessions(res?.data?.sessions || res?.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="chat-history-panel"
      style={{
        position: 'fixed',
        bottom: isChatOpen ? '86px' : '98px', 
        right: isChatOpen ? '430px' : '104px', 
        width: '270px',
        maxHeight: '500px',
        background: 'linear-gradient(160deg, #1a1f35 0%, #141929 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideInLeft 0.2s ease-out',
        zIndex: 10000,
      }}
    >
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(10px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        .hist-session-btn {
          width: 100%;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          margin-bottom: 2px;
          display: block;
          border-left: 3px solid transparent;
          transition: all 0.15s ease;
        }
        .hist-session-btn:hover { background: rgba(255,255,255,0.05); }
        .hist-session-btn.active { 
          background: rgba(255,255,255,0.1);
          border-left-color: #f8fafc;
        }
        .hist-new-btn:hover { background: rgba(255,255,255,0.12) !important; transform: translateY(-1px); }
        .hist-scroll::-webkit-scrollbar { width: 4px; }
        .hist-scroll::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.15); 
          border-radius: 4px; 
        }
        /* Mobile responsive */
        @media (max-width: 991px) {
          .chat-history-panel { right: 380px !important; bottom: 60px !important; }
        }
        @media (max-width: 767px) {
          .chat-history-panel {
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
          🕐 Lịch sử trò chuyện
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#94a3b8',
          cursor: 'pointer', fontSize: '14px', padding: '2px 4px', borderRadius: 4,
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
        onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
        >✕</button>
      </div>

      {/* Nút tạo mới */}
      <div style={{ padding: '8px 10px 4px', flexShrink: 0 }}>
        <button className="hist-new-btn" onClick={onNewConversation} style={{
          width: '100%', padding: '7px 10px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px', color: '#e2e8f0',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.15s ease',
        }}>
          <span>✏️</span> Cuộc trò chuyện mới
        </button>
      </div>

      {/* List */}
      <div className="hist-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 10px' }}>
        {!isLoggedIn ? (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: 6 }}>🔐</div>
            <p style={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.5 }}>
              Đăng nhập để xem<br />lịch sử trò chuyện
            </p>
          </div>
        ) : isLoading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
            Đang tải...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: 6 }}>💬</div>
            <p style={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.5 }}>
              Chưa có cuộc trò chuyện
            </p>
          </div>
        ) : (
          <>
            <p style={{
              color: '#64748b', fontSize: '10px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.7px',
              padding: '6px 8px 3px',
            }}>Gần đây</p>
            {sessions.map((s) => (
              <button
                key={s.sessionId}
                className={`hist-session-btn ${s.sessionId === activeSessionId ? 'active' : ''}`}
                onClick={() => { onSelectSession(s.sessionId); onClose(); }}
              >
                <div style={{
                  color: s.sessionId === activeSessionId ? '#ffffff' : '#cbd5e1',
                  fontSize: '12px', fontWeight: 500, marginBottom: 3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {s.title || 'Cuộc trò chuyện'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '10px' }}>
                    {timeAgo(s.updatedAt)}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '10px' }}>
                    {s.messageCount} tin
                  </span>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
