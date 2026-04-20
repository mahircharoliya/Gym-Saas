import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className, ...props }, ref) => (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={clsx(
                    "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none transition-all duration-150",
                    "hover:border-slate-300",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200",
                    props.disabled && "cursor-not-allowed bg-slate-50 opacity-60",
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    )
);

Input.displayName = "Input";
export default Input;

