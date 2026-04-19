import type { ComponentProps } from "react";

interface IconButtonProps extends ComponentProps<"button"> {
  children: React.ReactNode;
}

export default function IconButton({
  children,
  className,
  ...props
}: IconButtonProps) {
  const classes = `p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className || ""}`;
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
