import * as React from "react";

const Input = React.forwardRef(({ className = "", type = "text", ...props }, ref) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
