import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
    label: string;
    value: string | number;
    sub?: string;
    trend?: number; // positive = up, negative = down
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
}

export default function StatCard({ label, value, sub, trend, icon: Icon, iconColor, iconBg }: Props) {
    const trendColor = trend === undefined ? "" : trend > 0 ? "text-emerald-400" : trend < 0 ? "text-red-400" : "text-gray-400";
    const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">{label}</p>
                <div className={`rounded-lg p-2 ${iconBg}`}>
                    <Icon size={18} className={iconColor} />
                </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <div className="flex items-center gap-1.5 mt-1">
                {sub && <p className="text-xs text-gray-500">{sub}</p>}
                {TrendIcon && trend !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                        <TrendIcon size={12} />
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
}
