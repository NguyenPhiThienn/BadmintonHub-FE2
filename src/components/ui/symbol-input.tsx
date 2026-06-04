"use client";

import { cn } from "@/lib/utils";
import { mdiOmega } from "@mdi/js";
import Icon from "@mdi/react";
import * as React from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface SymbolInputProps extends React.ComponentProps<"input"> {
    onValueChange?: (value: string) => void;
}

const symbols = ["μΩ", "Ω", "δ", "Δ", "Φ", "φ", "√", "Ø", "Ψ", "α"];

const SymbolInput = React.forwardRef<HTMLInputElement, SymbolInputProps>(
    ({ className, type, value, onChange, onValueChange, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null);

        // Keep internal ref and forwarded ref in sync
        React.useImperativeHandle(ref, () => inputRef.current!);

        const insertSymbol = (symbol: string) => {
            if (!inputRef.current) return;
            const input = inputRef.current;
            const start = input.selectionStart ?? 0;
            const end = input.selectionEnd ?? 0;
            const currentText = input.value;
            const newText = currentText.substring(0, start) + symbol + currentText.substring(end);

            // Set value manually
            input.value = newText;

            // Trigger onChange for react-hook-form and other listeners
            const event = new Event("input", { bubbles: true });
            input.dispatchEvent(event);

            if (onChange) {
                const changeEvent = {
                    target: input,
                    currentTarget: input,
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(changeEvent);
            }

            if (onValueChange) {
                onValueChange(newText);
            }

            // Restore focus and cursor position
            input.focus();
            const newCursorPos = start + symbol.length;
            input.setSelectionRange(newCursorPos, newCursorPos);
        };

        return (
            <div className="relative w-full group">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className={cn(
                        "block !h-10 w-full rounded-md bg-darkBorderV1 pl-3 pr-10 py-2 text-sm transition-colors file:border-0 file:bg-mainCardV1 file:text-sm file:font-semibold file:text-foreground focus:outline-none placeholder:text-neutral-400 placeholder:italic disabled:cursor-not-allowed disabled:opacity-50 focus:ring-gray-700/50 border border-darkBorderV1 text-neutral-300 focus:border-mainTextHoverV1",
                        className
                    )}
                    ref={inputRef}
                    {...props}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center h-8">
                    <Popover>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                    >
                                        <Icon path={mdiOmega} size={0.8} />
                                    </Button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Chèn ký hiệu đặc biệt</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-fit !p-2 bg-darkCardV1 border-darkBorderV1" align="end">
                            <div className="grid grid-cols-5 gap-2">
                                {symbols.map((s) => (
                                    <Button
                                        key={s}
                                        variant="ghost"
                                        type="button"
                                        size="icon"
                                        onClick={() => insertSymbol(s)}
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        );
    }
);
SymbolInput.displayName = "SymbolInput";

export { SymbolInput };
