import type { ElementType, ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "warning" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  warning:
    "bg-yellow-500 text-slate-900 hover:bg-yellow-600 focus:ring-yellow-400",
  ghost: "bg-transparent text-white hover:bg-gray-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-6 py-2 text-base",
  lg: "px-8 py-3 text-lg",
};

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & Omit<ComponentProps<T>, "as">;

export default function Button<T extends ElementType = "button">({
  as,
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ""}`;

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
