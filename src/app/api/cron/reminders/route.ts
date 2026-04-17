import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, sendSMS, classReminderEmail, classReminderSMS } from "@/lib/notifications";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasReminders(u: any) {
    return {
        email: u?.emailReminders ?? true,
        sms: u?.smsReminders ?? false,
    };
}

export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upcomingClasses = await (prisma.gymClass.findMany as any)({
        where: { startAt: { gte: in24h, lte: in25h }, status: "SCHEDULED" },
        include: {
            trainer: true,
            bookings: { where: { status: "CONFIRMED" }, include: { user: true } },
        },
    });

    let sent = 0;

    for (const cls of upcomingClasses) {
        const tenant = await prisma.tenant.findUnique({ where: { id: cls.tenantId } });
        const gymName = tenant?.name ?? "Your Gym";

        if (cls.trainer) {
            const t = cls.trainer;
            const prefs = hasReminders(t);
            if (prefs.email && t.email) {
                const { subject, html } = classReminderEmail({ firstName: t.firstName, className: cls.name, startAt: cls.startAt, location: cls.location ?? undefined, gymName });
                await sendEmail(t.email, subject, html).catch(console.error);
                sent++;
            }
            if (prefs.sms && t.phone) {
                await sendSMS(t.phone, classReminderSMS({ className: cls.name, startAt: cls.startAt, gymName })).catch(console.error);
                sent++;
            }
        }

        for (const booking of cls.bookings) {
            const u = booking.user;
            const prefs = hasReminders(u);
            if (prefs.email && u.email) {
                const { subject, html } = classReminderEmail({ firstName: u.firstName, className: cls.name, startAt: cls.startAt, location: cls.location ?? undefined, gymName });
                await sendEmail(u.email, subject, html).catch(console.error);
                sent++;
            }
            if (prefs.sms && u.phone) {
                await sendSMS(u.phone, classReminderSMS({ className: cls.name, startAt: cls.startAt, gymName })).catch(console.error);
                sent++;
            }
        }
    }

    return NextResponse.json({ ok: true, classesProcessed: upcomingClasses.length, notificationsSent: sent });
}
