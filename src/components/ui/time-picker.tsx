"use client";

import { cn } from "@/lib/utils";
import {
  mdiClockOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import * as React from "react";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value = "",
  onChange,
  placeholder = "Chọn giờ",
  disabled = false,
  className,
}: TimePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (inputRef.current && !disabled) {
      try {
        inputRef.current.showPicker();
      } catch (err) {
        inputRef.current.focus();
      }
    }
  };

  const formatDisplayTime = (time: string) => {
    if (!time) return "";
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const ampm = hours >= 12 ? "PM" : "AM";
      const h = hours % 12 || 12;
      const m = minutes.toString().padStart(2, "0");
      return `${h}:${m} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  return (
    <div
      className={cn(
        "relative group w-full h-10",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={handleContainerClick}
    >
      {/* Lớp hiển thị (Giao diện giống Input) */}
      <div
        className={cn(
          "flex h-full w-full items-center rounded-md bg-darkBorderV1 px-3 py-2 text-sm transition-colors border border-darkBorderV1 text-neutral-300 group-hover:border-mainTextHoverV1 group-focus-within:border-mainTextHoverV1",
          !value && "text-neutral-400 italic",
          className
        )}
      >
        {formatDisplayTime(value) || placeholder}
      </div>

      {/* Icon Clock bên phải */}
      <Icon
        path={mdiClockOutline}
        size={0.8}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none transition-colors group-hover:text-accent"
      />

      {/* Input thật, ẩn đi nhưng phủ toàn bộ diện tích để nhận click */}
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 opacity-0 cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />
    </div>
  );
}
