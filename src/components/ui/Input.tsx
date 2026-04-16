import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-gray-300">{label}</label>
            )}
            <input
                ref={ref}
                className={clsx(
                    "w-full rounded-lg border bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition",
                    "focus:ring-2 focus:ring-indigo-500",
                    error ? "border-red-500" : "border-gray-700 hover:border-gray-600",
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    )
);

Input.displayName = "Input";
export default Input;
