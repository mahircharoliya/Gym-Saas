import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
    label: string;
    value: string | number;
    sub?: string;
    trend?: number;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
}

export default function StatCard({ label, value, sub, trend, icon: Icon, iconColor, iconBg }: Props) {
    const trendUp = trend !== undefined && trend > 0;
    const trendDown = trend !== undefined && trend < 0;
    const trendColor = trendUp ? "text-emerald-600" : trendDown ? "text-red-500" : "text-slate-400";
    const TrendIcon = trend === undefined ? null : trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;

    return (
        <div className="card-premium p-5 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <div className={`rounded-xl p-2.5 ${iconBg}`}>
                    <Icon size={16} className={iconColor} />
                </div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-black">{value}</p>
            <div className="flex items-center gap-2 mt-2">
                {sub && <p className="text-xs text-slate-400">{sub}</p>}
                {TrendIcon && trend !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
                        <TrendIcon size={11} />
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
}

