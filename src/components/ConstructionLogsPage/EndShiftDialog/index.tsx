"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEndShiftByLog } from "@/hooks/useTasks";
import { IConstructionLog } from "@/interface/task";
import { mdiClockEnd, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";

interface EndShiftDialogProps {
    isOpen: boolean;
    onClose: () => void;
    log: IConstructionLog | null;
}

export function EndShiftDialog({ isOpen, onClose, log }: EndShiftDialogProps) {
    const { mutate: endShift, isPending } = useEndShiftByLog();
    const [endTime, setEndTime] = useState<Date | undefined>(new Date());
    const [shiftSummary, setShiftSummary] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!log) return;

        const formattedTime = endTime
            ? `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`
            : new Date().toTimeString().slice(0, 5);

        endShift(
            {
                id: log._id,
                data: {
                    endTime: formattedTime,
                    shiftSummary,
                },
            },
            { onSuccess: () => { setShiftSummary(""); onClose(); } }
        );
    };

    if (!log) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiClockEnd} size={0.8} className="flex-shrink-0" />
                        <span>Kết thúc ca làm việc</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <p className="text-sm text-neutral-300">
                        {log.projectName} - {log.location}
                    </p>
                    <div className="space-y-4 md:space-y-4">
                        <div className="space-y-2">
                            <Label>Giờ kết thúc</Label>
                            <DatePicker
                                date={endTime}
                                onDateChange={setEndTime}
                                withTime={true}
                                className="w-full"
                                captionLayout="dropdown"
                                toYear={new Date().getFullYear() + 10}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tóm tắt ca làm việc</Label>
                            <Textarea
                                value={shiftSummary}
                                onChange={(e) => setShiftSummary(e.target.value)}
                                placeholder="Tóm tắt công việc đã thực hiện..."
                                rows={4}
                                required
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        <Icon path={mdiClockEnd} size={0.8} className="flex-shrink-0" />
                        {isPending ? "Đang xử lý..." : "Kết thúc ca"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
