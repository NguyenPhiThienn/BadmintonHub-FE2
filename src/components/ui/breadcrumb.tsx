import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-2 break-words text-sm text-gray-500 sm:gap-2",
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-2 text-sm", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
    href?: string;
  }
>(({ asChild, className, href, children, ...props }, ref) => {
  const linkClassName = cn(
    "transition-colors flex items-center group",
    className
  );

  const badgeContent = (
    <Badge
      variant="neutral"
    >
      {children}
    </Badge>
  );

  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={linkClassName}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  if (href) {
    const { target, download, rel, ...linkProps } = props as any;
    return (
      <Link
        href={href}
        className={linkClassName}
        {...linkProps}
        ref={ref as any}
      >
        {badgeContent}
      </Link>
    );
  }

  return (
    <a
      ref={ref}
      className={linkClassName}
      {...props}
    >
      {badgeContent}
    </a>
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <Badge
    variant="neutral"
    className={cn(
      className
    )}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <Badge
    variant="neutral"
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </Badge>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbList, BreadcrumbPage,
  BreadcrumbSeparator
};
