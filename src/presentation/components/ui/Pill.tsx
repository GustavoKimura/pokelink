import type { ComponentProps } from "react";

interface PillProps extends ComponentProps<"div"> {
  children: React.ReactNode;
}

export default function Pill({ children, className, ...props }: PillProps) {
  const classes = `flex items-center gap-1 px-3 py-1 bg-yellow-700 rounded-lg ${className || ""}`;
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
