import React from 'react';

interface MapFilterProps {
    showStable: boolean;
    setShowStable: (val: boolean) => void;
    showWarning: boolean;
    setShowWarning: (val: boolean) => void;
    showUp3Markers?: boolean;
    setShowUp3Markers?: (val: boolean) => void;
    selectedLocations: string[];
    toggleLocation: (name: string) => void;
    toggleAllLocations: () => void;
    uniqueLocations: { name: string }[];
    title?: string;
    markerLabel?: string;
}

export default function MapFilter({
    showStable,
    setShowStable,
    showWarning,
    setShowWarning,
    showUp3Markers,
    setShowUp3Markers,
    selectedLocations,
    toggleLocation,
    toggleAllLocations,
    uniqueLocations,
    title = "Wilayah Kab/Kota",
    markerLabel = "Titik Kantor UP3"
}: MapFilterProps) {
    const [searchTerm, setSearchTerm] = React.useState("");

    return (
        <div className="absolute top-6 right-6 z-[1001] bg-white/95 dark:bg-gray-800/95 p-3.5 rounded-xl shadow-xl backdrop-blur-md border border-gray-100 dark:border-gray-700 min-w-[180px] max-w-[210px]">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 bg-[#465FFF] rounded-full"></div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Filter Monitoring</span>
            </div>

            <div className="space-y-2">
                {setShowUp3Markers && (
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={showUp3Markers}
                                    onChange={() => setShowUp3Markers(!showUp3Markers)}
                                    className="peer w-4 h-4 opacity-0 absolute cursor-pointer"
                                />
                                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${showUp3Markers ? 'bg-[#0052CC] border-[#0052CC]' : 'border-gray-300 dark:border-gray-600'}`}>
                                    {showUp3Markers && (
                                        <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{markerLabel}</span>
                        </div>
                        <img src="/assets/icons/ulp_temp.png" alt="ULP" className="w-3 h-4 object-contain" />
                    </label>
                )}

                <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={showStable}
                                onChange={() => setShowStable(!showStable)}
                                className="peer w-4 h-4 opacity-0 absolute cursor-pointer"
                            />
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${showStable ? 'bg-[#22c55e] border-[#22c55e]' : 'border-gray-300 dark:border-gray-600'}`}>
                                {showStable && (
                                    <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                )}
                            </div>
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Terjangkau Listrik</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-sm"></div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={showWarning}
                                onChange={() => setShowWarning(!showWarning)}
                                className="peer w-4 h-4 opacity-0 absolute cursor-pointer"
                            />
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${showWarning ? 'bg-[#f1c40f] border-[#f1c40f]' : 'border-gray-300 dark:border-gray-600'}`}>
                                {showWarning && (
                                    <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                )}
                            </div>
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Belum Terjangkau</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#f1c40f] shadow-sm shadow-yellow-500/50"></div>
                </label>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{title}</span>
                    <button
                        onClick={toggleAllLocations}
                        className="text-[9px] font-bold text-[#465FFF] hover:text-[#3245CC] uppercase tracking-wider"
                    >
                        {selectedLocations.length === uniqueLocations.length ? 'Hide All' : 'Show All'}
                    </button>
                </div>

                <div className="mb-2 relative">
                    <input
                        type="text"
                        placeholder="Cari lokasi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-[10px] py-1.5 px-2 pr-7 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-1 focus:ring-[#465FFF] text-gray-700 dark:text-gray-200"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>

                <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {uniqueLocations
                        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((item, idx) => {
                            const isSelected = selectedLocations.includes(item.name);
                            return (
                                <label key={idx} className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleLocation(item.name)}
                                                className="peer w-3.5 h-3.5 opacity-0 absolute cursor-pointer"
                                            />
                                            <div className={`w-3.5 h-3.5 rounded-sm border transition-all flex items-center justify-center ${isSelected ? 'bg-[#465FFF] border-[#465FFF]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#465FFF]'}`}>
                                                {isSelected && (
                                                    <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase truncate max-w-[120px]" title={item.name}>
                                            {title === "Wilayah ULP" && !item.name.toUpperCase().startsWith("ULP") ? `ULP ${item.name}` : item.name}
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
