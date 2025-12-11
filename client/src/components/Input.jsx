import { forwardRef, useState, isValidElement } from "react";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";

// Helper function to render icon properly
const renderIcon = (Icon, size) => {
  if (!Icon) return null;
  // If it's already a React element, return it
  if (isValidElement(Icon)) return Icon;
  // Otherwise render it as a component
  return <Icon size={size} />;
};

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      value,
      onChange,
      error,
      success,
      hint,
      icon: LeftIcon,
      rightIcon: RightIcon,
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
      autoComplete,
      maxLength,
      showCharCount = false,
      multiline = false,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determine if we should render a textarea
    const isTextarea = multiline;
    const Component = isTextarea ? "textarea" : "input";

    // Determine the actual input type (handle password visibility toggle)
    const inputType = type === "password" && showPassword ? "text" : type;

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

    // Calculate padding for icons (RTL aware - icon positions are swapped)
    // LeftIcon is positioned at right-3, so needs pr-* (padding-right)
    // RightIcon is positioned at left-3, so needs pl-* (padding-left)
    const getIconPadding = () => {
      const basePadding = {
        sm: { iconLeft: "pr-10", iconRight: "pl-10" },
        md: { iconLeft: "pr-12", iconRight: "pl-12" },
        lg: { iconLeft: "pr-14", iconRight: "pl-14" },
      };

      let classes = "";
      if (LeftIcon) classes += ` ${basePadding[size].iconLeft}`;
      if (RightIcon || type === "password")
        classes += ` ${basePadding[size].iconRight}`;
      return classes;
    };

    // Unique ID for accessibility
    const inputId =
      id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
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

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {LeftIcon && (
            <div
              className={`
              absolute ${
                isTextarea ? "top-3" : "top-1/2 -translate-y-1/2"
              } right-3
              text-ios-secondary pointer-events-none
              transition-colors duration-200
              ${isFocused ? "text-ios-primary" : ""}
              ${error ? "text-ios-error" : ""}
              ${success ? "text-ios-success" : ""}
            `}
            >
              {renderIcon(LeftIcon, iconSizes[size])}
            </div>
          )}

          {/* Input/Textarea Field */}
          <Component
            ref={ref}
            id={inputId}
            name={name}
            type={!isTextarea ? inputType : undefined}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              `${error ? errorId : ""} ${hint ? hintId : ""}`.trim() ||
              undefined
            }
            className={`
              caret
            w-full
            text-ios-dark placeholder-ios-secondary/50
            transition-all duration-200 ease-out
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${getStateClasses()}
            ${getIconPadding()}
            ${className}
          `}
            {...rest}
          />

          {/* Right Icon / Password Toggle / Status Icon */}
          <div
            className={`absolute ${
              isTextarea ? "top-3" : "top-1/2 -translate-y-1/2"
            } left-3 flex items-center gap-2`}
          >
            {/* Password Toggle */}
            {type === "password" && !isTextarea && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-ios-secondary hover:text-ios-primary transition-colors duration-200 focus:outline-none"
                aria-label={showPassword ? "إخفاء الباسورد" : "إظهار الباسورد"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={iconSizes[size]} />
                ) : (
                  <Eye size={iconSizes[size]} />
                )}
              </button>
            )}

            {/* Success Icon */}
            {success && !RightIcon && type !== "password" && (
              <Check size={iconSizes[size]} className="text-ios-success" />
            )}

            {/* Error Icon */}
            {error && !RightIcon && type !== "password" && (
              <AlertCircle size={iconSizes[size]} className="text-ios-error" />
            )}

            {/* Custom Right Icon */}
            {RightIcon && type !== "password" && (
              <div
                className={`
                text-ios-secondary
                ${isFocused ? "text-ios-primary" : ""}
                ${error ? "text-ios-error" : ""}
                ${success ? "text-ios-success" : ""}
              `}
              >
                {renderIcon(RightIcon, iconSizes[size])}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Error/Success/Hint Messages + Character Count */}
        <div className="flex justify-between items-start mt-1.5 gap-2">
          <div className="flex-1">
            {/* Error Message */}
            {/* {error && (
              <p
                id={errorId}
                className="text-ios-error text-xs flex items-center gap-1"
                role="alert"
              >
                <AlertCircle size={12} />
                {error}
              </p>
            )} */}

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
          </div>

          {/* Character Count */}
          {showCharCount && maxLength && (
            <span
              className={`
              text-xs font-numbers
              ${
                (value?.length || 0) >= maxLength
                  ? "text-ios-error"
                  : "text-ios-secondary"
              }
            `}
            >
              {value?.length || 0}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
