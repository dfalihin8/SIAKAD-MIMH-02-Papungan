"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import BackgroundVideo from "@/components/BackgroundVideo";

// --- ICONS ---
const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const BellIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

const getIconByType = (type: string) => {
    switch (type) {
        case 'system': return <span className="text-xl">🛠️</span>;
        case 'siswa': return <span className="text-xl">👨‍🎓</span>;
        case 'guru': return <span className="text-xl">👩‍🏫</span>;
        case 'alert': return <span className="text-xl">⚠️</span>;
        default: return <span className="text-xl">📢</span>;
    }
};

export default function NotifikasiPage() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Contoh data notifikasi (hardcoded untuk demo)
    const notifications = [
        {
            id: 1,
            type: "system",
            title: "Sistem Diperbarui",
            message: "Patch keamanan terbaru v2.1.0 telah berhasil diinstall.",
            time: "2 Jam yang lalu",
            read: false,
        },
        {
            id: 2,
            type: "siswa",
            title: "Data Siswa Baru",
            message: "Operator menambahkan 3 siswa baru ke Kelas 1.",
            time: "4 Jam yang lalu",
            read: false,
        },
        {
            id: 3,
            type: "guru",
            title: "Pembaruan Data Guru",
            message: "Data sertifikasi Guru untuk 'Budi Santoso' telah diperbarui.",
            time: "Hari ini, 09:30",
            read: true,
        },
        {
            id: 4,
            type: "alert",
            title: "Peringatan Server",
            message: "Penggunaan memori server mencapai 80%. Harap periksa log.",
            time: "Kemarin",
            read: true,
        },
    ];

    const filteredNotifs = activeFilter === "all"
        ? notifications
        : notifications.filter(n => n.type === activeFilter || (activeFilter === "unread" && !n.read));

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
        <div className="flex h-screen bg-transparent text-white font-sans overflow-hidden relative">
            <BackgroundVideo />
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

                <div className="z-10 w-full max-w-4xl space-y-8 mx-auto">

                    {/* HEADER SECTION */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 md:hidden text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group">
                                <div className="p-2 rounded-full bg-gray-800 group-hover:bg-blue-600 transition-all">
                                    <BackIcon />
                                </div>
                                <span className="font-bold text-xs md:text-sm">Kembali</span>
                            </Link>
                        </div>

                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${showProfileMenu ? 'bg-gray-800 ring-1 ring-gray-700' : 'hover:bg-gray-800/50'}`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:block text-left text-white pr-1">
                                        <p className="text-[10px] font-bold leading-tight">{user.username}</p>
                                        <p className="text-[8px] text-gray-400">Admin</p>
                                    </div>
                                    <svg className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {showProfileMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                                        <div className="absolute right-0 mt-2 w-44 bg-[#1e293b] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 text-left">
                                            <div className="p-1">
                                                <Link href="/pengaturan" className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-[10px] font-bold rounded-lg">
                                                    ⚙️ Pengaturan
                                                </Link>
                                                <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 transition-all text-[10px] font-bold rounded-lg">
                                                    🚪 Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col md:flex-row relative z-10">

                        {/* LEFT SIDEBAR FILTERS */}
                        <div className="w-full md:w-64 bg-white/5 border-r border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                                    <BellIcon />
                                </div>
                                <h2 className="font-black text-xl tracking-tight">Notifikasi</h2>
                            </div>

                            <div className="space-y-2">
                                <button onClick={() => setActiveFilter("all")} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                    Semua
                                </button>
                                <button onClick={() => setActiveFilter("unread")} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeFilter === 'unread' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                    Belum Dibaca
                                </button>
                                <div className="pt-4 pb-2 text-[10px] font-bold uppercase text-gray-500 tracking-wider">Filter Kategori</div>
                                <button onClick={() => setActiveFilter("system")} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeFilter === 'system' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                    🛠️ Sistem
                                </button>
                                <button onClick={() => setActiveFilter("alert")} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeFilter === 'alert' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                    ⚠️ Peringatan
                                </button>
                            </div>
                        </div>

                        {/* RIGHT CONTENT LIST */}
                        <div className="flex-1 p-0 md:p-6 bg-[#1e293b]">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700/50 md:border-none md:p-0 md:mb-6">
                                <h3 className="font-bold text-lg text-gray-200">Daftar Pemberitahuan</h3>
                                <button className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                                    <CheckIcon /> Tandai semua dibaca
                                </button>
                            </div>

                            <div className="space-y-4 px-4 md:px-0 overflow-y-auto max-h-[500px]">
                                {filteredNotifs.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500">
                                        <p className="text-4xl mb-4">📭</p>
                                        <p className="text-sm font-medium">Tidak ada notifikasi untuk ditampilkan.</p>
                                    </div>
                                ) : (
                                    filteredNotifs.map(notif => (
                                        <div key={notif.id} className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer flex gap-4 ${notif.read ? 'bg-gray-800/40 border-gray-800 opacity-70' : 'bg-gray-800 border-gray-700 shadow-lg'}`}>
                                            <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${notif.read ? 'bg-gray-700' : 'bg-blue-900/30 ring-1 ring-blue-500/30'}`}>
                                                {getIconByType(notif.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`font-bold text-sm ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h4>
                                                    <span className="text-[10px] text-gray-500 font-medium bg-gray-900 px-2 py-1 rounded-md">{notif.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed">{notif.message}</p>
                                            </div>
                                            {!notif.read && (
                                                <div className="self-center">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
