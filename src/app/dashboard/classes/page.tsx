"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ClassModal from "./ClassModal";
import ClassDetailModal from "./ClassDetailModal";

export interface GymClass {
    id: string; name: string; description?: string; location?: string;
    color: string; capacity: number; status: string;
    startAt: string; endAt: string; isRecurring: boolean; recurringId?: string;
    trainer?: { id: string; firstName: string; lastName: string } | null;
    bookings: { id: string; userId: string }[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am–9pm

function startOfWeek(d: Date) {
    const date = new Date(d);
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date;
}

export default function ClassesPage() {
    const { token, user } = useAuth();
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [classes, setClasses] = useState<GymClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModal, setCreateModal] = useState(false);
    const [detailClass, setDetailClass] = useState<GymClass | null>(null);
    const [defaultStart, setDefaultStart] = useState<Date | null>(null);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        const res = await fetch(
            `/api/classes?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (res.ok) setClasses(json.data);
        setLoading(false);
    }, [token, weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchClasses(); }, [fetchClasses]);

    function prevWeek() { setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; }); }
    function nextWeek() { setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; }); }
    function goToday() { setWeekStart(startOfWeek(new Date())); }

    function openCreateAt(day: Date, hour: number) {
        const d = new Date(day);
        d.setHours(hour, 0, 0, 0);
        setDefaultStart(d);
        setCreateModal(true);
    }

    const canManage = ["ADMIN", "MANAGER"].includes(user?.role ?? "");

    // Group classes by day index (0=Sun)
    const byDay: Record<number, GymClass[]> = {};
    classes.forEach((c) => {
        const d = new Date(c.startAt).getDay();
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(c);
    });

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const today = new Date();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button onClick={prevWeek} className="rounded-lg border border-gray-700 p-2 hover:bg-gray-800 transition-colors">
                        <ChevronLeft size={15} />
                    </button>
                    <button onClick={goToday} className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                        Today
                    </button>
                    <button onClick={nextWeek} className="rounded-lg border border-gray-700 p-2 hover:bg-gray-800 transition-colors">
                        <ChevronRight size={15} />
                    </button>
                    <span className="text-sm font-medium text-white ml-2">
                        {weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                </div>
                {canManage && (
                    <button onClick={() => { setDefaultStart(null); setCreateModal(true); }}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                        <Plus size={15} /> New Class
                    </button>
                )}
            </div>

            {/* Calendar grid */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-8 border-b border-gray-800">
                    <div className="py-3 px-2 text-xs text-gray-600" />
                    {weekDays.map((d, i) => {
                        const isToday = d.toDateString() === today.toDateString();
                        return (
                            <div key={i} className="py-3 text-center">
                                <p className="text-xs text-gray-500">{DAYS[d.getDay()]}</p>
                                <p className={`text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full mx-auto ${isToday ? "bg-indigo-600 text-white" : "text-gray-300"
                                    }`}>
                                    {d.getDate()}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Time slots */}
                <div className="overflow-y-auto max-h-[600px]">
                    {HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b border-gray-800/50 min-h-[56px]">
                            <div className="px-2 py-1 text-xs text-gray-600 text-right pt-1.5">
                                {hour === 12 ? "12pm" : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
                            </div>
                            {weekDays.map((day, di) => {
                                const dayClasses = (byDay[day.getDay()] ?? []).filter((c) => {
                                    const h = new Date(c.startAt).getHours();
                                    return h === hour && new Date(c.startAt).toDateString() === day.toDateString();
                                });
                                return (
                                    <div key={di}
                                        className="border-l border-gray-800/50 p-0.5 cursor-pointer hover:bg-gray-800/20 transition-colors relative"
                                        onClick={() => canManage && openCreateAt(day, hour)}>
                                        {dayClasses.map((c) => (
                                            <button key={c.id}
                                                onClick={(e) => { e.stopPropagation(); setDetailClass(c); }}
                                                className="w-full text-left rounded px-1.5 py-1 text-xs font-medium text-white mb-0.5 truncate"
                                                style={{ backgroundColor: c.color + "cc" }}>
                                                {c.name}
                                                <span className="block text-[10px] opacity-75">
                                                    {new Date(c.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    {c.trainer && ` · ${c.trainer.firstName}`}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex justify-center py-4">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
            )}

            {createModal && (
                <ClassModal
                    token={token!} defaultStart={defaultStart}
                    onClose={() => setCreateModal(false)}
                    onSaved={fetchClasses}
                />
            )}
            {detailClass && (
                <ClassDetailModal
                    gymClass={detailClass} token={token!} userId={user?.id ?? ""}
                    canManage={canManage}
                    onClose={() => setDetailClass(null)}
                    onSaved={() => { setDetailClass(null); fetchClasses(); }}
                />
            )}
        </div>
    );
}
