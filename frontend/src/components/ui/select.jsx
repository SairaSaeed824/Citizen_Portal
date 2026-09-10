import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

const SelectContext = React.createContext(null);

const Select = ({ value, defaultValue, onValueChange, children, disabled = false }) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value !== undefined ? value : internalValue;

  const setValue = (nextValue) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        setValue,
        open,
        setOpen,
        disabled,
      }}
    >
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectValue = ({ placeholder = "Select..." }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  const label = React.useMemo(() => {
    const items = [];
    const walk = (node) => {
      React.Children.forEach(node, (child) => {
        if (!React.isValidElement(child)) return;
        if (child.type === SelectItem && child.props.value === ctx.value) {
          items.push(child.props.children);
        }
        if (child.props?.children) walk(child.props.children);
      });
    };
    return items[0] ?? null;
  }, [ctx.value]);

  return (
    <span className="truncate">
      {label ?? placeholder}
    </span>
  );
};

const SelectTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  return (
    <button
      ref={ref}
      type="button"
      disabled={ctx.disabled}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      onClick={() => ctx.setOpen((open) => !open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center">{children}</span>
      <ChevronDown className={`ml-2 h-4 w-4 shrink-0 opacity-60 transition-transform ${ctx.open ? "rotate-180" : ""}`} />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx || !ctx.open) return null;

  return (
    <div
      ref={ref}
      role="listbox"
      className={`absolute left-0 top-full z-50 mt-1 max-h-72 w-full min-w-[8rem] overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className = "", value, children, disabled = false, ...props }, ref) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  const selected = ctx.value === value;

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-left text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800 ${className}`}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {selected && <Check className="h-4 w-4 text-emerald-600" />}
      </span>
      <span className="truncate">{children}</span>
    </button>
  );
});
SelectItem.displayName = "SelectItem";

const SelectGroup = ({ children }) => <>{children}</>;
const SelectLabel = ({ className = "", children }) => (
  <div className={`px-2 py-1.5 text-xs font-semibold text-slate-500 ${className}`}>{children}</div>
);
const SelectSeparator = ({ className = "" }) => (
  <div className={`-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-700 ${className}`} />
);
const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
