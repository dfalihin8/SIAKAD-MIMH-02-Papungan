"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        namaLengkap: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    useEffect(() => {
        // Cek auth di client side
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(storedUser);

        // Safety check: jika data user tidak lengkap (misal versi lama tanpa ID), paksa logout
        if (!parsedUser.id) {
            localStorage.removeItem("user");
            router.push("/login");
            return;
        }

        setUser(parsedUser);
        setFormData((prev) => ({
            ...prev,
            username: parsedUser.username || "",
            namaLengkap: parsedUser.namaLengkap || "",
        }));
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            setMessage({ type: "error", text: "Konfirmasi password baru tidak cocok" });
            return;
        }

        if (!formData.currentPassword) {
            setMessage({ type: "error", text: "Password lama wajib diisi untuk keamanan" });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    currentPassword: formData.currentPassword,
                    newUsername: formData.username,
                    newNamaLengkap: formData.namaLengkap,
                    newPassword: formData.newPassword || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal update profile");

            // Update local storage
            const updatedUser = { ...user, ...data.user };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            // Reset sensitive fields
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            }));

            setMessage({ type: "success", text: "Profile berhasil diperbarui" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
                        <p className="text-slate-400 text-sm">Update informasi profil dan keamanan</p>
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 shadow-2xl">

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'error'
                            ? 'bg-red-500/10 border border-red-500/50 text-red-400'
                            : 'bg-green-500/10 border border-green-500/50 text-green-400'
                            }`}>
                            {message.type === 'error' ? (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Profile Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Informasi Profil
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="namaLengkap"
                                        value={formData.namaLengkap}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-600"
                                        placeholder="Nama Lengkap"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-600"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-800 my-6"></div>

                        {/* Security Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Keamanan
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Password Lama <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-slate-600 pr-12"
                                        placeholder="Masukkan password saat ini untuk konfirmasi"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors p-1"
                                    >
                                        {showCurrent ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Password Baru (Opsional)</label>
                                    <div className="relative group">
                                        <input
                                            type={showNew ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-slate-600 pr-12"
                                            placeholder="Biarkan kosong jika tidak diganti"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors p-1"
                                        >
                                            {showNew ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Konfirmasi Password Baru</label>
                                    <div className="relative group">
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            name="confirmNewPassword"
                                            value={formData.confirmNewPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-slate-600 pr-12"
                                            placeholder="Ulangi password baru"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors p-1"
                                        >
                                            {showConfirm ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>Simpan Perubahan</>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
