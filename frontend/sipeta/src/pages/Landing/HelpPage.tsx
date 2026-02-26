import React from "react";
import { Link } from "react-router-dom";
import { ChatIcon } from "../../icons";
import { useTheme } from "../../context/ThemeContext";

interface AdminContact {
    nama: string;
    jabatan: string;
    noHp: string;
}

const adminContacts: AdminContact[] = [
    {
        nama: "Rizka Fadilla",
        jabatan: "Asisten Manager UP2K Aceh",
        noHp: "6285270511503"
    },
    {
        nama: "Najmi Syafina Zaskia",
        jabatan: "IT Support & Developer",
        noHp: "6281360946583"
    },
    {
        nama: "Rahil Thahirah",
        jabatan: "IT Support & Developer",
        noHp: "6285175434221"
    }
];

const HelpPage: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col relative overflow-x-hidden">
            {/* 1. Header/Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-20 border-b border-gray-100 shadow-sm bg-white/80 backdrop-blur-md z-50">
                <Link to="/" className="flex items-center gap-4">
                    <img src="/images/logo/logo-pln.png" alt="Logo PLN" className="h-10 md:h-12 w-auto object-contain" />
                    <div className="h-8 w-[1px] bg-gray-200"></div>
                    <img src="/images/logo/logoDI.png" alt="Danantara Indonesia" className="h-6 md:h-8 w-auto object-contain" />
                </Link>
                <div className="flex items-center">
                    <img src="/images/logo/logo-light.png" alt="SIPEDA Logo Header" className="h-12 md:h-16 w-auto object-contain" />
                </div>
            </nav>

            {/* 2. Content Section */}
            <main className="flex-1 max-w-[1600px] mx-auto w-full py-12 px-4 md:px-20 animate-fadeIn font-outfit">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden min-h-[600px]">
                    <div className="flex flex-col h-full">
                        {/* Header Section */}
                        <div className="p-8 md:p-12 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    Pusat Bantuan
                                </h1>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                                Informasi kontak administrator SIPEDA untuk bantuan teknis, koordinasi data, dan dukungan operasional wilayah Aceh.
                            </p>
                        </div>

                        {/* Contacts Grid */}
                        <div className="p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {adminContacts.map((contact, index) => (
                                    <div
                                        key={index}
                                        className="group relative flex flex-col h-full rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="h-1.5 w-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="p-10 flex flex-col items-center text-center h-full">
                                            <div className="relative mb-8">
                                                <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-inner overflow-hidden border border-slate-100 dark:border-slate-700">
                                                    <img
                                                        src={theme === 'dark' ? '/images/icons/callcenter-dark.png' : '/images/icons/call-center.png'}
                                                        alt="Call Center"
                                                        className="w-16 h-16 object-contain"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <span className="inline-block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                                                    {contact.jabatan}
                                                </span>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-blue-600 transition-colors duration-300 px-4">
                                                    {contact.nama}
                                                </h3>
                                                <div className="space-y-1 pt-2">
                                                    <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2">
                                                        <span className="text-blue-500 text-lg">☏</span>
                                                        {contact.noHp.replace(/^62/, '+62 ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 w-full">
                                                <a
                                                    href={`https://wa.me/${contact.noHp}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="relative flex items-center justify-center gap-3 w-full py-5 rounded-[1.5rem] bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[10px] transition-all duration-300 overflow-hidden hover:scale-[1.02] active:scale-95 group/btn border border-blue-100 dark:border-blue-400/20 shadow-sm hover:shadow-lg hover:shadow-green-500/20"
                                                >
                                                    <div className="absolute inset-0 bg-[#25D366] translate-y-[100%] group-hover/btn:translate-y-[0%] transition-transform duration-300"></div>
                                                    <ChatIcon className="w-5 h-5 relative z-10 group-hover/btn:text-white transition-colors duration-300" />
                                                    <span className="relative z-10 group-hover/btn:text-white transition-colors duration-300">Hubungi via WhatsApp</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 3. Footer */}
            <footer className="bg-[#0052CC] text-white py-6 px-6 md:px-20 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-inner">
                            <img src="/images/logo/logo-pln.png" alt="PLN Logo" className="h-7" />
                            <div className="w-[1px] h-5 bg-gray-200"></div>
                            <img src="/images/logo/logoDI.png" alt="DI Logo" className="h-6" />
                        </div>
                    </div>
                    <p className="hidden lg:block text-blue-50 text-xs font-bold tracking-tight text-center">
                        © 2026 SIPEDA PLN UID Provinsi Aceh, Indonesia. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
                        <Link to="/help" className="hover:text-blue-200 transition-colors">Bantuan</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HelpPage;
