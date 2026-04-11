"use client";

import { cn } from "@/lib/utils";
import { mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";

interface QuantityInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
}

export function QuantityInput({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    className,
}: QuantityInputProps) {
    const handleDecrement = () => {
        const newValue = value - step;
        if (newValue >= min) {
            onChange(newValue);
        } else {
            onChange(min);
        }
    };

    const handleIncrement = () => {
        const newValue = value + step;
        if (max !== undefined) {
            if (newValue <= max) {
                onChange(newValue);
            } else {
                onChange(max);
            }
        } else {
            onChange(newValue);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value === "" ? 0 : parseInt(e.target.value);
        if (isNaN(val)) return;

        let finalValue = val;
        if (finalValue < min) finalValue = min;
        if (max !== undefined && finalValue > max) finalValue = max;

        onChange(finalValue);
    };

    return (
        <div className={cn("flex items-center group", className)}>
            <div className="flex h-10 w-full overflow-hidden rounded-md border border-darkBorderV1 bg-darkBorderV1 transition-colors focus-within:border-accent/50">
                <Input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    className="h-full border-none border-l border-white/10 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold"
                />
                <div className="flex">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleDecrement}
                        disabled={value <= min}
                        className="h-full w-10 shrink-0 rounded-none hover:bg-white/5 disabled:opacity-30 border-l border-white/10"
                    >
                        <Icon path={mdiMinus} size={0.8} className="flex-shrink-0" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleIncrement}
                        disabled={max !== undefined && value >= max}
                        className="h-full w-10 shrink-0 rounded-none hover:bg-white/5 disabled:opacity-30 border-l border-white/10"
                    >
                        <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
