import * as React from "react";

interface ActionIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	size?: "default" | "sm" | "lg";
}

const getVariantClasses = (variant?: string): string => {
	switch (variant) {
		case "default":
			return "bg-primary text-primary-foreground hover:bg-primary/90";
		case "destructive":
			return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
		case "outline":
			return "border border-[#ccc] hover:bg-accent hover:text-accent-foreground";
		case "secondary":
			return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
		case "ghost":
			return "hover:bg-accent hover:text-accent-foreground";
		case "link":
			return "text-primary underline-offset-4 hover:underline";
		default:
			return "bg-primary text-primary-foreground hover:bg-primary/90";
	}
};

const getSizeClasses = (size?: string): string => {
	switch (size) {
		case "default":
			return "h-8 w-8 p-1";
		case "sm":
			return "h-6 w-6 p-0.5";
		case "lg":
			return "h-10 w-10 p-1.5";
		default:
			return "h-8 w-8 p-1";
	}
};

const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
	({ className = "", variant = "default", size = "default", ...props }, ref) => {
		const variantClasses = getVariantClasses(variant);
		const sizeClasses = getSizeClasses(size);

		return (
			<button
				className={`inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-[#272F37] hover:text-accent-foreground ${variantClasses} ${sizeClasses} ${className}`}
				ref={ref}
				{...props}
			/>
		);
	},
);
ActionIcon.displayName = "ActionIcon";

export { ActionIcon };
