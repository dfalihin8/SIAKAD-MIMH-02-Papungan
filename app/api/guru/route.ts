import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from '@/lib/notifications';

// Paksa agar tidak di-cache oleh Next.js
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$connect();
    const gurus = await prisma.guru.findMany({ orderBy: { id: 'desc' } });
    return NextResponse.json(gurus);
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await prisma.$connect();
    const body = await req.json();
    const rawData = Array.isArray(body) ? body : (body.data || body.gurus || null);

    if (!rawData || !Array.isArray(rawData)) {
      return NextResponse.json({ error: "Data kosong" }, { status: 400 });
    }

    const cleanInt = (val: any) => {
      if (!val) return null;
      const parsed = parseInt(String(val).replace(/[^0-9]/g, ""));
      return isNaN(parsed) ? null : parsed;
    };

    const batchSize = 50;
    let totalCreated = 0;

    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize).map((g: any) => ({
        namaLengkap: String(g.namaLengkap || "Tanpa Nama"),
        nik: String(g.nik || "").replace(/[^0-9]/g, ""),
        nuptk: g.nuptk ? String(g.nuptk).replace(/[^0-9]/g, "") : null,
        pegid: g.pegid ? String(g.pegid) : null,
        npk: g.npk ? String(g.npk) : null,
        jenisKelamin: g.jenisKelamin || null,
        tempatLahir: g.tempatLahir || null,
        tanggalLahir: g.tanggalLahir && !isNaN(new Date(g.tanggalLahir).getTime())
          ? new Date(g.tanggalLahir)
          : null,
        umur: cleanInt(g.umur),
        alamat: g.alamat || null,
        kualifikasiAkademik: g.kualifikasiAkademik || null,
        tahunLulus: cleanInt(g.tahunLulus),
        statusSertifikasi: g.statusSertifikasi || null,
        tahunSertifikasi: cleanInt(g.tahunSertifikasi),
        statusImpasing: g.statusImpasing || null,
        nrg: g.nrg || null,
        tmt: g.tmt || null,
        noSkAwal: g.noSkAwal || null,
        masaKerja: g.masaKerja || null,
        tugasTambahan: g.tugasTambahan || null,
        nomorHandphone: g.nomorHandphone || g.noTelepon ? String(g.nomorHandphone || g.noTelepon).replace(/[^0-9+]/g, "") : null,
        email: g.email || null,
        noRekening: g.noRekening || null,
        namaIbuKandung: g.namaIbuKandung || null,
        status: g.status || "Aktif",
      }));

      const result = await prisma.guru.createMany({
        data: batch,
        skipDuplicates: true,
      });
      totalCreated += result.count;
    }

    await createNotification("Import Guru", `Berhasil mengimpor ${totalCreated} data guru dari Excel.`, "SUCCESS");
    return NextResponse.json({ success: true, count: totalCreated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// FUNGSI PENGHAPUS (Ini yang bikin tombol Kosongkan jalan)
export async function DELETE() {
  try {
    console.log("🗑️ Mencoba menghapus semua data guru...");
    await prisma.$connect();

    const result = await prisma.guru.deleteMany({});

    await createNotification("Kosongkan Guru", "Semua data guru telah dihapus dari sistem.", "DANGER");
    return NextResponse.json({
      success: true,
      message: `Data dikosongkan (${result.count} baris dihapus)`
    });
  } catch (error: any) {
    console.error("❌ Gagal DELETE:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}