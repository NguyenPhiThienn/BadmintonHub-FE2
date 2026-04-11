import { format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import * as React from "react";
import { vi } from "react-day-picker/locale/vi";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  withTime?: boolean;
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Chọn ngày",
  disabled = false,
  className,
  withTime = false,
  captionLayout = "label",
  fromYear = 1960,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    if (date && withTime) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "00:00";
  });

  React.useEffect(() => {
    if (date && withTime) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      setTimeValue(`${hours}:${minutes}`);
    }
  }, [date, withTime]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onDateChange?.(undefined);
      return;
    }

    if (withTime && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours || 0, minutes || 0, 0, 0);
      onDateChange?.(newDate);
    } else {
      onDateChange?.(selectedDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (date && newTime) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours || 0, minutes || 0, 0, 0);
      onDateChange?.(newDate);
    }
  };

  const formatDisplay = () => {
    if (!date) return placeholder;
    if (withTime) {
      return format(date, "dd/MM/yyyy HH:mm", { locale: viLocale });
    }
    return format(date, "dd/MM/yyyy", { locale: viLocale });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start h-10 text-left font-normal border border-darkBorderV1 bg-darkBorderV1/50 hover:bg-darkCardV1 hover:border-accent/30 transition-all",
            !date && "text-neutral-300",
            date && "text-neutral-300",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="h-4 w-4 text-neutral-300 mr-2" />
          <span>{formatDisplay()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-darkCardV1 border-darkBorderV1">
        <div className="flex overflow-hidden rounded-2xl">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            locale={vi}
            captionLayout={captionLayout}
            fromYear={fromYear}
            toYear={toYear}
          />
          {withTime && (
            <div className="border-l border-darkBorderV1 bg-darkBackgroundV1 p-3 flex flex-col justify-start min-w-[160px]">
              <div className="space-y-2">
                <Label htmlFor="time-input" className="flex flex-row items-center gap-2 normal-case">
                  <Clock className="h-3.5 w-3.5 text-neutral-300" />
                  Nhập khung giờ
                </Label>
                <Input
                  id="time-input"
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="h-10 bg-darkCardV1 border-darkBorderV1 text-neutral-300 focus:border-accent/50 appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
