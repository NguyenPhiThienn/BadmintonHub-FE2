import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { RippleEffect } from "./ripple-effect";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 !margin-0 flex-shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent hover:bg-accent/80 text-muted font-semibold bg-green-500 hover:bg-green-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-accent bg-green-950 text-accent font-semibold hover:bg-green-900 hover:text-accent text-green-400 border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/50",
        blue:
          "border border-blue-500 bg-blue-950 text-blue-400 font-semibold hover:bg-blue-500/10",
        red:
          "border border-red-500 bg-red-950 text-red-400 font-semibold hover:bg-red-500/10",
        green:
          "border border-green-500 bg-green-950 text-green-400 font-semibold hover:bg-green-500/10",
        orange:
          "border border-orange-500 bg-orange-950 text-orange-400 font-semibold hover:bg-orange-500/10",
        gray:
          "border border-gray-500 bg-gray-950 text-gray-300 font-semibold hover:bg-gray-500/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "bg-transparent text-neutral-300 hover:bg-darkBorderV1 hover:text-accent bg-darkBorderV1 hover:bg-darkBorderV1/70 text-sm",
        link: "text-accent underline-offset-4 hover:underline",
        ghost2: "hover:bg-secondary text-primary hover:text-primary dark:hover:bg-accent/50",
        accent:
          'bg-accent text-secondary hover:bg-accent/80',
        'ghost-badminton':
          'hover:bg-primary/10 hover:text-primary',
        badminton:
          'bg-primary text-secondary hover:bg-secondary hover:shadow-lg transition-all duration-300',
        'cta-badminton':
          'bg-white text-primary hover:bg-accent/10 shadow-lg hover:shadow-xl font-semibold transition-all duration-300',
      },
      size: {
        default: "!h-10 px-3",
        sm: "!h-8 px-3 text-sm",
        lg: 'h-10 rounded-md px-4 has-[>svg]:px-4',
        xl: 'h-12 rounded-lg px-8 text-base has-[>svg]:px-5',
        icon: "!h-10 !w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ripple?: boolean;
  rippleColor?: string;
  rippleDuration?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      ripple = false,
      rippleColor,
      rippleDuration,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );

    if (ripple) {
      return (
        <RippleEffect
          rippleColor={rippleColor || "rgba(255, 255, 255, 0.4)"}
          duration={rippleDuration || 500}
          className="inline-flex"
        >
          {buttonElement}
        </RippleEffect>
      );
    }

    return buttonElement;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
