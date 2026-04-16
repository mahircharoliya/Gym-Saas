import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// GET /api/admin/members?search=&role=&status=&page=&limit=
export async function GET(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const role = searchParams.get("role") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const where = {
        tenantId: payload!.tenantId,
        ...(role ? { role: role as Role } : {}),
        ...(search
            ? {
                OR: [
                    { firstName: { contains: search, mode: "insensitive" as const } },
                    { lastName: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {}),
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, role: true, createdAt: true,
                memberProducts: {
                    where: { status: "ACTIVE" },
                    select: { id: true, product: { select: { name: true } } },
                    take: 1,
                },
            },
        }),
        prisma.user.count({ where }),
    ]);

    return successResponse({ users, total, page, limit, pages: Math.ceil(total / limit) });
}
