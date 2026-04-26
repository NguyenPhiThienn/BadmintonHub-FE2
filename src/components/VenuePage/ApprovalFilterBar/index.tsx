import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { mdiMagnify, mdiRefresh, mdiTuneVariant } from "@mdi/js";
import Icon from "@mdi/react";
import { Button } from "@/components/ui/button";

interface ApprovalFilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortOrder: string;
    onSortChange: (value: string) => void;
    locationFilter: string;
    onLocationChange: (value: string) => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
}

export const ApprovalFilterBar = ({
    searchQuery,
    onSearchChange,
    sortOrder,
    onSortChange,
    locationFilter,
    onLocationChange,
    onRefresh,
    isRefreshing = false,
}: ApprovalFilterBarProps) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-darkCardV1/30 p-3 rounded-2xl border border-darkBorderV1">
            <div className="relative flex-1 min-w-[300px]">
                <Input
                    placeholder="Tìm theo tên sân hoặc chủ sở hữu..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-10 border-darkBorderV1 focus:border-accent/50"
                />
                <Icon
                    path={mdiMagnify}
                    size={0.8}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
            </div>

            <div className="flex items-center gap-3">
                <Select value={sortOrder} onValueChange={onSortChange}>
                    <SelectTrigger className="w-[160px] h-10 border-darkBorderV1">
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">Mới nhất trước</SelectItem>
                        <SelectItem value="asc">Cũ nhất trước</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={onLocationChange}>
                    <SelectTrigger className="w-[160px] h-10 border-darkBorderV1">
                        <SelectValue placeholder="Khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toàn quốc</SelectItem>
                        <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                        <SelectItem value="hn">Hà Nội</SelectItem>
                        <SelectItem value="dn">Đà Nẵng</SelectItem>
                    </SelectContent>
                </Select>

                <div className="h-6 w-[1px] bg-darkBorderV1 mx-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-neutral-400 hover:text-accent hover:bg-accent/10"
                    onClick={onRefresh}
                >
                    <Icon
                        path={mdiRefresh}
                        size={0.8}
                        className={isRefreshing ? "animate-spin" : ""}
                    />
                </Button>

                <Button
                    variant="outline"
                    className="h-10 gap-2 border-darkBorderV1 text-neutral-400"
                >
                    <Icon path={mdiTuneVariant} size={0.8} />
                    {!isRefreshing && <span className="text-sm">Bộ lọc nâng cao</span>}
                </Button>
            </div>
        </div>
    );
};
