import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// --- FUNGSI GET (Agar data Guru bisa muncul di Tabel) ---
export async function GET() {
  try {
    await prisma.$connect();
    const gurus = await prisma.guru.findMany({ orderBy: { id: 'desc' } });
    return NextResponse.json(gurus);
  } catch (error: any) {
    console.error("❌ GET ERROR:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}

// --- FUNGSI POST (Logika asli kamu untuk Bulk Import) ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log untuk debug di terminal
    console.log("📥 API Menerima Request Bulk");

    // Mendeteksi data: apakah array langsung atau di dalam objek
    const rawData = Array.isArray(body) 
      ? body 
      : (body.data || body.gurus || null);

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      console.log("⚠️ Data kosong atau format salah");
      return NextResponse.json({ error: "Data kosong atau format salah" }, { status: 400 });
    }

    // Fungsi konversi angka aman
    const cleanInt = (val: any) => {
      if (val === undefined || val === null || val === "") return null;
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

    console.log(`✅ Berhasil import ${totalCreated} data`);
    return NextResponse.json({ success: true, count: totalCreated });

  } catch (error: any) {
    console.error("❌ IMPORT ERROR:", error.message);
    return NextResponse.json({ error: "Gagal: " + error.message }, { status: 500 });
  }
}

// --- FUNGSI DELETE (Logika asli kamu untuk Kosongkan Data) ---
export async function DELETE() {
  try {
    await prisma.guru.deleteMany({});
    return NextResponse.json({ success: true, message: "Data dikosongkan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}