"use client";

import { useState } from "react";
import { X, MapPin, Users, Clock, Repeat, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import type { GymClass } from "./page";

interface Props {
    gymClass: GymClass;
    token: string;
    userId: string;
    canManage: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function ClassDetailModal({ gymClass: c, token, userId, canManage, onClose, onSaved }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isBooked = c.bookings.some((b) => b.userId === userId);
    const spotsLeft = c.capacity - c.bookings.length;
    const isPast = new Date(c.startAt) < new Date();

    async function book() {
        setError(""); setLoading(true);
        const res = await fetch(`/api/classes/${c.id}/book`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) setError(json.error);
        else onSaved();
        setLoading(false);
    }

    async function cancelBooking() {
        setLoading(true);
        await fetch(`/api/classes/${c.id}/book`, {
            method: "DELETE", headers: { Authorization: `Bearer ${token}` },
        });
        onSaved();
        setLoading(false);
    }

    async function deleteClass(deleteAll = false) {
        if (!confirm(deleteAll ? "Delete all future recurring instances?" : "Delete this class?")) return;
        await fetch(`/api/classes/${c.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ deleteAll }),
        });
        onSaved();
    }

    const start = new Date(c.startAt);
    const end = new Date(c.endAt);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-white shadow-2xl">
                {/* Color bar */}
                <div className="h-1.5 rounded-t-2xl" style={{ backgroundColor: c.color }} />

                <div className="flex items-start justify-between px-6 pt-5 pb-2">
                    <div>
                        <p className="font-semibold text-black text-lg">{c.name}</p>
                        {c.status === "CANCELLED" && (
                            <span className="text-xs text-red-400 font-medium">CANCELLED</span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors mt-0.5">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                    {/* Meta */}
                    <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="shrink-0" />
                            <span>
                                {start.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                                {" · "}
                                {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                {" – "}
                                {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                        {c.location && (
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="shrink-0" />
                                <span>{c.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Users size={14} className="shrink-0" />
                            <span>
                                {c.bookings.length}/{c.capacity} booked
                                {spotsLeft > 0
                                    ? <span className="text-emerald-400 ml-1">· {spotsLeft} spots left</span>
                                    : <span className="text-yellow-400 ml-1">· Waitlist available</span>
                                }
                            </span>
                        </div>
                        {c.trainer && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-gray-800 rounded-full px-2 py-0.5">
                                    Trainer: {c.trainer.firstName} {c.trainer.lastName}
                                </span>
                            </div>
                        )}
                        {c.isRecurring && (
                            <div className="flex items-center gap-2">
                                <Repeat size={14} className="shrink-0" />
                                <span className="text-xs">Recurring class</span>
                            </div>
                        )}
                    </div>

                    {c.description && (
                        <p className="text-sm text-gray-400 border-t border-gray-800 pt-3">{c.description}</p>
                    )}

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    {/* Actions */}
                    {!isPast && c.status !== "CANCELLED" && (
                        <div className="pt-1">
                            {isBooked ? (
                                <Button variant="ghost" onClick={cancelBooking} loading={loading}
                                    className="border-red-900 text-red-400 hover:bg-red-900/20">
                                    Cancel Booking
                                </Button>
                            ) : (
                                <Button onClick={book} loading={loading}>
                                    {spotsLeft > 0 ? "Book Class" : "Join Waitlist"}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Admin actions */}
                    {canManage && (
                        <div className="flex gap-2 pt-1 border-t border-gray-800">
                            <button onClick={() => deleteClass(false)}
                                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                                <Trash2 size={13} /> Delete this class
                            </button>
                            {c.isRecurring && (
                                <button onClick={() => deleteClass(true)}
                                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors ml-auto">
                                    <Trash2 size={13} /> Delete all future
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

