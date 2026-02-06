import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return NextResponse.json(notifications);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, isRead } = await req.json();
        if (id) {
            const updated = await prisma.notification.update({
                where: { id: parseInt(id) },
                data: { isRead: isRead ?? true },
            });
            return NextResponse.json(updated);
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { isRead: false },
                data: { isRead: true },
            });
            return NextResponse.json({ success: true });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await prisma.notification.deleteMany();
        return NextResponse.json({ message: "Notifications cleared" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
