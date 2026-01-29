import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Up3KecamatanDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || "");
    const [searchTerm, setSearchTerm] = useState("");
    const [listDesa, setListDesa] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKecDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/locations/search/${encodeURIComponent(decodedName)}?category=Kecamatan`);
                const json = await response.json();
                if (json.success && json.data.desaList) {
                    setListDesa(json.data.desaList);
                }
            } catch (error) {
                console.error("Error fetching kecamatan detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchKecDetail();
    }, [decodedName]);

    const filteredDesa = listDesa.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleDesaClick = (desaName: string) => {
        navigate(`/dashboard/up3/desa/${encodeURIComponent(desaName)}`);
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
            </div>
        );
    }

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
                        Kecamatan {decodedName}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-1 font-outfit">Daftar Desa / Gampong</p>
                </div>
            </div>

            <div className="p-8 pb-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-purple-600">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Desa / Gampong</p>
                    <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                        {listDesa.length}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                        Distribusi Wilayah
                    </p>
                </div>
            </div>

            <div className="p-8">
                {/* Search Bar */}
                <div className="mb-8 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama desa..."
                            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {filteredDesa.map((desa, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleDesaClick(desa)}
                            className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex justify-between items-center group cursor-pointer"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase font-outfit mb-1">
                                    {desa}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-outfit transition-colors group-hover:text-[#0052CC]">
                                    DESA / GAMPONG
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-[#22AD5C] shadow-[0_0_8px_#22AD5C]"></div>
                            </div>
                        </div>
                    ))}
                    {filteredDesa.length === 0 && (
                        <div className="py-10 text-center flex flex-col items-center gap-3">
                            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Data tidak ditemukan</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
