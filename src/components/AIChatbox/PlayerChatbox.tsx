'use client';

import dynamic from 'next/dynamic';

// Load động để tránh SSR
const AIChatbox = dynamic(() => import('@/components/AIChatbox'), { ssr: false });

/**
 * Render AIChatbox cho tất cả người dùng.
 * Backend đã có logic Role-Based Context (Admin/Owner/Player) nên chatbox có thể hiển thị ở mọi nơi.
 */
export default function PlayerChatbox() {
  return <AIChatbox />;
}
