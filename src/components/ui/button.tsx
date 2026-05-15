import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bi-navy disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-bi-navy text-white hover:bg-blue-900": variant === "default",
            "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700": variant === "outline",
            "hover:bg-gray-100 text-gray-700": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
