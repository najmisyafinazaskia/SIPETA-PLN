import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import { ulpData } from "../../data/ulpData";

export default function UlpKabupatenDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || "");
    const [searchTerm, setSearchTerm] = useState("");

    // Find data for this Kabupaten
    const kabData = ulpData.find(d => d.kabupaten === decodedName);
    const ulpList = kabData ? kabData.ulps : [];

    const filteredList = ulpList.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCardClick = (ulpName: string) => {
        navigate(`/dashboard/ulp/unit/${encodeURIComponent(ulpName)}`);
    };

    return (
        <div className="relative rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit min-h-[600px]">
            <div className="p-8 pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight font-outfit">
                        {decodedName}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-1 font-outfit">Daftar Unit Layanan Pelanggan (ULP)</p>
                </div>
            </div>

            <div className="p-8 pb-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-orange-600">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total ULP</p>
                    <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                        {ulpList.length}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                        Unit Layanan ⚡
                    </p>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-6 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <input
                        type="text"
                        placeholder="Cari nama ULP..."
                        className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    {filteredList.map((ulp, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleCardClick(ulp.name)}
                            className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex justify-between items-center group cursor-pointer"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase font-outfit mb-1">
                                    {ulp.name}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-outfit transition-colors group-hover:text-[#0052CC]">
                                    ULP • {decodedName.toUpperCase()}
                                </p>
                            </div>
                            <div className="w-3 h-3 rounded-full bg-[#22AD5C] shadow-[0_0_8px_#22AD5C]"></div>
                        </div>
                    ))}
                    {filteredList.length === 0 && (
                        <div className="py-10 text-center flex flex-col items-center gap-3">
                            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Data tidak ditemukan</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
