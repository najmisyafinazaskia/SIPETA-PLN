import { Link } from "react-router";
import { useEffect, useState } from "react";

const rawApiUrl = API_URL || 'http://localhost:5055';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;


const rawApiUrl = API_URL || 'http://localhost:5000';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

export default function LandingPage() {
  const [stats, setStats] = useState({
    kab: "23",
    kec: "290",
    desa: "6.511",
    dusun: "20.046"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Menggunakan relative path agar melewati Proxy Vite
        const res = await fetch('/api/locations/stats');
        const json = await res.json();
        if (json.success) {
          setStats({
            kab: json.data.summary.totalKabupatenKota.toString(),
            kec: json.data.summary.totalKecamatan.toString(),
            desa: json.data.summary.totalDesa.toLocaleString('id-ID'),
            dusun: json.data.summary.totalDusun.toLocaleString('id-ID')
          });
        }
      } catch (err) {
        console.error("Error fetching landing stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    /* h-screen dan overflow-hidden menjaga tampilan tetap statis satu layar */
    <div className="h-screen w-full bg-white font-sans flex flex-col overflow-hidden relative">

      {/* ELEMEN DEKORASI LATAR BELAKANG: Agar body tidak kosong */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#0052CC 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 1. Header/Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-20 border-b border-gray-100 shadow-sm bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <img src="/images/logo/logo-pln.png" alt="Logo PLN" className="h-10 md:h-12 w-auto object-contain" />
          <div className="h-8 w-[1px] bg-gray-200"></div>
          <img src="/images/logo/logoDI.png" alt="Danantara Indonesia" className="h-6 md:h-8 w-auto object-contain" />
        </div>
        <div className="flex items-center">
          <img src="/images/logo/logo-light.png" alt="SIPETA Logo Header" className="h-12 md:h-16 w-auto object-contain" />
        </div>
      </nav>

      {/* 2. Hero Section Split Layout */}
      <section className="flex-[3] flex flex-row items-center relative z-10">

        {/* SISI KIRI: Informasi Teks dengan Spasi yang Dijauhkan */}
        <div className="w-full md:w-3/5 px-6 md:px-20 flex flex-col items-start text-left">
          {/* Spasi: mb-10 dijauhkan dari teks utama */}
          <div className="bg-blue-100 text-[#0052CC] px-6 py-2.5 rounded-full text-2XL font-black mb-10 border border-blue-200 flex items-center gap-2 shadow-sm uppercase tracking-[0.2em]">
            <span className="animate-pulse">⚡</span> Monitoring Elektrifikasi Desa & Dusun Aceh
          </div>

          {/* Spasi: leading-[1.2] dan mb-10 untuk memberi ruang napas antar baris judul */}
          <h2 className="font-sora text-7xl md:text-7xl font-black text-[#1C2434] mb-12 leading-[1.2]  uppercase tracking-tighter">
            SIPETA <br />
            {/* ( Sistem Informasi Pemetaan  <br />
            Tingkat Elektrifikasi ) <br /> */}
            <span className="text-[#0052CC] not-italic">Provinsi Aceh</span>
          </h2>

          {/* Spasi: mb-14 memberikan jarak jauh sebelum tombol aksi */}
          <p className="max-w-3xl text-gray-500 text-lg md:text-xl mb-10 leading-relaxed font-semibold">
            Sistem Informasi Pemetaan Elektrifikasi Tingkat Desa Provinsi Aceh
          </p>

          <div>
            <Link
              to="/signin"
              className="bg-[#0052CC] hover:bg-[#0041a3] text-white px-16 py-5 rounded-2xl font-black text-2xl flex items-center gap-4 transition-all shadow-2xl shadow-blue-300 hover:-translate-y-1 active:scale-95"
            >
              Mulai Sekarang <span className="text-2xl">→</span>
            </Link>
          </div>
        </div>

        {/* SISI KANAN: Logo Besar - Minimalist Aura Core (With Dynamic Rings) */}
        <div className="hidden md:flex w-2/5 h-full items-center justify-center relative overflow-hidden group">
          <style>
            {`
              @keyframes core-pulse {
                0%, 100% { filter: drop-shadow(0 0 20px rgba(0,82,204,0.25)); transform: scale(1); }
                50% { filter: drop-shadow(0 0 45px rgba(0,82,204,0.45)); transform: scale(1.03); }
              }
              @keyframes orbit-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes orbit-rotate-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes surface-glimmer {
                0% { transform: translateX(-150%) skewX(-20deg); }
                30%, 100% { transform: translateX(150%) skewX(-20deg); }
              }
              @keyframes topo-flow {
                from { background-position: 0% 0%; }
                to { background-position: 100% 100%; }
              }
              @keyframes coord-float {
                0%, 100% { opacity: 0; transform: translateY(10px); }
                50% { opacity: 0.3; transform: translateY(0); }
              }
              @keyframes data-flow {
                0% { transform: translateY(100px); opacity: 0; }
                50% { opacity: 0.4; }
                100% { transform: translateY(-100px); opacity: 0; }
              }
              .topo-bg {
                background-image: url("data:image/svg+xml,%3Csvg width='800' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 200 50 400 100 T 800 100' stroke='rgba(0,82,204,0.05)' fill='transparent'/%3E%3Cpath d='M0 200 Q 300 150 500 200 T 800 200' stroke='rgba(0,82,204,0.05)' fill='transparent'/%3E%3Cpath d='M0 300 Q 150 250 400 300 T 800 300' stroke='rgba(0,82,204,0.05)' fill='transparent'/%3E%3Cpath d='M0 400 Q 400 350 600 400 T 800 400' stroke='rgba(0,82,204,0.05)' fill='transparent'/%3E%3C/svg%3E");
                background-size: 600px 600px;
                animation: topo-flow 60s linear infinite;
              }
              .dot-grid-tech {
                background-image: radial-gradient(rgba(0, 82, 204, 0.1) 1px, transparent 1px);
                background-size: 40px 40px;
              }
              .glimmer-overlay {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.35), transparent);
                z-index: 10; pointer-events: none;
                animation: surface-glimmer 8s ease-in-out infinite;
              }
              .dynamic-orbit {
                position: absolute;
                border: 1px solid transparent;
                border-radius: 50%;
                background: linear-gradient(var(--bg-color), var(--bg-color)) padding-box,
                            conic-gradient(from 0deg, #0052CC, transparent 30%, transparent 70%, #00BFFF) border-box;
                opacity: 0.2;
              }
              .data-node {
                position: absolute;
                width: 2px; height: 2px;
                background: #0052CC;
                border-radius: 50%;
                animation: data-flow 10s linear infinite;
              }
            `}
          </style>

          {/* Deep Professional Background Layers */}
          <div className="absolute inset-0 dot-grid-tech"></div>
          <div className="absolute inset-0 topo-bg opacity-40"></div>

          {/* Subtle Technical Indicators */}
          <div className="absolute top-20 left-20 text-[8px] font-mono text-blue-900/20 flex flex-col gap-1" style={{ animation: 'coord-float 8s ease-in-out infinite' }}>
            <span>LAT: 5.5483° N</span>
            <span>LNG: 95.3238° E</span>
          </div>
          <div className="absolute bottom-20 right-20 text-[8px] font-mono text-blue-900/20 flex flex-col items-end gap-1" style={{ animation: 'coord-float 10s ease-in-out infinite', animationDelay: '2s' }}>
            <span>DATA SOURCE: PLNA-01</span>
            <span>SYSTEM: VERIFIED</span>
          </div>

          {/* Soft Layered Auras */}
          <div className="absolute w-[550px] h-[550px] bg-blue-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[80px] animate-pulse"></div>

          {/* Dynamic Circular Lines (Ultra-Fine) */}
          <div className="dynamic-orbit w-[420px] h-[420px]" style={{ animation: 'orbit-rotate 15s linear infinite', opacity: 0.15 }}></div>
          <div className="absolute w-[360px] h-[360px] border border-blue-500/10 border-dashed rounded-full" style={{ animation: 'orbit-rotate-reverse 25s linear infinite' }}></div>

          <div className="relative z-10 w-[75%] flex items-center justify-center">
            {/* The Logo Container - Pure & Sharp */}
            <div className="relative overflow-hidden p-8 transition-all duration-700" style={{ animation: 'core-pulse 5s ease-in-out infinite' }}>
              <div className="glimmer-overlay"></div>

              <img
                src="/images/logo/logo-light.png"
                alt="SIPETA Main Logo Large"
                className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Minimalist Data Particles (Nodes) */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="data-node"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: 0.1
              }}
            ></div>
          ))}

          {/* Super Subtle Digital Framing (Only at edges) */}
          <div className="absolute top-10 right-10 w-24 h-[1px] bg-gradient-to-l from-blue-500/20 to-transparent"></div>
          <div className="absolute bottom-10 left-10 w-24 h-[1px] bg-gradient-to-r from-blue-500/20 to-transparent"></div>
        </div>
      </section>

      {/* 3. Statistik Wilayah (Panel Data) */}
      <div className="w-full bg-slate-50/50 py-10 border-y border-gray-100 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 font-outfit mb-4">
            {/* Kabupaten / Kota - Link A */}
            <a
              href="https://drive.google.com/file/d/1W06k3JVCslizIz6c4NtLegLcj69OPEZn/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-4xl font-black text-[#0052CC] mb-1">{stats.kab}</span>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center leading-tight">Kabupaten / Kota</span>
            </a>

            {/* Kecamatan - Link A */}
            <a
              href="https://drive.google.com/file/d/1W06k3JVCslizIz6c4NtLegLcj69OPEZn/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center border-l border-gray-200 hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-4xl font-black text-[#0052CC] mb-1">{stats.kec}</span>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center leading-tight">Kecamatan</span>
            </a>

            {/* Desa - Link B */}
            <a
              href="https://docs.google.com/spreadsheets/d/1adGp-e1kufiMGoqBgyK0-6gxPMclWSeCqaNrSb0QrAY/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center border-l border-gray-200 hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-4xl font-black text-[#0052CC] mb-1">{stats.desa}</span>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center leading-tight">Desa</span>
            </a>

            {/* Dusun - Link B (Spreadsheet) */}
            <a
              href="https://docs.google.com/spreadsheets/d/1adGp-e1kufiMGoqBgyK0-6gxPMclWSeCqaNrSb0QrAY/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center border-l border-gray-200 hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-4xl font-black text-[#0052CC] mb-1">{stats.dusun}</span>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center leading-tight">Dusun</span>
            </a>

            {/* UP3 PLN - Link B */}
            <a
              href="https://docs.google.com/spreadsheets/d/1adGp-e1kufiMGoqBgyK0-6gxPMclWSeCqaNrSb0QrAY/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center border-l border-gray-200 hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-4xl font-black text-[#0052CC] mb-1">6</span>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center leading-tight">UP3 PLN</span>
            </a>

            {/* ULP PLN - Link B */}
            <a
              href="https://docs.google.com/spreadsheets/d/1adGp-e1kufiMGoqBgyK0-6gxPMclWSeCqaNrSb0QrAY/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center border-l border-gray-200 hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-4xl font-black text-[#0052CC] mb-1">38</span>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center leading-tight">ULP PLN</span>
            </a>
          </div>

        </div>
        {/* Label Update di pojok kiri bawah panel - disejajarkan dengan tombol Mulai di atas (px-6 md:px-20) */}
        <div className="absolute bottom-4 left-6 md:left-50">
          <span className="text-[#0052CC] text-[13px] font-bold">
            Diupdate : 10 Februari 2026
          </span>
        </div>
      </div>

      {/* 4. Footer Biru Statis */}
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
            © 2026 SIPETA PLN UID Provinsi Aceh, Indonesia. All rights reserved.
          </p>
          <div className="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-blue-200 transition-colors">Bantuan</a>
            <a href="#" className="hover:text-blue-200 transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}