import { cn } from "@/lib/utils";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import * as React from "react";

interface InputProps extends React.ComponentProps<"input"> {
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onClear, value, ...props }, ref) => {
    const showClear = !!value && !!onClear;

    return (
      <div className="relative w-full group">
        <input
          type={type}
          value={value}
          className={cn(
            "block !h-10 w-full rounded-md bg-darkBorderV1 px-3 py-2 text-sm transition-colors file:border-0 file:bg-mainCardV1 file:text-sm file:font-semibold file:text-foreground focus:outline-none placeholder:text-neutral-400 placeholder:italic disabled:cursor-not-allowed disabled:opacity-50 focus:ring-gray-700/50 border border-darkBorderV1 text-neutral-300 focus:border-mainTextHoverV1 ",
            (type === "datetime-local" || type === "date") &&
            "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-datetime-edit]:w-full",
            showClear && "pr-10",
            className,
          )}
          ref={ref}
          {...props}
        />
        {showClear && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear?.();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-accent transition-all duration-200 hover:scale-110 active:scale-95"
            type="button"
          >
            <Icon path={mdiClose} size={0.8} />
          </button>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
