"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Icons = {
    Home: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ),
    Users: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    ),
    Academic: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
    ),
    Chart: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    Settings: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
    Logout: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
    ),
    Login: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
    ),
    Menu: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
    ),
    Close: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    )
};

interface SidebarProps {
    user: any;
    handleLogout: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ user, handleLogout, isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const menuItems = [
        { name: "Dashboard", href: "/", icon: <Icons.Home />, color: "blue" },
        { name: "Data Siswa", href: "/siswa", icon: <Icons.Users />, color: "blue" },
        { name: "Data Guru", href: "/guru", icon: <Icons.Academic />, color: "purple" },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* MOBILE OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
        fixed inset-y-0 left-0 w-72 bg-[#1e293b] border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/mimh 02.png" alt="Logo" className="w-10 h-10 object-contain" />
                        <div>
                            <h1 className="font-bold text-xl tracking-tight text-white">SIAKAD</h1>
                            <p className="text-xs text-gray-400 uppercase tracking-widest text-white">MIMH 02 Papungan</p>
                        </div>
                    </div>
                    <button
                        className="md:hidden text-gray-400 hover:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <Icons.Close />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">Main Menu</div>

                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-base group
                ${isActive(item.href)
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }
              `}
                        >
                            <span className={`${isActive(item.href) ? 'text-white' : `group-hover:text-${item.color}-400`}`}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    ))}

                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mt-8 mb-2">Laporan</div>
                    <Link
                        href="/rekap"
                        onClick={() => setIsOpen(false)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-base text-left ${isActive('/rekap') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:bg-gray-800 hover:text-green-400'}`}
                    >
                        <span className={`${isActive('/rekap') ? 'text-white' : 'group-hover:text-green-400'}`}>
                            <Icons.Chart />
                        </span>
                        Statistik
                    </Link>

                    {user && user.role === 'admin' && (
                        <>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mt-8 mb-2">Admin</div>
                            <Link
                                href="/akun"
                                onClick={() => setIsOpen(false)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-base text-left ${isActive('/akun') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:bg-gray-800 hover:text-purple-400'}`}
                            >
                                <span className={`${isActive('/akun') ? 'text-white' : 'group-hover:text-purple-400'}`}>
                                    <Icons.Settings />
                                </span>
                                Manajemen Akun
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-4">
                    {!user && (
                        <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-blue-400 hover:text-white hover:bg-blue-600 transition-all font-bold text-sm w-full rounded-xl bg-blue-600/10 border border-blue-500/20"
                        >
                            <Icons.Login />
                            Login Admin
                        </Link>
                    )}

                    {/* WATERMARK & SPONSORSHIP */}
                    <div className="pt-2">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center mb-4 leading-tight">
                            Copyright © 2026 <br />
                            Powered by <br />
                            <span className="text-blue-500 font-extrabold text-sm">RWM COMPANY</span>
                        </p>
                        <div className="flex items-center justify-center gap-6 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 group">
                            <div className="bg-white/10 p-2 rounded-xl border border-white/5 group-hover:bg-white group-hover:border-blue-500/50 group-hover:shadow-xl group-hover:shadow-blue-500/10 transition-all transform group-hover:scale-110">
                                <img src="/mimh 02.png" alt="MI Logo" className="w-12 h-12 object-contain" />
                            </div>
                            <div className="bg-white/10 p-2 rounded-xl border border-white/5 group-hover:bg-white group-hover:border-blue-500/50 group-hover:shadow-xl group-hover:shadow-blue-500/10 transition-all transform group-hover:scale-110">
                                <img src="/UNISBRENG.png"
                                    alt="Unisba Logo"
                                    className="w-12 h-12 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
