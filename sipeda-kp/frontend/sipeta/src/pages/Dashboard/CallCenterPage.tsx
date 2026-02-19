import React from "react";
import { ChatIcon } from "../../icons";
import { useTheme } from "../../context/ThemeContext";

interface AdminContact {
    nama: string;
    jabatan: string;
    noHp: string;
    unit: string;
}

const adminContacts: AdminContact[] = [
    {
        nama: "Bang Riko",
        jabatan: "Admin UP2K Aceh",
        noHp: "6285270511503",
        unit: "UID ACEH"
    },
    {
        nama: "Najmi Syafina Zaskia",
        jabatan: "IT Support & Developer",
        noHp: "6281360946583",
        unit: "UP3 BANDA ACEH"
    },
    {
        nama: "Rahil Thahirah",
        jabatan: "IT Support & Developer",
        noHp: "6285175434221",
        unit: "PLN ACEH"
    }
];

const CallCenterPage: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="max-w-[1600px] mx-auto pb-12 animate-fadeIn px-4 mt-6 font-outfit">
            {/* Main Wrapper Container */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

                <div className="flex flex-col">
                    {/* Header Section - Integrated into Container */}
                    <div className="p-8 md:p-12 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Pusat Bantuan
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                            Informasi kontak administrator SIPETA untuk bantuan teknis, koordinasi data, dan dukungan operasional wilayah Aceh.
                        </p>
                    </div>

                    {/* Content Section with Padding Inside Container */}
                    <div className="p-8 md:p-12">
                        {/* Contacts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {adminContacts.map((contact, index) => (
                                <div
                                    key={index}
                                    className="group relative flex flex-col h-full rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Card Header Color Stripe */}
                                    <div className="h-1.5 w-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="p-10 flex flex-col items-center text-center h-full">
                                        {/* Centered Profile Image */}
                                        <div className="relative mb-8">
                                            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-inner overflow-hidden border border-slate-100 dark:border-slate-700">
                                                <img
                                                    src={theme === 'dark' ? '/images/icons/callcenter-dark.png' : '/images/icons/call-center.png'}
                                                    alt="Call Center"
                                                    className="w-16 h-16 object-contain"
                                                />
                                            </div>
                                        </div>

                                        {/* Center Info */}
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

                                        {/* Actions */}
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
        </div>
    );
};

export default CallCenterPage;
