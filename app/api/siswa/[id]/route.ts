import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const siswa = await prisma.siswa.findUnique({
      where: { id: parseInt(id) },
    });

    if (!siswa) {
      return NextResponse.json(
        { error: "Siswa tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(siswa);
  } catch (error: any) {
    console.error("❌ Error GET siswa:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const siswa = await prisma.siswa.update({
      where: { id: parseInt(id) },
      data: {
        namaLengkap: body.namaLengkap,
        nism: body.nism,
        nisn: body.nisn,
        nik: body.nik,
        tempatLahir: body.tempatLahir,
        tanggalLahir: new Date(body.tanggalLahir),
        tingkatRombel: body.tingkatRombel,
        umur: parseInt(body.umur),
        status: body.status,
        jenisKelamin: body.jenisKelamin,
        alamat: body.alamat,
        noTelepon: body.noTelepon || "",
        kebutuhanKhusus: body.kebutuhanKhusus || "",
        disabilitas: body.disabilitas || "",
        nomorKipPip: body.nomorKipPip || "",
        namaAyah: body.namaAyah,
        namaIbu: body.namaIbu,
        nomorKK: body.nomorKK,
      },
    });

    console.log("✅ PUT /api/siswa - Updated ID:", siswa.id);

    return NextResponse.json(siswa);
  } catch (error: any) {
    console.error("❌ Error PUT siswa:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- FUNGSI DELETE (HAPUS SATUAN) ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Pakai await prisma.siswa.delete
    const deletedSiswa = await prisma.siswa.delete({
      where: { id: parseInt(id) }, // Pastikan ID di DB lo emang Int, kalau String hapus parseInt-nya
    });

    console.log("✅ DELETE /api/siswa - Berhasil Hapus ID:", id);

    return NextResponse.json({ 
      success: true, 
      message: `Siswa dengan ID ${id} berhasil dihapus`,
      data: deletedSiswa 
    });
  } catch (error: any) {
    console.error("❌ Error DELETE siswa:", error);
    
    // Jika ID tidak ditemukan di database
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Data tidak ditemukan di database" }, { status: 404 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}