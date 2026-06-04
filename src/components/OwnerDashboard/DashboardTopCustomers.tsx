"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@mdi/react";
import { mdiCrown, mdiAlertOctagon } from "@mdi/js";

export const DashboardTopCustomers = ({ topVIPs = [], topRisks = [] }: { topVIPs: any[], topRisks: any[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Khách VIP */}
      <Card className="bg-darkCardV1/40 border-darkBorderV1 h-full flex flex-col">
        <CardHeader className="border-b border-darkBorderV1/50 pb-3 bg-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
              <Icon path={mdiCrown} size={0.7} />
            </div>
            <CardTitle className="text-[16px] font-semibold text-yellow-500">Khách VIP (Chi tiêu cao)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          {topVIPs.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-sm">Chưa có dữ liệu.</div>
          ) : (
            <div className="flex flex-col">
              {topVIPs.map((customer: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 border-b border-darkBorderV1/30 last:border-0 hover:bg-darkBorderV1/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-neutral-500 w-4">{idx + 1}.</span>
                    <div>
                      <p className="font-semibold text-[14px] text-white">{customer.name || "Khách hàng"}</p>
                      <p className="text-[12px] text-neutral-400">{customer.phone || "Không có SĐT"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[14px] text-accent">{customer.totalSpent?.toLocaleString() || 0} đ</p>
                    <p className="text-[11px] text-neutral-500">{customer.totalBookings || 0} đơn</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Khách rủi ro */}
      <Card className="bg-darkCardV1/40 border-darkBorderV1 h-full flex flex-col">
        <CardHeader className="border-b border-darkBorderV1/50 pb-3 bg-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
              <Icon path={mdiAlertOctagon} size={0.7} />
            </div>
            <CardTitle className="text-[16px] font-semibold text-red-500">Báo động (Bom/Hủy sân)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          {topRisks.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-sm">Tuyệt vời! Không có khách hàng xấu.</div>
          ) : (
            <div className="flex flex-col">
              {topRisks.map((customer: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 border-b border-darkBorderV1/30 last:border-0 hover:bg-darkBorderV1/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-neutral-500 w-4">{idx + 1}.</span>
                    <div>
                      <p className="font-semibold text-[14px] text-white">{customer.name || "Khách hàng"}</p>
                      <p className="text-[12px] text-neutral-400">{customer.phone || "Không có SĐT"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[14px] text-red-500">{customer.totalViolations || 0} lần vi phạm</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
