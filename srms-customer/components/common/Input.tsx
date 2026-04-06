import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = `
      w-full px-4 py-2.5
      bg-white border rounded-lg
      text-neutral-900 placeholder:text-neutral-400 placeholder:text-sm
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      disabled:bg-neutral-100 disabled:cursor-not-allowed
      transition-colors
    `;

    const errorStyles = error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-neutral-300";

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        className={cn(
          baseStyles,
          errorStyles,
          leftIcon && "pl-12",
          rightIcon && "pr-12",
          className
        )}
        {...props}
      />
    );

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {leftIcon || rightIcon ? (
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {leftIcon}
              </div>
            )}
            {inputElement}
            {rightIcon && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {rightIcon}
              </div>
            )}
          </div>
        ) : (
          inputElement
        )}
        {error && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
