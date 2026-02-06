import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // ✅ Tambahkan await agar ID terbaca
    const body = await req.json();
    const updated = await prisma.guru.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : undefined,
        umur: body.umur ? parseInt(body.umur) : undefined,
        tahunLulus: body.tahunLulus ? parseInt(body.tahunLulus) : undefined,
        tahunSertifikasi: body.tahunSertifikasi ? parseInt(body.tahunSertifikasi) : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// --- FUNGSI DELETE (Hapus Satu Per Satu) ---
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // ✅ Tambahkan await agar ID terbaca
    
    await prisma.guru.delete({
      where: { id: parseInt(id) },
    });

    console.log(`✅ Guru dengan ID ${id} berhasil dihapus`);
    
    return NextResponse.json({ message: "Data dihapus" });
  } catch (error: any) {
    console.error("❌ Error DELETE guru:", error);
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}