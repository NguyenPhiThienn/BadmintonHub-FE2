"use client";

import { format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { Calendar, X } from "lucide-react";
import * as React from "react";
import { vi } from "react-day-picker/locale/vi";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerInputProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled = false,
  className,
}: DatePickerInputProps) {
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      onChange?.(formatted);
    }
  };

  const formatDisplay = () => {
    if (!selectedDate) return placeholder;
    return format(selectedDate, "dd/MM/yyyy", { locale: viLocale });
  };

  return (
    <div className="relative w-full group">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-10 px-3 justify-start text-left font-normal border border-darkBorderV1 bg-darkBorderV1/50 hover:bg-darkCardV1 hover:border-accent/30 transition-all pr-8",
              !selectedDate && "text-neutral-400",
              selectedDate && "text-neutral-300",
              className
            )}
            disabled={disabled}
          >
            <Calendar className="h-4 w-4 mr-2 text-neutral-400 shrink-0" />
            <span className="truncate">{formatDisplay()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-darkCardV1 border-darkBorderV1" align="start">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            locale={vi}
            fromYear={2020}
            toYear={new Date().getFullYear() + 1}
          />
        </PopoverContent>
      </Popover>

      {selectedDate && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange?.("");
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 p-1 bg-darkBorderV1/80 hover:bg-darkBorderV1 rounded-md transition-all z-10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
