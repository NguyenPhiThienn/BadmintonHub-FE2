import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "flex items-center justify-center border px-2 py-1 h-fit rounded-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer text-sm h-6 leading-[1px] w-fit text-nowrap capitalize",
  {
    variants: {
      variant: {
        default: "border-darkBorderV1 text-darkBorderV1 text-nowrap",
        secondary:
          "border-darkBorderV1 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-neutral-300 text-nowrap",
        destructive:
          "bg-red-500/10 text-red-400 border-red-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        orange:
          "bg-orange-500/10 text-orange-400 border-orange-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        red: "bg-red-500/10 text-red-400 border-red-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        amber:
          "bg-amber-500/10 text-amber-400 border-amber-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        yellow:
          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        lime: "bg-lime-500/10 text-lime-400 border-lime-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        green:
          "bg-green-500/10 text-green-400 border-green-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        emerald:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        teal: "bg-teal-500/10 text-teal-400 border-teal-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        sky: "bg-sky-500/10 text-sky-400 border-sky-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        indigo:
          "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        violet:
          "bg-violet-500/10 text-violet-400 border-violet-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        purple:
          "bg-purple-500/10 text-purple-400 border-purple-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        fuchsia:
          "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        pink: "bg-pink-500/10 text-pink-400 border-pink-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        slate:
          "bg-slate-500/10 text-slate-400 border-slate-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        gray: "bg-gray-500/10 text-gray-400 border-gray-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        neutral:
          "bg-neutral-500/10 text-neutral-300 border-neutral-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        stone:
          "bg-stone-500/10 text-stone-400 border-stone-500/20 rounded-md px-1.5 py-0 text-xs font-bold",
        ghost:
          "hover:text-neutral-300 border-darkBorderV1 bg-darkBorderV1 text-neutral-300",
        outline2:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground border-accent/40 bg-accent/15 text-secondary',
        badminton:
          'bg-primary text-secondary border-none'
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
