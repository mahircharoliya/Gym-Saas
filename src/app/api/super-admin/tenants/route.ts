import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// GET /api/super-admin/tenants — all gyms + their admin users
export async function GET(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.SUPER_ADMIN);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";

    const tenants = await prisma.tenant.findMany({
        where: search ? { name: { contains: search, mode: "insensitive" } } : {},
        include: {
            _count: { select: { users: true } },
            users: {
                where: { role: "ADMIN" },
                select: { id: true, email: true, firstName: true, lastName: true },
                take: 1,
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return successResponse(tenants);
}
