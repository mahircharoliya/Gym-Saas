import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    variant?: "primary" | "ghost";
}

export default function Button({
    children,
    loading,
    variant = "primary",
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={clsx(
                "flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed",
                variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-500",
                variant === "ghost" && "border border-gray-700 text-gray-300 hover:bg-gray-800",
                className
            )}
            {...props}
        >
            {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
                children
            )}
        </button>
    );
}
