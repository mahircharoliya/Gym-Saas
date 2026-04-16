"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { Camera, CameraOff } from "lucide-react";

interface Props {
    onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const readerRef = useRef<BrowserQRCodeReader | null>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);
    const [active, setActive] = useState(false);
    const [error, setError] = useState("");

    async function startScanner() {
        setError("");
        try {
            readerRef.current = new BrowserQRCodeReader();
            const devices = await BrowserQRCodeReader.listVideoInputDevices();
            if (devices.length === 0) {
                setError("No camera found.");
                return;
            }
            const deviceId = devices[devices.length - 1].deviceId; // prefer back camera
            controlsRef.current = await readerRef.current.decodeFromVideoDevice(
                deviceId,
                videoRef.current!,
                (result) => {
                    if (result) {
                        onScan(result.getText());
                    }
                }
            );
            setActive(true);
        } catch {
            setError("Camera access denied or unavailable.");
        }
    }

    function stopScanner() {
        controlsRef.current?.stop();
        setActive(false);
    }

    useEffect(() => () => { controlsRef.current?.stop(); }, []);

    return (
        <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-gray-950 border border-gray-800 aspect-square max-w-xs mx-auto">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {!active && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <Camera size={36} className="text-gray-600" />
                        <p className="text-sm text-gray-500">Camera inactive</p>
                    </div>
                )}
                {/* Scan overlay */}
                {active && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-indigo-400 rounded-xl opacity-70" />
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="flex justify-center">
                {active ? (
                    <button onClick={stopScanner}
                        className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                        <CameraOff size={15} /> Stop Scanner
                    </button>
                ) : (
                    <button onClick={startScanner}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 transition-colors">
                        <Camera size={15} /> Start Scanner
                    </button>
                )}
            </div>
        </div>
    );
}
