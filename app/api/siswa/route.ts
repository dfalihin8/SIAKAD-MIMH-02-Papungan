import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$connect();
    const siswa = await prisma.siswa.findMany({ orderBy: { id: 'desc' } });
    return NextResponse.json(siswa);
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await prisma.$connect();
    const body = await request.json();

    // LOGIKA IMPORT EXCEL (BANYAK DATA)
    if (body.data && Array.isArray(body.data)) {
      console.log("🔍 Menerima", body.data.length, "baris dari Excel");

      const seenNisn = new Set();
      const seenNism = new Set();

      const finalData = body.data
        .map((item: any, index: number) => {
          const nismVal = String(item.nism || "").trim();
          const nisnVal = String(item.nisn || "").trim();
          const namaLengkap = String(item.namaLengkap || "").trim();

          // Hanya buang data jika Nama Lengkap benar-benar kosong
          if (!namaLengkap) return null;

          // Cek duplikat dalam satu file Excel agar tidak crash
          if (nismVal && seenNism.has(nismVal)) return null;
          if (nisnVal && seenNisn.has(nisnVal)) return null;

          if (nismVal) seenNism.add(nismVal);
          if (nisnVal) seenNisn.add(nisnVal);

          // SOLUSI AGAR DATA KOSONG TETAP TERBACA:
          // Jika NISM/NISN kosong, kita buatkan ID unik otomatis.
          // Database kamu @unique, jadi tidak boleh ada string kosong ("") yang duplikat.
          const finalNism = nismVal || `MHS-${Date.now()}-${index}`;
          const finalNisn = nisnVal || `NSN-${Date.now()}-${index}`;

          return {
            namaLengkap: namaLengkap,
            nism: finalNism,
            nisn: finalNisn,
            nik: String(item.nik || "-").trim(),
            tempatLahir: String(item.tempatLahir || "-").trim(),
            tanggalLahir: item.tanggalLahir && !isNaN(Date.parse(item.tanggalLahir))
              ? new Date(item.tanggalLahir)
              : new Date("2000-01-01"),
            tingkatRombel: String(item.tingkatRombel || "-").trim(),
            umur: parseInt(item.umur) || 0,
            status: String(item.status || "Aktif").trim(),
            jenisKelamin: String(item.jenisKelamin || "L").trim(),
            alamat: String(item.alamat || "-").trim(),
            noTelepon: String(item.noTelepon || "-").trim(),
            kebutuhanKhusus: String(item.kebutuhanKhusus || "-").trim(),
            disabilitas: String(item.disabilitas || "-").trim(),
            nomorKipPip: String(item.nomorKipPip || "-").trim(),
            namaAyah: String(item.namaAyah || "-").trim(),
            namaIbu: String(item.namaIbu || "-").trim(),
            nomorKK: String(item.nomorKK || "-").trim(),
          };
        })
        .filter((d: any) => d !== null);

      console.log("🚀 Mengirim", finalData.length, "data ke Database...");

      const result = await prisma.siswa.createMany({
        data: finalData as any,
        skipDuplicates: true, // Jika ada NISM yang beneran sama di DB, bakal dilewati
      });

      console.log("✅ Berhasil Simpan:", result.count, "siswa");
      await createNotification("Import Siswa", `Berhasil mengimpor ${result.count} data siswa dari Excel.`, "SUCCESS");
      return NextResponse.json({ success: true, count: result.count });
    }

    // LOGIKA TAMBAH MANUAL (SINGLE DATA)
    const single = await prisma.siswa.create({
      data: {
        ...body,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : new Date(),
        umur: parseInt(body.umur) || 0,
      }
    });
    await createNotification("Tambah Siswa", `Siswa baru bernama ${single.namaLengkap} berhasil ditambahkan.`, "SUCCESS");
    return NextResponse.json(single);

  } catch (error: any) {
    console.error("❌ ERROR DB:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.siswa.deleteMany();
    await createNotification("Kosongkan Data", "Semua data siswa telah dihapus dari sistem.", "DANGER");
    return NextResponse.json({ message: "Cleaned" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}