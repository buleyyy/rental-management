import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link-blue" | "link-red";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink/20 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-ink border border-transparent shadow-sm",
    secondary: "bg-surface text-ink hover:bg-surface-muted border border-border",
    danger: "bg-error text-white hover:bg-error/90 border border-transparent shadow-sm",
    ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
    "link-blue": "text-info hover:text-ink p-0 h-auto",
    "link-red": "text-error hover:text-error/80 p-0 h-auto",
  };

  const isLink = variant === "link-blue" || variant === "link-red";
  const sizeClass = isLink ? "" : sizeStyles[size] || sizeStyles.md;
  const variantClass = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      className={`${baseStyles} ${sizeClass} ${variantClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
