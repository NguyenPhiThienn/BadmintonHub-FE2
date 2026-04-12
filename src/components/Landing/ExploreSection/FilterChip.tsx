"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const FilterChip = ({ label, active, onClick, icon }: FilterChipProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 whitespace-nowrap",
        active
          ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(65,198,81,0.1)]"
          : "bg-darkCardV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
};
