"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";


export default function RekapPage() {
    const [dataSiswa, setDataSiswa] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    // --- ICONS ---
    const BackIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    );

    const PrintIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
    );

    const DownloadIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
    );

    useEffect(() => {
        const loadData = async () => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) setUser(JSON.parse(storedUser));

            setLoading(true);
            try {
                const res = await fetch(`/api/siswa?t=${Date.now()}`, { cache: "no-store" });
                const result = await res.json();
                setDataSiswa(Array.isArray(result) ? result : []);
            } catch (error) {
                console.error("Error load data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const rekapSiswa = useMemo(() => {
        const rombelMap = ["1", "2", "3", "4", "5", "6"];
        const hasil: any = {};
        rombelMap.forEach(tingkat => {
            const filterByClassAndGender = (gender: "L" | "P") => {
                return dataSiswa.filter(s => {
                    const tk = String(s.tingkatRombel || "").trim().toUpperCase();
                    const jk = String(s.jenisKelamin || "").trim().toUpperCase();
                    const isKelasMatch = tk.startsWith(tingkat) || tk.includes(`KELAS ${tingkat}`) || tk.includes(`KLS ${tingkat}`);
                    const isGenderMatch = gender === "L"
                        ? (jk === "L" || jk.startsWith("LAKI"))
                        : (jk === "P" || jk.startsWith("PEREMPUAN"));
                    return isKelasMatch && isGenderMatch;
                }).length;
            };
            hasil[tingkat] = { L: filterByClassAndGender("L"), P: filterByClassAndGender("P") };
        });
        return hasil;
    }, [dataSiswa]);

    const totalL = useMemo(() => dataSiswa.filter(s => String(s.jenisKelamin || "").trim().toUpperCase().startsWith("L")).length, [dataSiswa]);
    const totalP = useMemo(() => dataSiswa.filter(s => String(s.jenisKelamin || "").trim().toUpperCase().startsWith("P")).length, [dataSiswa]);
    const totalAll = dataSiswa.length;

    const handleExportExcel = () => {
        // Create a specific format for the Rekap
        const rows: any[] = [
            ["REKAPITULASI JUMLAH SISWA"],
            ["MI MIFTAHUL HUDA 02 PAPUNGAN"],
            ["TAHUN PELAJARAN 2025/2026"],
            [],
            ["KELAS", "LAKI-LAKI", "PEREMPUAN", "JUMLAH"],
        ];

        ["1", "2", "3", "4", "5", "6"].forEach(k => {
            const l = rekapSiswa[k]?.L || 0;
            const p = rekapSiswa[k]?.P || 0;
            rows.push([`KELAS ${k}`, l, p, l + p]);
        });

        rows.push(["TOTAL", totalL, totalP, totalAll]);

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "REKAP SISWA");
        XLSX.writeFile(workbook, `Rekap_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                {/* BACKGROUND DECORATIONS */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="z-10 w-full max-w-5xl space-y-8 mx-auto">

                    {/* HEADER SECTION */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 md:hidden text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                            <Link href="/siswa" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group">
                                <div className="p-2 rounded-full bg-gray-800 group-hover:bg-blue-600 transition-all">
                                    <BackIcon />
                                </div>
                                <span className="font-bold text-xs md:text-sm">Kembali</span>
                            </Link>
                        </div>

                        <div className="text-center flex-1">
                            <div className="inline-block px-4 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-2">
                                Statistik Akademik
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase mb-2">
                                Rekapitulasi Siswa
                            </h1>
                            <p className="text-gray-400 text-base">MI Miftahul Huda 02 Papungan • Tahun 2025/2026</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <button onClick={() => window.print()} className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 text-gray-300 transition-all" title="Print">
                                    <PrintIcon />
                                </button>
                                <button onClick={handleExportExcel} className="hidden sm:flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all text-base">
                                    <DownloadIcon /> Export
                                </button>
                            </div>


                        </div>
                    </div>

                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                            <div className="absolute -right-4 -bottom-4 text-blue-400/10">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <p className="text-blue-100 font-bold text-xs uppercase tracking-wider mb-2">Total Siswa</p>
                            <h2 className="text-5xl font-black text-white">{loading ? "..." : totalAll}</h2>
                            <p className="mt-4 text-xs text-blue-300 font-bold uppercase">Keseluruhan siswa aktif</p>
                        </div>

                        <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Laki-Laki</p>
                                    <h2 className="text-4xl font-black text-blue-400">{loading ? "..." : totalL}</h2>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/20">
                                    <span className="text-2xl">👨</span>
                                </div>
                            </div>
                            <div className="mt-6 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${(totalL / totalAll) * 100}%` }}></div>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-500 font-bold text-right uppercase">{totalAll > 0 ? ((totalL / totalAll) * 100).toFixed(1) : 0}% Laki-Laki</p>
                        </div>

                        <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Perempuan</p>
                                    <h2 className="text-4xl font-black text-pink-400">{loading ? "..." : totalP}</h2>
                                </div>
                                <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400 border border-pink-500/20">
                                    <span className="text-2xl">👩</span>
                                </div>
                            </div>
                            <div className="mt-6 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div className="bg-pink-500 h-full rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{ width: `${(totalP / totalAll) * 100}%` }}></div>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-500 font-bold text-right uppercase">{totalAll > 0 ? ((totalP / totalAll) * 100).toFixed(1) : 0}% Perempuan</p>
                        </div>
                    </div>

                    {/* MAIN TABLE CARD */}
                    <div className="bg-[#1e293b] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative z-10">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1e293b]">
                            <h3 className="font-bold text-lg text-white">Rincian Per Kelas</h3>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-lg shadow-blue-500/5">Database Live</div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#1e293b]">
                                    <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-white/10">
                                        <th className="p-6">Tingkat Kelas</th>
                                        <th className="p-6 text-center">Putra (L)</th>
                                        <th className="p-6 text-center">Putri (P)</th>
                                        <th className="p-6 text-center text-white bg-blue-500/20 backdrop-blur-md">Total Siswa</th>
                                        <th className="p-6 text-center">Rasio (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {["1", "2", "3", "4", "5", "6"].map((k) => {
                                        const l = rekapSiswa[k]?.L || 0;
                                        const p = rekapSiswa[k]?.P || 0;
                                        const sum = l + p;
                                        const percent = totalAll > 0 ? ((sum / totalAll) * 100).toFixed(1) : 0;

                                        return (
                                            <tr key={k} className="hover:bg-gray-700/30 transition-colors">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center font-bold text-gray-300">
                                                            {k}
                                                        </div>
                                                        <span className="font-bold text-gray-300">Kelas {k}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className="text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded-md">{l}</span>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className="text-pink-400 font-bold bg-pink-400/10 px-3 py-1 rounded-md">{p}</span>
                                                </td>
                                                <td className="p-5 text-center font-black text-white bg-blue-900/10 border-x border-gray-700/50">
                                                    {sum}
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{percent}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-800/80 font-bold">
                                    <tr className="border-t border-gray-700">
                                        <td className="p-5 text-right uppercase tracking-wider text-xs text-gray-400">Total Keseluruhan</td>
                                        <td className="p-5 text-center text-blue-400 text-lg">{totalL}</td>
                                        <td className="p-5 text-center text-pink-400 text-lg">{totalP}</td>
                                        <td className="p-5 text-center text-white bg-blue-600 shadow-inner text-lg">{totalAll}</td>
                                        <td className="p-5"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
