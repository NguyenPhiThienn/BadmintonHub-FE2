"use client";

import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as React from "react";

interface TimeSlotPickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  interval?: number; // minutes: 15, 30, 60
}

const generateTimeSlots = (interval: number = 60) => {
  const slots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      const value = `${hour}:${minute}`;
      const label = `${hour}:${minute}`;
      slots.push({ value, label });
    }
  }
  // Add 24:00 slot
  slots.push({ value: "24:00", label: "24:00" });
  return slots;
};

export function TimeSlotPicker({
  value = "",
  onChange,
  placeholder = "Chọn giờ",
  disabled = false,
  className,
  interval = 60,
}: TimeSlotPickerProps) {
  const slots = React.useMemo(() => generateTimeSlots(interval), [interval]);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {slots.map((slot) => (
          <SelectItem key={slot.value} value={slot.value}>
            {slot.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
