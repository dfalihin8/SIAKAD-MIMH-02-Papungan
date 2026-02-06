import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const userDelegate = (prisma as any).user;

        if (!userDelegate) {
            return NextResponse.json({ error: "Prisma Client out of sync. Restart server/run generate." }, { status: 500 });
        }

        // 1. Create Default Admin
        const admin = await userDelegate.upsert({
            where: { username: "admin" },
            update: {},
            create: {
                username: "admin",
                password: "12345678",
                namaLengkap: "Administrator",
            }
        });

        // 2. Create User 'ghean' (YANG KAMU MINTA)
        const ghean = await userDelegate.upsert({
            where: { username: "ghean" },
            update: { password: "12345678" },
            create: {
                username: "ghean",
                password: "12345678",
                namaLengkap: "Ghean",
            }
        });

        return NextResponse.json({
            success: true,
            message: "Setup Berhasil! User 'ghean' telah dibuat.",
            users: [admin, ghean]
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
