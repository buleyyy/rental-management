import React from "react";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

/**
 * Standard search field with a leading search icon.
 * Purely presentational — wire up `value`/`onChange` as a controlled input.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  containerClassName = "",
  className = "",
  ...props
}) => {
  return (
    <div className={`relative flex items-center ${containerClassName}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        className="absolute left-3 h-4 w-4 text-ink-faint pointer-events-none"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        className={`w-full h-9 pl-9 pr-3 bg-surface-muted border border-border rounded-md text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/40 focus:bg-surface transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};
