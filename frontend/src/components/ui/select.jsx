import * as React from "react";

/**
 * shadcn-style Select used by Citizen Portal.
 * Kept dependency-free so the existing frontend installs/builds without
 * adding another runtime package just for native selection controls.
 */
const Select = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <select
    ref={ref}
    className={`flex h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
