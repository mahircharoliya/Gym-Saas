import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, sendSMS, classReminderEmail, classReminderSMS } from "@/lib/notifications";

// GET /api/cron/reminders — called by Vercel Cron or external scheduler
// Sends reminders for classes starting in ~24 hours
export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Find classes starting in ~24 hours
    const upcomingClasses = await prisma.gymClass.findMany({
        where: {
            startAt: { gte: in24h, lte: in25h },
            status: "SCHEDULED",
        },
        include: {
            trainer: { select: { firstName: true, lastName: true, email: true, phone: true, emailReminders: true, smsReminders: true } },
            bookings: {
                where: { status: "CONFIRMED" },
                include: {
                    user: { select: { firstName: true, email: true, phone: true, emailReminders: true, smsReminders: true } },
                },
            },
        },
    });

    let sent = 0;

    for (const cls of upcomingClasses) {
        const tenant = await prisma.tenant.findUnique({ where: { id: cls.tenantId } });
        const gymName = tenant?.name ?? "Your Gym";

        // Notify trainer
        if (cls.trainer) {
            if (cls.trainer.emailReminders && cls.trainer.email) {
                const { subject, html } = classReminderEmail({
                    firstName: cls.trainer.firstName,
                    className: cls.name,
                    startAt: cls.startAt,
                    location: cls.location ?? undefined,
                    gymName,
                });
                await sendEmail(cls.trainer.email, subject, html).catch(console.error);
                sent++;
            }
            if (cls.trainer.smsReminders && cls.trainer.phone) {
                const msg = classReminderSMS({ className: cls.name, startAt: cls.startAt, gymName });
                await sendSMS(cls.trainer.phone, msg).catch(console.error);
                sent++;
            }
        }

        // Notify booked members
        for (const booking of cls.bookings) {
            const { user } = booking;
            if (user.emailReminders && user.email) {
                const { subject, html } = classReminderEmail({
                    firstName: user.firstName,
                    className: cls.name,
                    startAt: cls.startAt,
                    location: cls.location ?? undefined,
                    gymName,
                });
                await sendEmail(user.email, subject, html).catch(console.error);
                sent++;
            }
            if (user.smsReminders && user.phone) {
                const msg = classReminderSMS({ className: cls.name, startAt: cls.startAt, gymName });
                await sendSMS(user.phone, msg).catch(console.error);
                sent++;
            }
        }
    }

    return NextResponse.json({ ok: true, classesProcessed: upcomingClasses.length, notificationsSent: sent });
}
