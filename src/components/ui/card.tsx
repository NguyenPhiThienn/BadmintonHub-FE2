import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border-2 bg-darkCardV1 border-darkBorderV1 text-neutral-300 overflow-hidden",
      "shadow-[0_0_8px_rgba(65,198,81,0.08),0_0_15px_rgba(65,198,81,0.04)]",
      "hover:shadow-[0_0_12px_rgba(65,198,81,0.12),0_0_20px_rgba(65,198,81,0.06)]",
      "transition-shadow duration-300 border-accent/40 space-y-3 md:space-y-4 shadow-lg shadow-accent/5",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1 p-3 border-b border-b-darkBorderV1 bg-[#051A1D] text-neutral-300",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold text-neutral-300 bg-[#051A1D] leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-3  text-neutral-300", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-3 pt-0 text-neutral-300", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
};
