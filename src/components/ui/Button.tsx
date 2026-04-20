import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    variant?: "primary" | "ghost" | "danger";
    size?: "sm" | "md";
}

export default function Button({
    children,
    loading,
    variant = "primary",
    size = "md",
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={clsx(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                size === "md" && "px-4 py-2.5 text-sm",
                size === "sm" && "px-3 py-1.5 text-xs",
                variant === "primary" && "bg-blue-600 text-black shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-[0.98]",
                variant === "ghost" && "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                variant === "danger" && "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
                className
            )}
            {...props}
        >
            {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
                children
            )}
        </button>
    );
}

