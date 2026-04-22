import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Check if DATABASE_URL is available
        if (!process.env.DATABASE_URL) {
            console.error("[GYMS_LIST] DATABASE_URL not found");
            return NextResponse.json(
                { success: false, error: "Database configuration error." },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const gyms = await prisma.tenant.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { slug: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {},
            select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                address: true,
            },
            orderBy: { name: "asc" },
            take: 50,
        });

        return NextResponse.json(
            { success: true, data: { gyms } },
            { status: 200 }
        );
    } catch (err) {
        console.error("[GYMS_LIST] Error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to fetch gyms." },
            { status: 500 }
        );
    }
}
