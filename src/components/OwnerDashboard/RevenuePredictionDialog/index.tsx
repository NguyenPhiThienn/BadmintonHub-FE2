"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePredictRevenue } from "@/hooks/useOwner";
import { mdiChartTimelineVariant, mdiFinance, mdiLightbulbOnOutline, mdiLoading, mdiShimmer } from "@mdi/js";
import { Icon } from "@mdi/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RevenuePredictionDialogProps {
    venueId?: string;
}

export const RevenuePredictionDialog = ({ venueId }: RevenuePredictionDialogProps) => {
    const { data: predictionRes, isLoading, refetch, isFetching } = usePredictRevenue({ venueId: venueId === "all" ? undefined : venueId });

    const handlePredict = () => {
        refetch();
    };

    const predictionData = predictionRes?.data;
    const predictions = predictionData?.predictions || [];
    const summary = predictionData?.summary;
    const insights = predictionData?.insights || [];

    const formattedChartData = predictions.map((p: any) => ({
        name: p.date.split("-").reverse().slice(0, 2).join("/"),
        value: p.predictedRevenue,
    }));

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="accent" onClick={handlePredict}>
                    <Icon path={mdiShimmer} size={0.8} />
                    <span>Dự đoán doanh thu</span>
                </Button>
            </DialogTrigger>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiFinance} size={0.8} />
                        <span>Dự đoán doanh thu (AI)</span>
                        <Badge variant="green">Beta</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    {isLoading || isFetching ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-24 w-full bg-darkBackgroundV1" />
                                <Skeleton className="h-24 w-full bg-darkBackgroundV1" />
                            </div>
                            <Skeleton className="h-64 w-full bg-darkBackgroundV1" />
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-3/4 bg-darkBackgroundV1" />
                                <Skeleton className="h-8 w-2/3 bg-darkBackgroundV1" />
                            </div>
                        </div>
                    ) : predictionData ? (
                        <>
                            {/* Summary Section */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Tổng quan dự báo</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-darkBackgroundV1 border border-darkBorderV1 rounded-2xl p-4 flex flex-col gap-2">
                                    <span className="text-neutral-400 text-sm font-semibold uppercase tracking-wider">Tổng doanh thu dự kiến (7 ngày)</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-accent">
                                            {summary?.totalPredicted?.toLocaleString()}
                                        </span>
                                        <span className="text-neutral-400 text-sm font-medium">VND</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="green">
                                            +{((summary?.totalPredicted / 7 / (summary?.averageDaily || 1) - 1) * 100).toFixed(1)}%
                                        </Badge>
                                        <span className="text-neutral-400 text-xs">so với kỳ trước</span>
                                    </div>
                                </div>

                                <div className="bg-darkBackgroundV1 border border-darkBorderV1 rounded-2xl p-4 flex flex-col gap-2">
                                    <span className="text-neutral-400 text-sm font-semibold uppercase tracking-wider">Doanh thu trung bình/ngày</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-neutral-300">
                                            {summary?.averageDaily?.toLocaleString()}
                                        </span>
                                        <span className="text-neutral-400 text-sm font-medium">VND</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Icon path={mdiChartTimelineVariant} size={0.6} className="text-neutral-400" />
                                        <span className="text-neutral-400 text-xs">Chu kỳ dự đoán: 7 ngày tiếp theo</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Biểu đồ dự đoán</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <div className="bg-darkBackgroundV1 border border-darkBorderV1 rounded-2xl p-4">
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={formattedChartData}>
                                            <defs>
                                                <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#41C651" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#41C651" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1A2F32" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#a3a3a3"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                stroke="#a3a3a3"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString()}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#0A1F22", border: "1px solid #1A2F32", borderRadius: "12px" }}
                                                itemStyle={{ color: "#a3a3a3" }}
                                                formatter={(value: number) => [`${value?.toLocaleString()} đ`, "Doanh thu dự kiến"]}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#41C651"
                                                fillOpacity={1}
                                                fill="url(#colorPredict)"
                                                strokeWidth={3}
                                                strokeDasharray="5 5"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* AI Insights Section */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Khuyến nghị từ AI</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <div className="bg-darkBackgroundV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {insights.map((insight: string, idx: number) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <Icon path={mdiLightbulbOnOutline} size={0.6} className="text-accent mt-0.5" />
                                            <p className="text-neutral-300 text-sm leading-relaxed">{insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-neutral-400 text-base py-4 italic flex items-center justify-center gap-2">
                            <Icon path={mdiFinance} size={1} className="flex-shrink-0" />
                            Nhấn nút để bắt đầu phân tích dữ liệu dự báo.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => { }}>
                        <Icon path={mdiFinance} size={0.8} />
                        Đóng
                    </Button>
                    <Button variant="accent" onClick={handlePredict} disabled={isLoading || isFetching}>
                        <Icon path={isFetching ? mdiLoading : mdiShimmer} size={0.8} />
                        {isFetching ? "Đang phân tích..." : "Cập nhật dự đoán"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
