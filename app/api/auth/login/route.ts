import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pastikan path ini benar sesuai lokasi file prisma kamu
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_ilahi_123";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // 1. Cari user di database berdasarkan username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { message: "Username tidak terdaftar" },
        { status: 401 }
      );
    }

    // 2. Cek password (membandingkan input plain text dengan hash di DB)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Password salah!" },
        { status: 401 }
      );
    }

    // 3. Buat Token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        nama: user.namaLengkap,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1d" } // Token berlaku selama 1 hari
    );

    // 4. Kirim response dan simpan token di Cookie
    const response = NextResponse.json({
      message: "Login Berhasil",
      user: {
        id: user.id,
        username: user.username,
        namaLengkap: user.namaLengkap,
        role: user.role
      }
    });

    // Set cookie agar bisa dibaca oleh Middleware
    response.cookies.set("token", token, {
      httpOnly: true, // Keamanan: tidak bisa diakses via Javascript (XSS protection)
      secure: process.env.NODE_ENV === "production", // Hanya aktif di HTTPS saat production
      maxAge: 60 * 60 * 24, // Expired dalam 1 hari (dalam detik)
      path: "/", // Berlaku untuk semua halaman
      sameSite: "lax",
    });

    // Set lastActivity cookie untuk tracking session timeout (10 menit)
    response.cookies.set("lastActivity", Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // Expired dalam 1 hari (dalam detik)
      path: "/",
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}