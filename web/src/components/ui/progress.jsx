import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Linear progress component
 */
const Progress = React.forwardRef(({ 
  className, 
  value, 
  max = 100,
  ...props 
}, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

/**
 * Circular progress component - custom implementation to replace Semi UI's circular progress
 */
const CircularProgress = React.forwardRef(({
  value = 0,
  size = 40,
  strokeWidth = 4,
  showInfo = true,
  className,
  ...props
}, ref) => {
  // Calculate the circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div 
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* Background circle */}
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Foreground circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="stroke-primary transition-all duration-300 ease-in-out"
        />
      </svg>
      
      {/* Percentage text in the middle */}
      {showInfo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">{Math.round(value)}%</span>
        </div>
      )}
    </div>
  );
});
CircularProgress.displayName = "CircularProgress";

/**
 * Progress steps component
 */
const ProgressSteps = React.forwardRef(({
  className,
  steps = [],
  currentStep = 0,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center w-full", className)}
      {...props}
    >
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step circle */}
          <div className="relative flex items-center justify-center">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors",
                index < currentStep 
                  ? "bg-primary text-primary-foreground" 
                  : index === currentStep 
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                    : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            {/* Step label */}
            {step.label && (
              <div className="absolute top-10 text-center w-max" style={{ transform: 'translateX(-50%)', left: '50%' }}>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            )}
          </div>
          
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-2">
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ 
                    width: index < currentStep 
                      ? '100%' 
                      : index === currentStep 
                        ? '50%' 
                        : '0%' 
                  }}
                />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});
ProgressSteps.displayName = "ProgressSteps";

export { Progress, CircularProgress, ProgressSteps }; 