import React from "react";
import { cn } from "../../lib/utils";

const Typography = {
  H1: ({ children, className, ...props }) => (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  ),
  H2: ({ children, className, ...props }) => (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  H3: ({ children, className, ...props }) => (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  ),
  H4: ({ children, className, ...props }) => (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  ),
  P: ({ children, className, ...props }) => (
    <p
      className={cn("leading-7 not-first:mt-6", className)}
      {...props}
    >
      {children}
    </p>
  ),
  Blockquote: ({ children, className, ...props }) => (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    >
      {children}
    </blockquote>
  ),
  Code: ({ children, className, ...props }) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  Lead: ({ children, className, ...props }) => (
    <p
      className={cn("text-xl text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  ),
  Large: ({ children, className, ...props }) => (
    <div
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </div>
  ),
  Small: ({ children, className, ...props }) => (
    <small
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    >
      {children}
    </small>
  ),
  Muted: ({ children, className, ...props }) => (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  ),
  Text: ({ children, className, strong, type, size, ...props }) => {
    const sizeClass = size === "small" ? "text-sm" : "text-base";
    const typeClass = 
      type === "secondary" ? "text-muted-foreground" : 
      type === "success" ? "text-green-500" :
      type === "warning" ? "text-yellow-500" :
      type === "danger" ? "text-red-500" :
      type === "tertiary" ? "text-gray-400" :
      "text-foreground";
    
    const Element = strong ? "strong" : "span";
    
    return (
      <Element
        className={cn(sizeClass, typeClass, className)}
        {...props}
      >
        {children}
      </Element>
    );
  }
};

export { Typography }; 