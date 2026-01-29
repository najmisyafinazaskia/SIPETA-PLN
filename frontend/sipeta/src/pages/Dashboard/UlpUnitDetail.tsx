import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import { ulpData } from "../../data/ulpData";

export default function UlpUnitDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || "");
    const [searchTerm, setSearchTerm] = useState("");

    // Find ULP data by searching all kabupatens
    let targetUlp = null;
    let parentKab = "";

    for (const kab of ulpData) {
        const found = kab.ulps.find(u => u.name === decodedName);
        if (found) {
            targetUlp = found;
            parentKab = kab.kabupaten;
            break;
        }
    }

    const kecList = targetUlp ? targetUlp.kecamatans : [];
    const filteredList = kecList.filter(k => k.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCardClick = (kecName: string) => {
        // Pass ULP name as well to help identification next step, or just kecName if unique enough
        // We'll pass just kecName but handle duplicates in next page if needed by searching again
        navigate(`/dashboard/ulp/kecamatan/${encodeURIComponent(kecName)}`);
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
                    <p className="text-lg text-gray-500 font-medium mt-1 font-outfit">Daftar Kecamatan di Wilayah ULP</p>
                </div>
            </div>

            <div className="p-8 pb-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-600">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Kecamatan</p>
                    <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                        {kecList.length}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                        Cakupan Pelayanan ⚡
                    </p>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-6 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <input
                        type="text"
                        placeholder="Cari nama kecamatan..."
                        className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    {filteredList.map((kec, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleCardClick(kec.name)}
                            className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex justify-between items-center group cursor-pointer"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase font-outfit mb-1">
                                    {kec.name}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-outfit transition-colors group-hover:text-[#0052CC]">
                                    KECAMATAN • {parentKab.toUpperCase()}
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
