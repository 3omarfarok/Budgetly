import { forwardRef } from "react";
import { ChevronDown, AlertCircle, Check } from "lucide-react";

const Select = forwardRef(
  (
    {
      label,
      value,
      onChange,
      error,
      success,
      hint,
      icon: LeftIcon,
      disabled = false,
      required = false,
      size = "md",
      variant = "default",
      className = "",
      containerClassName = "",
      labelClassName = "",
      fullWidth = true,
      id,
      name,
      children,
      ...rest
    },
    ref
  ) => {
    // Size variants
    const sizeClasses = {
      sm: "px-3 py-2 text-sm rounded-xl",
      md: "px-4 py-3 text-base rounded-2xl",
      lg: "px-5 py-4 text-lg rounded-2xl",
    };

    // Icon size based on input size
    const iconSizes = {
      sm: 16,
      md: 18,
      lg: 20,
    };

    // Variant styles
    const variantClasses = {
      default: `
      bg-ios-bg border border-ios-border
      hover:border-ios-primary/50
      focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20
    `,
      filled: `
      bg-ios-surface border border-transparent
      hover:bg-ios-hover
      focus:bg-ios-bg focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20
    `,
      outlined: `
      bg-transparent border-2 border-ios-border
      hover:border-ios-secondary
      focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20
    `,
    };

    // State-based border colors
    const getStateClasses = () => {
      if (disabled) {
        return "opacity-60 cursor-not-allowed bg-ios-hover";
      }
      if (error) {
        return "border-ios-error focus:border-ios-error focus:ring-ios-error/20 hover:border-ios-error";
      }
      if (success) {
        return "border-ios-success focus:border-ios-success focus:ring-ios-success/20 hover:border-ios-success";
      }
      return "";
    };

    // Label size classes
    const labelSizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    // Calculate padding for icons
    const getIconPadding = () => {
      const basePadding = {
        sm: { iconLeft: "pr-10", iconRight: "pl-10" },
        md: { iconLeft: "pr-12", iconRight: "pl-12" },
        lg: { iconLeft: "pr-14", iconRight: "pl-14" },
      };

      let classes = "";
      if (LeftIcon) classes += ` ${basePadding[size].iconLeft}`;
      // Right padding always needed for the chevron/arrow
      classes += ` ${basePadding[size].iconRight}`;
      return classes;
    };

    // Unique ID for accessibility
    const inputId =
      id || `select-${name || Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div
        className={`${
          fullWidth ? "w-full" : "inline-block"
        } ${containerClassName}`}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`
              block font-semibold text-ios-dark mb-2
              ${labelSizeClasses[size]}
              ${labelClassName}
            `}
          >
            {label}
            {required && <span className="text-ios-error mr-1">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          {/* Left Icon */}
          {LeftIcon && (
            <div
              className={`
              absolute top-1/2 right-3 -translate-y-1/2
              text-ios-secondary pointer-events-none
              ${error ? "text-ios-error" : ""}
              ${success ? "text-ios-success" : ""}
            `}
            >
              <LeftIcon size={iconSizes[size]} />
            </div>
          )}

          {/* Select Field */}
          <select
            ref={ref}
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              `${error ? errorId : ""} ${hint ? hintId : ""}`.trim() ||
              undefined
            }
            className={`
              appearance-none
              w-full
              text-ios-dark
              transition-all duration-200 ease-out
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${getStateClasses()}
              ${getIconPadding()}
              ${className}
            `}
            {...rest}
          >
            {children}
          </select>

          {/* Right Icon / Arrow */}
          <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {success && (
              <Check size={iconSizes[size]} className="text-ios-success" />
            )}
            {error && (
              <AlertCircle size={iconSizes[size]} className="text-ios-error" />
            )}
            <div
              className={`
              text-ios-secondary
              ${error ? "text-ios-error" : ""}
              ${success ? "text-ios-success" : ""}
            `}
            >
              <ChevronDown size={iconSizes[size]} />
            </div>
          </div>
        </div>

        {/* Bottom Row: Error/Success/Hint Messages */}
        <div className="flex justify-between items-start mt-1.5 gap-2">
          <div className="flex-1">
            {/* Success Message */}
            {success && !error && (
              <p className="text-ios-success text-xs flex items-center gap-1">
                <Check size={12} />
                {success}
              </p>
            )}

            {/* Hint Message */}
            {hint && !error && !success && (
              <p id={hintId} className="text-ios-secondary text-xs">
                {hint}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-ios-error text-xs flex items-center gap-1">
                <AlertCircle size={12} />
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
