import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 1. AMBIL SEMUA DATA
export async function GET() {
  try {
    const siswa = await prisma.siswa.findMany({
      orderBy: { id: 'desc' }
    });
    console.log('✅ GET /api/siswa - Berhasil mengambil', siswa.length, 'siswa');
    return NextResponse.json(siswa);
  } catch (error: any) {
    console.error('❌ Error GET /api/siswa:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// 2. TAMBAH DATA (SUPPORT SINGLE & BULK IMPORT)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // CEK: Apakah ini data bulk (dari Excel)?
    if (body.data && Array.isArray(body.data)) {
      console.log('📦 Mendeteksi data bulk (Excel), memproses...');
      
      const cleanedData = body.data.map((item: any) => ({
        namaLengkap: String(item.namaLengkap || ''),
        nism: String(item.nism || ''),
        nisn: String(item.nisn || ''),
        nik: String(item.nik || ''),
        tempatLahir: String(item.tempatLahir || ''),
        // Perbaikan: Jangan default ke hari ini jika kosong, biar user tahu datanya kosong di DB
        tanggalLahir: item.tanggalLahir ? new Date(item.tanggalLahir) : null,
        tingkatRombel: String(item.tingkatRombel || ''),
        umur: parseInt(item.umur) || 0,
        status: String(item.status || 'Aktif'),
        jenisKelamin: String(item.jenisKelamin || 'L'),
        alamat: String(item.alamat || ''),
        noTelepon: String(item.noTelepon || ''),
        kebutuhanKhusus: String(item.kebutuhanKhusus || ''),
        disabilitas: String(item.disabilitas || ''),
        nomorKipPip: String(item.nomorKipPip || ''),
        namaAyah: String(item.namaAyah || ''),
        namaIbu: String(item.namaIbu || ''),
        nomorKK: String(item.nomorKK || ''),
      }));

      const bulkResult = await prisma.siswa.createMany({
        data: cleanedData,
        skipDuplicates: true, // Biar gak error kalau ada NIK/NISN ganda
      });

      return NextResponse.json({ success: true, count: bulkResult.count });
    } 

    // JIKA SINGLE DATA (Input Manual dari Modal)
    const singleSiswa = await prisma.siswa.create({
      data: {
        ...body,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        umur: parseInt(body.umur) || 0,
      }
    });

    return NextResponse.json(singleSiswa);

  } catch (error: any) {
    console.error('❌ Error POST /api/siswa:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. HAPUS SEMUA DATA
export async function DELETE() {
  try {
    await prisma.siswa.deleteMany();
    console.log('🗑️ Semua data siswa dikosongkan');
    return NextResponse.json({ message: "Semua data siswa berhasil dihapus" });
  } catch (error: any) {
    console.error('❌ Error DELETE /api/siswa:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}