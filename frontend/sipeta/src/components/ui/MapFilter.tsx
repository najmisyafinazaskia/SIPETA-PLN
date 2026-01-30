import React from 'react';

interface MapFilterProps {
    showStable: boolean;
    setShowStable: (val: boolean) => void;
    showWarning: boolean;
    setShowWarning: (val: boolean) => void;
    selectedLocations: string[];
    toggleLocation: (name: string) => void;
    toggleAllLocations: () => void;
    uniqueLocations: { name: string }[];
    title?: string;
}

export default function MapFilter({
    showStable,
    setShowStable,
    showWarning,
    setShowWarning,
    selectedLocations,
    toggleLocation,
    toggleAllLocations,
    uniqueLocations,
    title = "Wilayah Kab/Kota"
}: MapFilterProps) {
    return (
        <div className="absolute top-6 right-6 z-[1001] bg-white/95 dark:bg-gray-800/95 p-4 rounded-xl shadow-xl backdrop-blur-md border border-gray-100 dark:border-gray-700 min-w-[200px] max-w-[240px]">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 bg-[#465FFF] rounded-full"></div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Filter Monitoring</span>
            </div>

            <div className="space-y-3">
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
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${showWarning ? 'bg-[#F2C94C] border-[#F2C94C]' : 'border-gray-300 dark:border-gray-600'}`}>
                                {showWarning && (
                                    <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                )}
                            </div>
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Belum Terjangkau</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#F2C94C] shadow-sm shadow-yellow-500/50"></div>
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

                <div className="max-h-[200px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {uniqueLocations.map((item, idx) => {
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
                                        {item.name}
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
