import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse } from "@/lib/api";
import QRCode from "qrcode";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { id } = await params;
    const form = await prisma.signupForm.findUnique({ where: { id } });
    if (!form || form.tenantId !== payload!.tenantId)
        return errorResponse("Form not found.", 404);

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/join/${form.slug}`;

    const buffer = await QRCode.toBuffer(url, {
        type: "png",
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
    });

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "image/png",
            "Content-Disposition": `attachment; filename="qr-${form.slug}.png"`,
            "Cache-Control": "public, max-age=3600",
        },
    });
}
