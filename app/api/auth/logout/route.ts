import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        // Hapus semua cookies yang terkait dengan session
        cookieStore.delete("token");
        cookieStore.delete("lastActivity");

        return NextResponse.json({ success: true, message: "Logout berhasil" });
    } catch (error) {
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}
