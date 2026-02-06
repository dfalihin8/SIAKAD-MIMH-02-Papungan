import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const body = await req.json().catch(() => null);

        if (!body) {
            return NextResponse.json({ error: "Invalid Request Body" }, { status: 400 });
        }

        const { id, currentPassword, newUsername, newPassword, newNamaLengkap } = body;

        if (!id) {
            return NextResponse.json({ error: "ID User diperlukan" }, { status: 400 });
        }

        const userDelegate = (prisma as any).user;
        const user = await userDelegate.findUnique({
            where: { id: Number(id) },
        });

        if (!user) {
            return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
        }

        // 1. Verifikasi password lama (Hash Comparison)
        // Kita bandingkan password yang diketik user dengan Hash yang ada di DB
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Password lama salah" }, { status: 401 });
        }

        // 2. Cek Username
        if (newUsername && newUsername !== user.username) {
            const existingUser = await userDelegate.findUnique({
                where: { username: newUsername },
            });
            if (existingUser) {
                return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
            }
        }

        // 3. Siapkan data update
        // Jika ada password baru, Hash dulu sebelum disimpan
        let updatedPassword = user.password;
        if (newPassword) {
            updatedPassword = await bcrypt.hash(newPassword, 10);
        }

        // Update data
        const updatedUser = await userDelegate.update({
            where: { id: Number(id) },
            data: {
                username: newUsername || user.username,
                password: updatedPassword,
                namaLengkap: newNamaLengkap || user.namaLengkap,
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                namaLengkap: updatedUser.namaLengkap
            }
        });

    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}
