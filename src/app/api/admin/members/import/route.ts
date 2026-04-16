import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

// POST /api/admin/members/import  — multipart CSV upload
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return errorResponse("CSV file is required.");

    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return errorResponse("CSV must have a header row and at least one data row.");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));

    const required = ["email", "first_name", "last_name"];
    for (const r of required) {
        if (!headers.includes(r)) return errorResponse(`Missing required column: ${r}`);
    }

    const idx = (col: string) => headers.indexOf(col);

    const results = { imported: 0, skipped: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
        const email = cols[idx("email")]?.toLowerCase();
        const firstName = cols[idx("first_name")];
        const lastName = cols[idx("last_name")];
        const phone = idx("phone") >= 0 ? cols[idx("phone")] : undefined;
        const authNetId = idx("authorize_net_customer_id") >= 0
            ? cols[idx("authorize_net_customer_id")] : undefined;

        if (!email || !firstName || !lastName) {
            results.errors.push(`Row ${i + 1}: missing required fields`);
            results.skipped++;
            continue;
        }

        const exists = await prisma.user.findFirst({
            where: { tenantId: payload!.tenantId, email },
        });
        if (exists) { results.skipped++; continue; }

        // Generate a random temp password — member must reset via invite
        const tempPassword = crypto.randomBytes(16).toString("hex");
        const hashedPw = await hashPassword(tempPassword);

        try {
            const user = await prisma.user.create({
                data: {
                    tenantId: payload!.tenantId,
                    email, firstName, lastName,
                    phone: phone || undefined,
                    hashedPassword: hashedPw,
                    role: Role.MEMBER,
                },
            });

            // Store Authorize.net customer ID if provided
            if (authNetId) {
                await prisma.memberProduct.updateMany({
                    where: { userId: user.id },
                    data: { authNetCustomerId: authNetId },
                });
            }

            results.imported++;
        } catch {
            results.errors.push(`Row ${i + 1}: failed to import ${email}`);
            results.skipped++;
        }
    }

    return successResponse(results);
}
