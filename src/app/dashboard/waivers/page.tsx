"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { renderWaiver } from "@/lib/waiver";

interface SignedWaiver {
    id: string;
    signedAt: string;
    waiver: { title: string; body: string };
}

export default function WaiversPage() {
    const { token, user } = useAuth();
    const [waivers, setWaivers] = useState<SignedWaiver[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/member/waivers", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((json) => { if (json.success) setWaivers(json.data); })
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-black">Signed Waivers</h2>
                <p className="text-sm text-gray-400 mt-0.5">Your signed agreements and liability waivers.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
            ) : waivers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
                    <FileText size={28} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-400">No signed waivers yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {waivers.map((sw) => (
                        <div key={sw.id} className="rounded-xl border border-gray-800 bg-white overflow-hidden">
                            <button
                                onClick={() => setExpanded(expanded === sw.id ? null : sw.id)}
                                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium text-black">{sw.waiver.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Signed {new Date(sw.signedAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "long", day: "numeric",
                                        })}
                                    </p>
                                </div>
                                {expanded === sw.id
                                    ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                                    : <ChevronDown size={16} className="text-gray-400 shrink-0" />
                                }
                            </button>
                            {expanded === sw.id && (
                                <div className="border-t border-gray-800 px-5 py-4">
                                    <div className="rounded-lg bg-gray-950 p-4 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                                        {renderWaiver(sw.waiver.body, {
                                            firstName: user?.firstName ?? "",
                                            lastName: user?.lastName ?? "",
                                            date: new Date(sw.signedAt).toLocaleDateString("en-US", {
                                                year: "numeric", month: "long", day: "numeric",
                                            }),
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

