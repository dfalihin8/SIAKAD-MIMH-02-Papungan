-- CreateTable
CREATE TABLE "Siswa" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_nisn_key" ON "Siswa"("nisn");
