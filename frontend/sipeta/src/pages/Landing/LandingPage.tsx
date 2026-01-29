import { Link } from "react-router";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LandingPage() {
  const [stats, setStats] = useState({
    kab: "23",
    kec: "290",
    desa: "6.500+"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/locations/stats`);
        const json = await res.json();
        if (json.success) {
          setStats({
            kab: json.data.summary.totalKabupatenKota.toString(),
            kec: json.data.summary.totalKecamatan.toString(),
            desa: json.data.summary.totalDesa.toLocaleString()
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
            SIPEDA <br />
            {/* ( Sistem Informasi Pemetaan  <br />
            Tingkat Elektrifikasi ) <br /> */}
            <span className="text-[#0052CC] not-italic">Provinsi Aceh</span>
          </h2>

          {/* Spasi: mb-14 memberikan jarak jauh sebelum tombol aksi */}
          <p className="max-w-3xl text-gray-500 text-lg md:text-xl mb-10 leading-relaxed font-semibold">
            Sistem Informasi Pemetaan Tingkat Elektrifikasi Desa Provinsi Aceh
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

        {/* SISI KANAN: Logo Besar dengan Efek Glow */}
        <div className="hidden md:flex w-2/5 h-full items-center justify-center relative overflow-hidden">
          {/* Glow Effect di belakang logo agar tidak kosong */}
          <div className="absolute w-[450px] h-[450px] bg-blue-400/10 rounded-full blur-[100px] animate-pulse"></div>
          <img
            src="/images/logo/logo-light.png"
            alt="SIPETA Main Logo Large"
            className="relative z-10 w-[85%] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,82,204,0.15)] transition-transform duration-700 hover:rotate-1"
          />
        </div>
      </section>

      {/* 3. Statistik Wilayah (Panel Data) */}
      <div className="w-full bg-slate-50/50 py-10 border-y border-gray-100 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 font-outfit">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-[#0052CC] mb-1">{stats.kab}</span>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center leading-tight">Kabupaten / Kota</span>
            </div>
            {[stats.kec, stats.desa, '6', '34'].map((val, i) => (
              <div key={i} className="flex flex-col items-center border-l border-gray-200">
                <span className="text-4xl font-black text-[#0052CC] mb-1">{val}</span>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                  {['Kecamatan', 'Desa', 'UP3', 'ULP PLN'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Footer Biru Statis */}
      <footer className="bg-[#0052CC] text-white py-6 px-6 md:px-20 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-inner">
            <img src="/images/logo/logo-pln.png" alt="PLN Logo" className="h-7" />
            <div className="w-[1px] h-5 bg-gray-200"></div>
            <img src="/images/logo/logoDI.png" alt="DI Logo" className="h-6" />
          </div>
          <p className="hidden lg:block text-blue-50 text-xs font-bold tracking-tight">
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