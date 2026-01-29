import { useState, useEffect } from 'react';
import { locationService, LocationData } from '../../services/locationService';

export default function LocationHierarchyPage() {
    const [kabupatenList, setKabupatenList] = useState<string[]>([]);
    const [selectedKabupaten, setSelectedKabupaten] = useState<string>('');
    const [kecamatanList, setKecamatanList] = useState<string[]>([]);
    const [selectedKecamatan, setSelectedKecamatan] = useState<string>('');
    const [desaList, setDesaList] = useState<LocationData[]>([]);
    const [selectedDesa, setSelectedDesa] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Load kabupaten/kota saat component mount
    useEffect(() => {
        loadKabupaten();
    }, []);

    const loadKabupaten = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await locationService.getKabupatenKota();
            setKabupatenList(data);
        } catch (err) {
            setError('Gagal memuat data kabupaten/kota');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleKabupatenClick = async (kabupaten: string) => {
        setSelectedKabupaten(kabupaten);
        setSelectedKecamatan('');
        setDesaList([]);
        setSelectedDesa(null);
        setLoading(true);
        setError('');

        try {
            const data = await locationService.getKecamatan(kabupaten);
            setKecamatanList(data);
        } catch (err) {
            setError('Gagal memuat data kecamatan');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleKecamatanClick = async (kecamatan: string) => {
        setSelectedKecamatan(kecamatan);
        setSelectedDesa(null);
        setLoading(true);
        setError('');

        try {
            const data = await locationService.getDesa(selectedKabupaten, kecamatan);
            setDesaList(data);
        } catch (err) {
            setError('Gagal memuat data desa');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDesaClick = (desa: LocationData) => {
        setSelectedDesa(desa);
    };

    const handleBack = () => {
        if (selectedDesa) {
            setSelectedDesa(null);
        } else if (selectedKecamatan) {
            setSelectedKecamatan('');
            setDesaList([]);
        } else if (selectedKabupaten) {
            setSelectedKabupaten('');
            setKecamatanList([]);
        }
    };

    return (
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 font-outfit uppercase tracking-tight">
                            Data Wilayah Provinsi Aceh
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedKabupaten && (
                                <>
                                    <span className="font-bold text-[#0052CC]">{selectedKabupaten}</span>
                                    {selectedKecamatan && (
                                        <>
                                            {' > '}
                                            <span className="font-bold text-[#0052CC]">{selectedKecamatan}</span>
                                        </>
                                    )}
                                    {selectedDesa && (
                                        <>
                                            {' > '}
                                            <span className="font-bold text-[#0052CC]">{selectedDesa.desa}</span>
                                        </>
                                    )}
                                </>
                            )}
                            {!selectedKabupaten && 'Pilih Kabupaten/Kota untuk melihat detail'}
                        </p>
                    </div>
                    {(selectedKabupaten || selectedKecamatan || selectedDesa) && (
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            ← Kembali
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-8 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="p-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC]"></div>
                </div>
            )}

            {/* Content */}
            <div className="p-8">
                {/* Kabupaten/Kota List */}
                {!selectedKabupaten && !loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {kabupatenList.map((kabupaten, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleKabupatenClick(kabupaten)}
                                className="group p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-100 dark:border-gray-600 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <span className="text-sm font-black text-gray-800 dark:text-white uppercase leading-tight group-hover:text-[#0052CC] transition-colors">
                                            {kabupaten}
                                        </span>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                            Kabupaten/Kota
                                        </p>
                                    </div>
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-[#0052CC] transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Kecamatan List */}
                {selectedKabupaten && !selectedKecamatan && !loading && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-tight">
                            Daftar Kecamatan di {selectedKabupaten}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {kecamatanList.map((kecamatan, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleKecamatanClick(kecamatan)}
                                    className="group p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-green-100 dark:border-gray-600 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <span className="text-sm font-black text-gray-800 dark:text-white uppercase leading-tight group-hover:text-[#22AD5C] transition-colors">
                                                {kecamatan}
                                            </span>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                                Kecamatan
                                            </p>
                                        </div>
                                        <svg
                                            className="w-5 h-5 text-gray-400 group-hover:text-[#22AD5C] transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Desa List */}
                {selectedKecamatan && !selectedDesa && !loading && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-tight">
                            Daftar Desa di Kecamatan {selectedKecamatan}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {desaList.map((desa, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleDesaClick(desa)}
                                    className="group p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border border-purple-100 dark:border-gray-600 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-800 dark:text-white uppercase leading-tight group-hover:text-[#9333EA] transition-colors">
                                            {desa.desa}
                                        </span>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                            Desa/Kelurahan
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                <span className="font-bold">Koordinat:</span>
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                                                {desa.x.toFixed(6)}, {desa.y.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Desa Detail */}
                {selectedDesa && !loading && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 border border-purple-100 dark:border-gray-600 shadow-xl">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 uppercase tracking-tight">
                                {selectedDesa.desa}
                            </h2>

                            <div className="space-y-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Kabupaten/Kota</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedKabupaten}</p>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Kecamatan</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedKecamatan}</p>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Koordinat</p>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Longitude (X)</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white font-mono">
                                                {selectedDesa.x.toFixed(6)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latitude (Y)</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white font-mono">
                                                {selectedDesa.y.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/dashboard/dusun/${selectedDesa._id}`)}
                                    className="block w-full text-center px-6 py-4 bg-white dark:bg-gray-800 border-2 border-[#0052CC] text-[#0052CC] rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all shadow-md mt-4 uppercase tracking-widest text-sm"
                                >
                                    ⚡ Lihat Status Dusun
                                </button>

                                <a
                                    href={`https://www.google.com/maps?q=${selectedDesa.y},${selectedDesa.x}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center px-6 py-4 bg-[#0052CC] text-white rounded-xl font-bold hover:bg-[#003D99] transition-all shadow-lg hover:shadow-xl mt-4"
                                >
                                    📍 Lihat di Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && kabupatenList.length === 0 && !selectedKabupaten && (
                    <div className="py-20 text-center flex flex-col items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <span className="text-4xl">📍</span>
                        <span className="text-gray-400 font-black uppercase text-xs tracking-widest">
                            Tidak ada data lokasi
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                            Pastikan backend sudah berjalan dan data sudah diimport menggunakan script seedLocations.js
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
