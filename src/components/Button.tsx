
import React from 'react';
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 disabled:bg-primary/50",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
      outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
      link: "underline-offset-4 hover:underline text-primary bg-transparent",
    };
    
    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-5 py-2.5",
    };
    
    const widthClass = fullWidth ? "w-full" : "";
    
    const iconStyles = iconPosition === 'left' 
      ? "flex gap-2" 
      : "flex flex-row-reverse gap-2";
      
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          widthClass,
          icon ? iconStyles : "",
          isLoading ? "opacity-80 pointer-events-none" : "",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : icon ? (
          <>
            <span className="flex items-center justify-center">{icon}</span>
            {children && <span>{children}</span>}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
