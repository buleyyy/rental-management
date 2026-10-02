import React from "react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-success-bg text-success border border-success-border",
    warning: "bg-warning-bg text-warning border border-warning-border",
    danger: "bg-error-bg text-error border border-error-border",
    info: "bg-info-bg text-info border border-info-border",
    neutral: "bg-surface-subtle text-ink-muted border border-border",
  };

  const appliedStyle = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium whitespace-nowrap rounded ${appliedStyle} ${className}`}
    >
      {children}
    </span>
  );
};
