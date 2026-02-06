import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // Pastikan request body ada
    const body = await req.json();
    const { username, password, namaLengkap } = body;

    // 1. Validasi Input
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan Password wajib diisi!" },
        { status: 400 }
      );
    }

    // 2. Cek apakah user sudah ada
    // Kita bungkus prisma dalam try-catch internal
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username sudah terdaftar!" },
        { status: 400 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke Database
    await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        namaLengkap: namaLengkap || "",
        role: "user", // Default registered user is 'user', superadmin must be set manually or via seed
      },
    });

    return NextResponse.json(
      { message: "Registrasi Berhasil!" },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("DETAIL ERROR REGISTER:", error);
    return NextResponse.json(
      { message: "Server Error: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}