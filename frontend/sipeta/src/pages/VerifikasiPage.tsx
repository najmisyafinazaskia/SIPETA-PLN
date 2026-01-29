import React, { useState, useMemo, useEffect } from "react";
import { ChevronRightIcon, SearchIcon, UploadCloudIcon, FileTextIcon, ClockIcon, EditIcon, MapPinIcon, Loader2, ArrowLeftIcon, EyeIcon } from "lucide-react";

// --- TIPE DATA ---
interface Dusun {
  id: string;
  name: string;
  file: string | null;
  uploadTime: string | null;
}

interface Desa {
  id: string;
  name: string;
  dusun: Dusun[];
}

interface Kecamatan {
  id: string;
  name: string;
  desa: Desa[];
}

interface Kabupaten {
  id: string;
  name: string;
  kecamatan: Kecamatan[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- COMPONENTS ---
// (DusunItem and Accordion remain same, using API_URL)

// 1. DUSUN ITEM (LEAF NODE)
const DusunItem = ({ dusun }: { dusun: Dusun }) => {
  const [file, setFile] = useState<string | null>(dusun.file);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<string | null>(dusun.uploadTime);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch initial state for this specific dusun if available
  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/verification/${dusun.id}`);
        if (res.ok) {
          const data = await res.json();
          setFile(data.fileName);
          setFilePath(data.filePath);
          setLastUpload(new Date(data.updatedAt).toLocaleString());
        }
      } catch (err) { console.error(err); }
    };
    fetchStatus();
  }, [dusun.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("dusunName", dusun.name);
    formData.append("document", selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/verification/upload/${dusun.id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setFile(data.data.fileName);
        setFilePath(data.data.filePath);
        setLastUpload(new Date(data.data.updatedAt).toLocaleString());
        setIsEditing(false);
        alert("Dokumen berhasil diunggah!");
      } else {
        alert(data.message || "Gagal mengunggah dokumen");
      }
    } catch (err) {
      alert("Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePreview = () => {
    if (filePath) {
      window.open(`${API_URL}/${filePath}`, "_blank");
    }
  };

  return (
    <div className="group relative ml-4 md:ml-8 mt-4 p-5 bg-white border border-gray-100 dark:border-gray-800 dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf"
      />

      {/* Connector Line */}
      <div className="absolute -left-6 top-6 w-6 h-[2px] bg-gray-200 dark:bg-gray-700"></div>
      <div className="absolute -left-6 top-0 bottom-6 w-[2px] bg-gray-200 dark:bg-gray-700"></div>

      <div className="flex flex-col gap-4">
        {/* Header Dusun */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MapPinIcon size={14} />
            </div>
            <h4 className="font-bold text-gray-800 dark:text-white text-base tracking-tight">{dusun.name}</h4>
          </div>
          {file && (
            <span className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-100">
              Terverifikasi
            </span>
          )}
        </div>

        {/* Section Berita Acara */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* File Info */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${file ? "bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400" : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"}`}>
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <FileTextIcon size={24} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {file ? file : "Belum ada dokumen"}
                </span>
                {lastUpload ? (
                  <span className="text-sm flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1.5">
                    <ClockIcon size={14} /> Perubahan terakhir: {lastUpload}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic mt-1">Silahkan unggah berita acara</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {file && !isEditing ? (
                <>
                  <button
                    onClick={handlePreview}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all"
                  >
                    <EyeIcon size={14} /> Lihat Dokumen
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-50"
                  >
                    <EditIcon size={14} /> Ganti File
                  </button>
                </>
              ) : (
                <button
                  onClick={triggerUpload}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Sedang Mengunggah...
                    </>
                  ) : isEditing ? (
                    <>
                      <UploadCloudIcon size={16} /> Unggah File Baru
                    </>
                  ) : (
                    <>
                      <UploadCloudIcon size={16} /> Unggah Dokumen
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. ACCORDION WRAPPER
const Accordion = ({
  title,
  children,
  level = 0,
  defaultOpen = false,
  onClick
}: {
  title: string,
  children: React.ReactNode,
  level?: number,
  defaultOpen?: boolean,
  onClick?: () => void
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (onClick) {
      onClick();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`mb-3 ${level > 0 ? "ml-4 md:ml-8 border-l-2 border-dashed border-gray-200 dark:border-gray-700" : ""}`}>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 group
                ${level === 0
            ? "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900"
            : "hover:bg-white dark:hover:bg-gray-800/50"}
                ${isOpen && level === 0 ? "ring-2 ring-blue-500/5 border-blue-500/20" : ""}
            `}
      >
        <div className="flex items-center gap-5">
          <div className={`
                    w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300
                    ${isOpen
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 rotate-90"
              : "bg-gray-100 text-gray-400 dark:bg-gray-700 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400"}
                `}>
            {onClick && level === 2 ? <MapPinIcon size={16} strokeWidth={3} /> : <ChevronRightIcon size={16} strokeWidth={3} />}
          </div>

          <div className="flex flex-col items-start gap-1">
            <span className={`
                        ${level === 0 ? "text-lg font-black tracking-tight text-gray-800 dark:text-white" : "text-base font-bold text-gray-700 dark:text-gray-300"}
                    `}>
              {title}
            </span>
          </div>
        </div>
        {onClick && level === 2 && (
          <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">Buka Detail</span>
        )}
      </button>

      {!onClick && (
        <div className={`overflow-hidden transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? "max-h-[3000px] opacity-100 pt-3 opacity-100" : "max-h-0 opacity-0"}`}>
          {children}
        </div>
      )}
    </div>
  );
};


export default function VerifikasiPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allData, setAllData] = useState<Kabupaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesa, setSelectedDesa] = useState<{ kab: string, kec: string, desa: Desa } | null>(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/locations/hierarchy`);
        const json = await res.json();
        if (json.success) {
          setAllData(json.data);
        }
      } catch (err) {
        console.error("Error fetching hierarchy:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  // Recursively filter data
  const filteredData = useMemo(() => {
    if (!searchTerm) return allData;

    const lowerSearch = searchTerm.toLowerCase();

    const filterKabupaten = (kab: Kabupaten) => {
      const kecMatches = kab.kecamatan.map(kec => {
        const desaMatches = kec.desa.map(desa => {
          const dusunMatches = desa.dusun.filter(dusun =>
            dusun.name.toLowerCase().includes(lowerSearch)
          );

          if (dusunMatches.length > 0) return { ...desa, dusun: dusunMatches };
          if (desa.name.toLowerCase().includes(lowerSearch)) return desa;
          return null;
        }).filter(Boolean) as Desa[];

        if (desaMatches.length > 0) return { ...kec, desa: desaMatches };
        if (kec.name.toLowerCase().includes(lowerSearch)) return kec;
        return null;
      }).filter(Boolean) as Kecamatan[];

      if (kecMatches.length > 0) return { ...kab, kecamatan: kecMatches };
      if (kab.name.toLowerCase().includes(lowerSearch)) return kab;
      return null;
    };

    return allData.map(filterKabupaten).filter(Boolean) as Kabupaten[];
  }, [searchTerm, allData]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit relative">

      {/* 1. Header & Navigation */}
      <div className="p-8 pb-4">
        {selectedDesa ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSelectedDesa(null)}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeftIcon size={16} /> Kembali
            </button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>{selectedDesa.kab}</span>
                <ChevronRightIcon size={12} />
                <span>{selectedDesa.kec}</span>
              </div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                Daftar Dusun Desa {selectedDesa.desa.name}
              </h1>
            </div>
          </div>
        ) : (
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Verifikasi Dokumen Wilayah
          </h1>
        )}
      </div>

      {/* 2. Content */}
      <div className="px-8 pb-8">
        {!selectedDesa ? (
          <>
            {/* SEARCH VIEW */}
            <div className="flex gap-4 mb-8">
              <div className="relative group w-full">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <SearchIcon size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Cari Kota, Kecamatan, Desa, atau Dusun..."
                  className="w-full pl-12 pr-6 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500/30 outline-none transition-all text-sm font-bold placeholder:text-gray-400 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* HIERARCHY LIST */}
            <div className="space-y-4 pb-4">
              {filteredData.length > 0 ? (
                filteredData.map((kab) => (
                  <Accordion key={kab.id} title={kab.name} level={0} defaultOpen={!!searchTerm}>
                    {kab.kecamatan.map((kec) => (
                      <Accordion key={kec.id} title={`Kec. ${kec.name}`} level={1} defaultOpen={!!searchTerm}>
                        {kec.desa.map((desa) => (
                          <Accordion
                            key={desa.id}
                            title={`Desa ${desa.name}`}
                            level={2}
                            onClick={() => setSelectedDesa({ kab: kab.name, kec: kec.name, desa })}
                          >
                            <div />
                          </Accordion>
                        ))}
                      </Accordion>
                    ))}
                  </Accordion>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <SearchIcon size={24} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Tidak Ditemukan</h3>
                  <p className="text-gray-400 text-sm">Coba kata kunci pencarian yang lain</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* DESA DETAIL VIEW */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-2">
              {selectedDesa.desa.dusun.length > 0 ? (
                selectedDesa.desa.dusun.map((dusun) => (
                  <DusunItem key={dusun.id} dusun={dusun} />
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                  <MapPinIcon size={40} className="text-gray-300" />
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Tidak ada data dusun di desa ini</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
