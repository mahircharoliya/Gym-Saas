"use client";

import { X, Download } from "lucide-react";
import QRCode from "react-qr-code";

interface Props {
    url: string;
    title: string;
    onClose: () => void;
}

export default function QRModal({ url, title, onClose }: Props) {
    function download() {
        const svg = document.getElementById("qr-svg");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `qr-${title.toLowerCase().replace(/\s+/g, "-")}.svg`;
        a.click();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <p className="font-semibold text-black">QR Code</p>
                    <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex justify-center rounded-xl bg-white p-5 mb-4">
                    <QRCode id="qr-svg" value={url} size={200} />
                </div>

                <p className="text-center text-xs text-gray-500 font-mono break-all mb-5">{url}</p>

                <button onClick={download}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                    <Download size={15} /> Download SVG
                </button>
            </div>
        </div>
    );
}

