"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";


export default function SiswaPage() {
    const [dataSiswa, setDataSiswa] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [importing, setImporting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [selectedSiswa, setSelectedSiswa] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    // --- FUNGSI HITUNG UMUR OTOMATIS ---
    const hitungUmurOtomatis = (tanggalLahir: string) => {
        if (!tanggalLahir) return 0;
        const lahir = new Date(tanggalLahir);
        const hariIni = new Date();
        if (isNaN(lahir.getTime())) return 0;

        let umur = hariIni.getFullYear() - lahir.getFullYear();
        const bulan = hariIni.getMonth() - lahir.getMonth();
        if (bulan < 0 || (bulan === 0 && hariIni.getDate() < lahir.getDate())) {
            umur--;
        }
        return umur < 0 ? 0 : umur;
    };

    // --- HANDLER INPUT FORM ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "tanggalLahir") {
            const umurBaru = hitungUmurOtomatis(value);
            setFormData((prev: any) => ({
                ...prev,
                [name]: value,
                umur: umurBaru
            }));
        } else {
            setFormData((prev: any) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const endpoint = "/api/siswa";
            const res = await fetch(`${endpoint}?t=${Date.now()}`, { cache: "no-store" });
            const result = await res.json();

            setDataSiswa(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error load data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        loadData();
    }, []);

    const handleSave = async () => {
        try {
            const method = isEditing ? "PUT" : "POST";
            const endpoint = isEditing ? `/api/siswa/${formData.id}` : `/api/siswa`;
            const res = await fetch(endpoint, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert(`✅ Berhasil ${isEditing ? "Update" : "Tambah"} Data!`);
                setIsModalOpen(false);
                setFormData({});
                loadData();
            } else {
                const err = await res.json();
                alert("❌ Gagal: " + (err.error || "Terjadi kesalahan"));
            }
        } catch (error) {
            alert("❌ Gagal memproses data");
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { cellDates: true });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            const headerRowIndex = rawRows.findIndex(row => row.some(cell => String(cell).toLowerCase().includes("nama")));
            if (headerRowIndex === -1) {
                alert("❌ Header tidak ditemukan!");
                setImporting(false);
                return;
            }
            const headers = rawRows[headerRowIndex].map(h => String(h).trim().toLowerCase().replace(/\s+/g, ''));
            const dataRows = rawRows.slice(headerRowIndex + 1);
            const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k.toLowerCase().replace(/\s+/g, ''))));

            const idxNama = getIdx(["namalengkap", "nama"]);
            const idxNIK = getIdx(["nik"]);
            const idxJK = getIdx(["jeniskelamin", "jk", "l/p"]);
            const idxTempat = getIdx(["tempatlahir", "tempat"]);
            const idxTgl = getIdx(["tanggallahir", "tgl", "tanggal"]);
            const idxAlamat = getIdx(["alamat"]);
            const idxIbu = getIdx(["ibukandung", "ibu"]);
            const idxTelp = getIdx(["notelepon", "hp", "handphone", "nomorhandphone"]);

            // Field Khusus Siswa
            const idxNISM = getIdx(["nism"]);
            const idxNISN = getIdx(["nisn"]);
            const idxRombel = getIdx(["tingkat", "rombel", "kelas"]);
            const idxAyah = getIdx(["ayahkandung", "ayah"]);
            const idxKK = getIdx(["nomorkk", "kk"]);
            const idxStatus = getIdx(["status"]);

            const mappedData = dataRows.map((row: any[]) => {
                const namaLengkap = row[idxNama] ? String(row[idxNama]).trim() : "";
                if (!namaLengkap) return null;

                const rawDate = row[idxTgl];
                const formatDate = (val: any) => {
                    if (!val) return null;
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? null : d.toISOString();
                };

                const tglISO = formatDate(rawDate);
                const umurDihitung = rawDate ? hitungUmurOtomatis(rawDate) : 0;

                return {
                    namaLengkap,
                    nism: String(row[idxNISM] || ""),
                    nisn: String(row[idxNISN] || ""),
                    nik: String(row[idxNIK] || ""),
                    tempatLahir: String(row[idxTempat] || ""),
                    tanggalLahir: tglISO,
                    tingkatRombel: String(row[idxRombel] || ""),
                    umur: umurDihitung,
                    status: String(row[idxStatus] || "Aktif"),
                    jenisKelamin: String(row[idxJK] || "").toUpperCase().startsWith("L") ? "L" : "P",
                    alamat: String(row[idxAlamat] || ""),
                    noTelepon: String(row[idxTelp] || ""),
                    namaAyah: String(row[idxAyah] || ""),
                    namaIbu: String(row[idxIbu] || ""),
                    nomorKK: String(row[idxKK] || ""),
                };
            }).filter(d => d !== null);

            const response = await fetch(`/api/siswa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: mappedData }),
            });
            if (response.ok) { alert(`✅ Import Berhasil!`); loadData(); }
            else { alert(`❌ Gagal Import`); }
        } catch (error) { console.error(error); } finally { setImporting(false); e.target.value = ""; }
    };

    const handleExportExcel = () => {
        const dataToExport = dataSiswa;
        if (dataToExport.length === 0) return alert("Data kosong!");
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SISWA");
        XLSX.writeFile(workbook, `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleDelete = async (id: any) => {
        if (!confirm("Yakin mau hapus data ini?")) return;
        try {
            const res = await fetch(`/api/siswa/${id}`, { method: "DELETE" });
            if (res.ok) { alert("Terhapus!"); loadData(); }
        } catch (error) { alert("Gagal hapus"); }
    };

    const handleDeleteAll = async () => {
        if (!confirm(`BAHAYA! Kamu yakin mau hapus SEMUA data siswa?`)) return;
        try {
            const res = await fetch(`/api/siswa`, { method: "DELETE" });
            if (res.ok) { alert("Dibersihkan!"); loadData(); }
        } catch (error) { alert("Gagal hapus semua"); }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Logout failed on server");
        }
        localStorage.removeItem("user");
        router.push("/login");
        router.refresh();
    };


    return (
        <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden relative">
            <Sidebar
                user={user}
                handleLogout={handleLogout}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                <div className="max-w-full mx-auto space-y-6">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-700 pb-8">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 md:hidden text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                            <div className="flex items-center gap-5">
                                <Link href="/" className="bg-white p-2 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-transform">
                                    <img src="/mimh 02.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase">
                                        Data <span className="text-blue-400">Siswa</span>
                                    </h1>
                                    <p className="text-gray-400 text-xs md:text-sm">MI Miftahul Huda 02 Papungan</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">



                        </div>
                    </div>

                    {/* REMOVED REKAP SECTION (MOVED TO /rekap) */}

                    {/* ACTION BAR */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#1e293b] border border-slate-700 p-6 rounded-3xl shadow-2xl relative z-10">
                        <div className="w-full sm:flex-1 relative">
                            <input className="w-full bg-slate-900 border border-slate-700 p-3 md:p-4 pl-10 md:pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm text-white placeholder-gray-500" placeholder="Cari nama siswa..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center">
                            <button onClick={() => { setFormData({}); setIsEditing(false); setIsModalOpen(true); }} className="flex-1 sm:flex-none px-4 py-2 md:px-5 md:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs md:text-sm">➕ Tambah</button>
                            <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs md:text-sm cursor-pointer">
                                <span>{importing ? "⏳" : "📤 Import"}</span>
                                <input type="file" onChange={handleImportExcel} className="hidden" accept=".xlsx,.xls" />
                            </label>
                            <button onClick={handleExportExcel} className="flex-1 sm:flex-none px-4 py-2 md:px-5 md:py-3 rounded-xl bg-green-600 hover:bg-green-500 font-bold text-xs md:text-sm">📥 Export</button>
                            <button onClick={handleDeleteAll} className="flex-1 sm:flex-none px-4 py-2 md:px-5 md:py-3 rounded-xl bg-red-900/40 hover:bg-red-600 text-red-200 font-bold text-xs md:text-sm border border-red-800/50">🗑️ Kosongkan</button>
                        </div>
                    </div>

                    {/* TABLE / CARD VIEW */}
                    <div className="bg-[#1e293b] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden relative z-10">

                        {/* MOBILE CARD VIEW */}
                        <div className="md:hidden grid grid-cols-1 gap-4 p-4 max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-gray-500 py-10">📡 Memuat data...</p>
                            ) : dataSiswa.filter((d) => (d.namaLengkap || "").toLowerCase().includes(search.toLowerCase()))
                                // --- LOGIKA URUT PER KELAS LALU PER NAMA A-Z ---
                                .sort((a, b) => {
                                    const klsA = String(a.tingkatRombel || "").toLowerCase();
                                    const klsB = String(b.tingkatRombel || "").toLowerCase();

                                    const compareKelas = klsA.localeCompare(klsB, undefined, { numeric: true });

                                    if (compareKelas !== 0) return compareKelas;

                                    const namaA = (a.namaLengkap || "").toLowerCase();
                                    const namaB = (b.namaLengkap || "").toLowerCase();
                                    return namaA.localeCompare(namaB);
                                })
                                .map((item) => (
                                    <div key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-blue-400 text-lg">{item.namaLengkap}</h3>
                                                <p className="text-xs text-gray-400">{item.nisn} | {item.nism}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${item.status === 'Aktif' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {item.status}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Kelas</p>
                                                <p className="font-bold">{item.tingkatRombel}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">L/P</p>
                                                <p className="font-bold">{item.jenisKelamin}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-gray-500 uppercase">Wali</p>
                                                <p className="truncate">{item.namaAyah} / {item.namaIbu}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-2 pt-3 border-t border-slate-700">
                                            <button
                                                onClick={() => { setSelectedSiswa(item); setIsViewModalOpen(true); }}
                                                className="flex-1 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                👁️ Detail
                                            </button>
                                            <button
                                                onClick={() => { setFormData(item); setIsEditing(true); setIsModalOpen(true); }}
                                                className="flex-1 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-600 hover:text-white transition-all"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="flex-1 py-2 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* DESKTOP TABLE VIEW */}
                        <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[600px]">
                            <table className="w-full text-left min-w-[4500px] border-collapse relative">
                                <thead className="bg-[#0f172a] text-gray-300 uppercase text-xs tracking-widest border-b border-slate-700 sticky top-0 z-30">
                                    <tr>
                                        <th className="p-5 text-center w-16 sticky left-0 bg-[#0f172a] z-40">No</th>
                                        <th className="p-5 sticky left-16 bg-[#0f172a] z-40 w-[280px] min-w-[280px] border-r border-slate-700 text-white">Nama Lengkap</th>
                                        <th className="p-5">NISM</th><th className="p-5">NISN</th><th className="p-5">NIK</th><th className="p-5">Tempat Lahir</th>
                                        <th className="p-5">Tgl Lahir</th><th className="p-5">Tingkat - Rombel</th><th className="p-5">Umur</th><th className="p-5">Status</th>
                                        <th className="p-5">L/P</th><th className="p-5">Alamat</th><th className="p-5">No Telepon</th><th className="p-5">Ayah Kandung</th>
                                        <th className="p-5">Ibu Kandung</th><th className="p-5">Nomor KK</th>
                                        <th className="p-5 sticky right-0 bg-[#0f172a] z-40 text-center w-[280px] min-w-[280px] border-l border-r border-slate-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={20} className="p-20 text-center text-gray-500 font-bold animate-pulse">
                                                📡 Memuat data...
                                            </td>
                                        </tr>
                                    ) : dataSiswa
                                        .filter((d) => (d.namaLengkap || "").toLowerCase().includes(search.toLowerCase()))
                                        // --- LOGIKA URUT PER KELAS LALU PER NAMA A-Z ---
                                        .sort((a, b) => {
                                            const klsA = String(a.tingkatRombel || "").toLowerCase();
                                            const klsB = String(b.tingkatRombel || "").toLowerCase();

                                            const compareKelas = klsA.localeCompare(klsB, undefined, { numeric: true });

                                            if (compareKelas !== 0) return compareKelas;

                                            const namaA = (a.namaLengkap || "").toLowerCase();
                                            const namaB = (b.namaLengkap || "").toLowerCase();
                                            return namaA.localeCompare(namaB);
                                        })
                                        .map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-gray-700/30 transition-all text-sm whitespace-nowrap">
                                                {/* Nomor urut tetap rapi 1, 2, 3... */}
                                                <td className="p-5 text-center text-gray-600 sticky left-0 bg-gray-800 z-10">{idx + 1}</td>
                                                <td className="p-5 font-bold sticky left-16 bg-gray-800/95 text-blue-400 border-r border-gray-700 shadow-lg z-10">
                                                    {item.namaLengkap}
                                                </td>
                                                <td className="p-5 text-gray-400">{item.nism}</td>
                                                <td className="p-5 text-gray-400 font-mono">{item.nisn}</td>
                                                <td className="p-5 text-gray-400 font-mono">{item.nik}</td>
                                                <td className="p-5 text-gray-400">{item.tempatLahir}</td>
                                                <td className="p-5 text-gray-400">
                                                    {item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString("id-ID") : "-"}
                                                </td>
                                                <td className="p-5">
                                                    <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded-md border border-blue-800/50">
                                                        {item.tingkatRombel}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-gray-400">{item.umur}</td>
                                                <td className="p-5">
                                                    <span className="text-green-500 font-bold">{item.status}</span>
                                                </td>
                                                <td className="p-5 text-center font-bold">{item.jenisKelamin}</td>
                                                <td className="p-5 text-gray-400 max-w-xs truncate">{item.alamat}</td>
                                                <td className="p-5 text-gray-400">{item.noTelepon}</td>
                                                <td className="p-5 text-gray-400">{item.namaAyah}</td>
                                                <td className="p-5 text-gray-400">{item.namaIbu}</td>
                                                <td className="p-5 text-gray-400 font-mono">{item.nomorKK}</td>
                                                <td className="p-5 sticky right-0 bg-gray-800/95 border-l border-r border-gray-700 shadow-lg z-10">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSiswa(item);
                                                                setIsViewModalOpen(true);
                                                            }}
                                                            className="text-emerald-400 hover:text-emerald-200 uppercase font-black"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const dateVal = item.tanggalLahir ? new Date(item.tanggalLahir).toISOString().split("T")[0] : "";
                                                                setFormData({ ...item, tanggalLahir: dateVal });
                                                                setIsEditing(true);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="text-blue-400 hover:text-blue-200 uppercase font-black"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-300 uppercase font-black">
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MODAL VIEW DETAIL */}
                    {isViewModalOpen && selectedSiswa && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300">
                            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-[2.5rem] p-10 shadow-3xl overflow-y-auto max-h-[90vh] relative animate-in zoom-in duration-300">
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Header Detail */}
                                <div className="flex items-center gap-6 mb-10 border-b border-white/10 pb-8">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-900/40">
                                        {selectedSiswa.namaLengkap?.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{selectedSiswa.namaLengkap}</h2>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            <span className="px-4 py-1.5 bg-blue-900/40 text-blue-400 rounded-full border border-blue-800/50 text-[10px] font-bold uppercase tracking-widest">
                                                Kelas {selectedSiswa.tingkatRombel}
                                            </span>
                                            <span className="px-4 py-1.5 bg-emerald-900/40 text-emerald-400 rounded-full border border-emerald-800/50 text-[10px] font-bold uppercase tracking-widest">
                                                {selectedSiswa.status || "Aktif"}
                                            </span>
                                            <span className="px-4 py-1.5 bg-purple-900/40 text-purple-400 rounded-full border border-purple-800/50 text-[10px] font-bold uppercase tracking-widest">
                                                {selectedSiswa.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    {/* Section 1: Data Identitas */}
                                    <div className="space-y-6">
                                        <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="w-8 h-[2px] bg-blue-600"></span> Identitas Siswa
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">NISM</p>
                                                <p className="text-white font-bold">{selectedSiswa.nism || "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">NISN</p>
                                                <p className="text-white font-bold font-mono tracking-wider">{selectedSiswa.nisn || "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">NIK</p>
                                                <p className="text-white font-bold font-mono tracking-wider">{selectedSiswa.nik || "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Tempat, Tgl Lahir</p>
                                                <p className="text-white font-bold">
                                                    {selectedSiswa.tempatLahir}, {selectedSiswa.tanggalLahir ? new Date(selectedSiswa.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Umur</p>
                                                <p className="text-white font-bold">{selectedSiswa.umur} Tahun</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">No. Telepon</p>
                                                <p className="text-white font-bold">{selectedSiswa.noTelepon || "-"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Data Keluarga & Alamat */}
                                    <div className="space-y-6">
                                        <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="w-8 h-[2px] bg-indigo-600"></span> Informasi Keluarga
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Nama Ayah</p>
                                                <p className="text-white font-bold">{selectedSiswa.namaAyah || "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Nama Ibu Kandung</p>
                                                <p className="text-white font-bold">{selectedSiswa.namaIbu || "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Nomor KK</p>
                                                <p className="text-white font-bold font-mono tracking-wider">{selectedSiswa.nomorKK || "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Alamat Lengkap</p>
                                                <p className="text-white font-bold leading-relaxed">{selectedSiswa.alamat || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-800 flex justify-end">
                                    <button
                                        onClick={() => setIsViewModalOpen(false)}
                                        className="px-10 py-4 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                                    >
                                        Tutup Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* MODAL EDIT / TAMBAH */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
                            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-6xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[95vh] relative animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                                    <h2 className="text-2xl font-black text-blue-500 uppercase tracking-widest">{isEditing ? "Edit" : "Tambah"} Data Siswa</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-[12px]">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-gray-500 uppercase font-black">Nama Lengkap</label>
                                        <input name="namaLengkap" value={formData.namaLengkap || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">NIK</label>
                                        <input name="nik" value={formData.nik || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl font-mono" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">NISM</label>
                                        <input name="nism" value={formData.nism || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">NISN</label>
                                        <input name="nisn" value={formData.nisn || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">Tingkat - Rombel</label>
                                        <input name="tingkatRombel" value={formData.tingkatRombel || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">Tempat Lahir</label>
                                        <input name="tempatLahir" value={formData.tempatLahir || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">Tanggal Lahir</label>
                                        <input type="date" name="tanggalLahir" value={formData.tanggalLahir || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-white" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-blue-500 uppercase font-black">Umur (Otomatis)</label>
                                        <input name="umur" value={formData.umur || 0} readOnly className="w-full bg-gray-800 border border-gray-700 p-4 rounded-xl font-bold text-blue-400 cursor-not-allowed" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">Jenis Kelamin</label>
                                        <select name="jenisKelamin" value={formData.jenisKelamin || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl">
                                            <option value="">Pilih</option>
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">Nomor KK</label>
                                        <input name="nomorKK" value={formData.nomorKK || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">Nama Ayah</label>
                                        <input name="namaAyah" value={formData.namaAyah || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">No Telepon</label>
                                        <input name="noTelepon" value={formData.noTelepon || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">Nama Ibu Kandung</label>
                                        <input name="namaIbu" value={formData.namaIbu || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-500 uppercase font-black">Status Aktif</label>
                                        <select name="status" value={formData.status || "Aktif"} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl font-bold text-green-500">
                                            <option value="Aktif">AKTIF</option>
                                            <option value="Non-Aktif">NON-AKTIF</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 col-span-1 lg:col-span-4">
                                        <label className="text-gray-500 uppercase font-black">Alamat Lengkap</label>
                                        <textarea name="alamat" value={formData.alamat || ""} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl h-20 outline-none" />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-12">
                                    <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20">💾 Simpan Data</button>
                                    <button onClick={() => setIsModalOpen(false)} className="px-10 bg-gray-700 hover:bg-gray-600 p-4 rounded-2xl font-bold uppercase transition-all">Batal</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
