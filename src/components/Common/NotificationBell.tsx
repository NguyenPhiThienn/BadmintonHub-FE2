import React, { useEffect, useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '@/hooks/useNotification';
import { Icon } from '@mdi/react';
import { mdiBellOutline, mdiCheckAll, mdiBell, mdiBellRing, mdiClockOutline, mdiInformationOutline } from '@mdi/js';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export function NotificationBell() {
  const router = useRouter();
  const { data, isLoading } = useNotifications({ page: 1, limit: 20 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  // Track previous unread count to detect new notifications via polling
  const prevUnreadCount = useRef<number | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const isFirstLoad = useRef(true);

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  useEffect(() => {
    if (data === undefined) return; // still loading

    if (isFirstLoad.current) {
      // On first load, just save the current count without showing toast
      prevUnreadCount.current = unreadCount;
      isFirstLoad.current = false;
      return;
    }

    // If unread count increased since last poll, show toast for each new notification
    if (prevUnreadCount.current !== null && unreadCount > prevUnreadCount.current) {
      const newCount = unreadCount - prevUnreadCount.current;
      // Find the newest unread notifications to display in toast
      const newNotifs = notifications.filter((n: any) => !n.isRead).slice(0, newCount);
      
      newNotifs.forEach((notif: any) => {
        toast(
          <div className="flex gap-4 items-start">
            <div className="mt-0.5 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 text-accent shadow-[0_0_15px_rgba(0,255,136,0.2)]">
               <Icon path={mdiBellRing} size={0.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] text-white leading-snug mb-1 truncate">{notif.title}</p>
              <p className="text-[13px] text-neutral-300 line-clamp-2 leading-relaxed">{notif.body}</p>
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: {
              background: 'rgba(18, 18, 18, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              color: '#fff',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)',
              padding: '16px',
              maxWidth: '420px',
              width: '100%'
            },
            // @ts-ignore
            progressStyle: { background: 'hsl(var(--accent))' },
            closeButton: false, // hide the default X button to make it cleaner
          }
        );
      });
    }

    prevUnreadCount.current = unreadCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount, data]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    
    // Check if there is a bookingId to navigate to
    if (notification.data?.bookingId) {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/owner')) {
        router.push(`/owner/bookings?bookingId=${notification.data.bookingId}`);
      } else if (currentPath.includes('/admin')) {
        router.push(`/admin/bookings?bookingId=${notification.data.bookingId}`);
      } else {
        // Khách hàng
        router.push(`/booking/success?bookingId=${notification.data.bookingId}`);
      }
    } else {
      // Nếu không có link cụ thể, hiển thị chi tiết thông báo
      setSelectedNotification(notification);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead.mutate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-10 h-10 rounded-full bg-darkBorderV1/40 hover:bg-darkBorderV1/70 flex items-center justify-center transition-colors">
          <Icon path={mdiBellOutline} size={0.9} className="text-neutral-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 ring-2 ring-darkCardV1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 bg-darkCardV1 border-darkBorderV1 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-darkBorderV1/50">
          <h3 className="font-semibold text-neutral-200">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs text-accent hover:text-accent/80 hover:bg-accent/10 px-2"
            >
              <Icon path={mdiCheckAll} size={0.7} className="mr-1" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-neutral-500">Đang tải...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500 flex flex-col items-center justify-center">
              <Icon path={mdiBellOutline} size={2} className="text-neutral-600 mb-2 opacity-50" />
              <p>Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif: any) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "relative py-3.5 px-4 border-b border-darkBorderV1/30 cursor-pointer transition-all hover:bg-darkBorderV1/20 flex gap-3 items-start group",
                    !notif.isRead ? "bg-accent/5 hover:bg-accent/10" : ""
                  )}
                >
                  <div className="flex-1 space-y-1.5 pr-4">
                    <p className={cn(
                      "text-[14.5px] font-semibold leading-snug",
                      !notif.isRead ? "text-white" : "text-neutral-400"
                    )}>
                      {notif.title}
                    </p>
                    <p className={cn(
                      "text-[13px] line-clamp-2 leading-relaxed",
                      !notif.isRead ? "text-neutral-300" : "text-neutral-500"
                    )}>
                      {notif.body}
                    </p>
                    <div className={cn(
                      "flex items-center gap-1.5 mt-2",
                      !notif.isRead ? "text-accent/90" : "text-neutral-600"
                    )}>
                      <Icon path={mdiClockOutline} size={0.55} />
                      <p className="text-[11px] font-medium tracking-wide">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Unread indicator on the RIGHT side */}
                  {!notif.isRead && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-darkBorderV1/50">
          <Button variant="ghost" className="w-full text-xs text-neutral-400 hover:text-neutral-300 h-8">
            Xem tất cả thông báo
          </Button>
        </div>
      </PopoverContent>

      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent size="small" className="!max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Icon path={mdiInformationOutline} size={0.8} />
              </div>
              {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-darkBackgroundV1/50 rounded-lg mt-2 border border-darkBorderV1/50">
            <p className="text-[14.5px] text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {selectedNotification?.body}
            </p>
            {selectedNotification?.createdAt && (
              <div className="flex items-center gap-1.5 mt-4 text-neutral-500">
                <Icon path={mdiClockOutline} size={0.6} />
                <p className="text-[12px]">
                  {formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true, locale: vi })}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Popover>
  );
}
