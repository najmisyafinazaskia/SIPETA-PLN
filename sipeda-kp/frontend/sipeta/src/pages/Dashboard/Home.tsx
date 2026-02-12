import React from "react";
import RegionMap from "./RegionMap";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1C2434] dark:text-white uppercase tracking-tight">
          SIPETA <span className="text-[#0052CC]">Monitoring Utama</span>
        </h1>
      </div>

      {/* Kontainer Peta Utama - Menyatu dalam flow */}
      <div className="relative z-0 w-full h-[650px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <RegionMap
          activeFilters={{ stable: true, warning: true }}
        />
      </div>
    </div>
  );
};

export default Home;