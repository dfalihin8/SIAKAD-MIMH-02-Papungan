"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import BackgroundVideo from "@/components/BackgroundVideo";
import { useRouter } from "next/navigation";

// --- COMPONENTS ---

// 1. DAFTAR AKUN
const AccountList = ({ users, onDelete, onResetPassword }: any) => {
    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                👥 Daftar Akun Admin
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-700">
                            <th className="p-4">Username</th>
                            <th className="p-4">Nama Lengkap</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm">
                        {users.map((u: any) => (
                            <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="p-4 font-bold text-white">{u.username}</td>
                                <td className="p-4 text-gray-300">{u.namaLengkap || "-"}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button
                                        onClick={() => onResetPassword(u)}
                                        className="px-3 py-1.5 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                                    >
                                        Reset Pass
                                    </button>
                                    <button
                                        onClick={() => onDelete(u.id)}
                                        className="px-3 py-1.5 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-6 text-center text-gray-500 italic">Belum ada data akun</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 2. FORM TAMBAH AKUN
const AddAccountForm = ({ onAdd, loading }: any) => {
    const [form, setForm] = useState({ username: "", password: "", namaLengkap: "" });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(form);
        setForm({ username: "", password: "", namaLengkap: "" });
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 shadow-2xl h-fit">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                ➕ Tambah Akun Baru
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Username</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.username}
                        onChange={e => setForm({ ...form, username: e.target.value })}
                        placeholder="contoh: admin2"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Nama Lengkap</label>
                    <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.namaLengkap}
                        onChange={e => setForm({ ...form, namaLengkap: e.target.value })}
                        placeholder="Nama Admin"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Password</label>
                    <div className="relative">
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pr-12 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="Minimal 6 karakter"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50"
                >
                    {loading ? "Menyimpan..." : "Simpan Akun"}
                </button>
            </form >
        </div >
    );
};

// 3. CARI GURU / REGISTER BY NUPTK
const RegisterByNuptk = ({ onRegister }: any) => {
    const [nuptk, setNuptk] = useState("");
    const [guru, setGuru] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSearch = async () => {
        if (!nuptk) return;
        setSearchLoading(true);
        setGuru(null);
        try {
            // Kita cari dari API guru (perlu endpoint search atau filter)
            // Asumsi kita fetch semua lalu filter client side untuk demo, 
            // ATAU idealnya bikin endpoint search. Kita pake fetch all dulu biar cepet.
            const res = await fetch(`/api/guru`);
            const data = await res.json();
            const found = data.find((g: any) => g.nuptk === nuptk);
            if (found) {
                setGuru(found);
            } else {
                alert("Guru dengan NUPTK tersebut tidak ditemukan.");
            }
        } catch (error) {
            console.error(error);
            alert("Gagal mencari data.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleRegister = () => {
        if (!guru || !password) return;
        // Auto fill username from NUPTK or Name? 
        // User minta "register search based on NUPTK", jadi username = NUPTK atau nama.
        // Kita set username = nuptk biar unik.
        onRegister({
            username: guru.nuptk,
            namaLengkap: guru.namaLengkap,
            password: password
        });
        setGuru(null);
        setNuptk("");
        setPassword("");
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 shadow-2xl h-fit">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🔍 Register via NUPTK
            </h3>
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        value={nuptk}
                        onChange={e => setNuptk(e.target.value)}
                        placeholder="Masukkan NUPTK..."
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searchLoading}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs"
                    >
                        {searchLoading ? "..." : "Cari"}
                    </button>
                </div>

                {guru && (
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-3 animate-in fade-in">
                        <div>
                            <p className="text-xs text-gray-400">Nama Guru</p>
                            <p className="font-bold text-white">{guru.namaLengkap}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">NUPTK</p>
                            <p className="font-mono text-blue-400">{guru.nuptk}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Set Password Login</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pr-12 text-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Password baru..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleRegister}
                            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/40"
                        >
                            Buat Akun Guru
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};

// --- MAIN PAGE ---

export default function ManajemenAkunPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    const loadUsers = async () => {
        try {
            const res = await fetch("/api/auth/users");
            // Kita perlu endpoint ini (GET all users). Nanti kita buat.
            // Kalau belum ada, nanti akan kosong atau error.
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const u = localStorage.getItem("user");
        if (u) {
            const parsed = JSON.parse(u);
            setUser(parsed);
            if (parsed.role !== 'admin') {
                router.push("/"); // Redirect if not admin
            }
        } else {
            router.push("/login");
        }
        loadUsers();
    }, []);

    const handleAddUser = async (newUser: any) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                alert("Akun berhasil dibuat!");
                loadUsers();
            } else {
                const d = await res.json();
                alert(d.error || "Gagal membuat akun");
            }
        } catch (e) {
            alert("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Hapus akun ini?")) return;
        try {
            const res = await fetch(`/api/auth/users?id=${id}`, { method: "DELETE" });
            if (res.ok) loadUsers();
            else alert("Gagal hapus");
        } catch (e) {
            alert("Error");
        }
    };

    const handleResetPassword = async (userToReset: any) => {
        const newPass = prompt(`Masukkan password baru untuk user ${userToReset.username}:`);
        if (!newPass) return;

        try {
            const res = await fetch(`/api/auth/users`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userToReset.id,
                    password: newPass
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Password berhasil direset!");
            } else {
                alert(data.error || "Gagal reset password");
            }
        } catch (e) {
            alert("Error");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden relative">
            <Sidebar
                user={user}
                handleLogout={handleLogout}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />
            {/* Background Video or Gradient */}

            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                {/* DECORATION */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="z-10 w-full max-w-6xl mx-auto space-y-8 relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 md:hidden text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                            <div>
                                <h1 className="text-3xl font-black uppercase text-white">Manajemen Akun</h1>
                                <p className="text-gray-400 text-sm">Kelola data login admin dan guru</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kolom Kiri: Form */}
                        <div className="space-y-8">
                            <RegisterByNuptk onRegister={handleAddUser} />
                            <AddAccountForm onAdd={handleAddUser} loading={loading} />
                        </div>

                        {/* Kolom Kanan: List */}
                        <div className="lg:col-span-2">
                            <AccountList
                                users={users}
                                onDelete={handleDeleteUser}
                                onResetPassword={handleResetPassword}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
