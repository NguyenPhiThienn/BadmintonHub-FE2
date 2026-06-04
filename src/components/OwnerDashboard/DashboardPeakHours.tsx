"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@mdi/react";
import { mdiClockOutline } from "@mdi/js";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#41C651", "#FFBB28", "#FF8042", "#0088FE"];

export const DashboardPeakHours = ({ data = [] }: { data: any[] }) => {
  // data format expected: [{ name: "Sáng (06:00 - 12:00)", value: 30 }, ...]
  
  return (
    <Card className="bg-darkCardV1/40 border-darkBorderV1 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-neutral-800 pb-4 bg-transparent">
        <Icon path={mdiClockOutline} size={0.8} className="text-accent" />
        <CardTitle className="text-lg font-semibold text-accent bg-transparent">Tỷ lệ lấp đầy theo khung giờ</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center pt-4">
        {data.length === 0 || data.every(d => !d.value) ? (
          <div className="text-center text-neutral-500 text-sm">Chưa có đủ dữ liệu đặt sân.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#0A1F22", border: "1px solid #1A2F32", borderRadius: "12px", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
                formatter={(value: number) => [`${value}%`, "Lấp đầy"]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
