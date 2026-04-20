import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymSaaS — Gym Management Platform",
  description: "Modern gym management for growing fitness businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-white text-black antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

