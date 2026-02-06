import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    // Convert tanggalLahir string to Date
    const processedData = data.map((item: any) => ({
      ...item,
      tanggalLahir: new Date(item.tanggalLahir),
    }));

    // Bulk insert
    const result = await prisma.siswa.createMany({
      data: processedData,
      skipDuplicates: true, // Skip jika NISM/NISN/NIK duplikat
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}