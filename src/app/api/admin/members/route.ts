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
    const orderByParam = searchParams.get("orderBy") ?? "createdAt_desc";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const orderBy =
        orderByParam === "firstName" ? { firstName: "asc" as const } :
            orderByParam === "createdAt_asc" ? { createdAt: "asc" as const } :
                { createdAt: "desc" as const };

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
            orderBy: orderBy,
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

// POST /api/admin/members — manually create a member
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const { firstName, lastName, email, phone, role, password } = await req.json();
    if (!firstName || !lastName || !email || !password)
        return errorResponse("firstName, lastName, email and password are required.");

    const exists = await prisma.user.findFirst({
        where: { tenantId: payload!.tenantId, email },
    });
    if (exists) return errorResponse("A member with this email already exists.");

    const { hashPassword } = await import("@/lib/auth");
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            tenantId: payload!.tenantId,
            email, firstName, lastName,
            phone: phone || undefined,
            hashedPassword,
            role: (role as Role) ?? Role.MEMBER,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });

    return successResponse(user, 201);
}
