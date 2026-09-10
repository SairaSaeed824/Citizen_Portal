import * as React from "react";

const Button = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-[#00401A] text-white hover:bg-[#055825]",
    outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
    ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  };

  return (
    <button
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.default} ${className}`}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
