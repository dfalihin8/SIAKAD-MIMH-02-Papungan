import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, password } = body;

        if (!id || !password) {
            return NextResponse.json({ error: "ID dan Password wajib diisi" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await (prisma as any).user.update({
            where: { id: Number(id) },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: "Password berhasil direset" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Gagal reset password" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const users = await (prisma as any).user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, username: true, namaLengkap: true, createdAt: true } // Jangan return password
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Gagal fetch users" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await (prisma as any).user.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Gagal hapus user" }, { status: 500 });
    }
}
