import React, { useState, useMemo, useEffect } from "react";
import { ChevronRightIcon, SearchIcon, UploadCloudIcon, FileTextIcon, ClockIcon, EditIcon, MapPinIcon, Loader2, ArrowLeftIcon, TrashIcon } from "lucide-react";

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

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-700 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-2">
            <TrashIcon size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hapus Dokumen?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 1.5 DESA VERIFICATION PANEL (Moved from DusunItem)
const DesaVerificationPanel = ({ desaId, desaName, onUpdate }: { desaId: string, desaName: string, onUpdate: () => void }) => {
  const [file, setFile] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<string | null>(null);
  const [uploader, setUploader] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Defined outside useEffect to be reusable
  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/verification/${desaId}`);
      if (res.ok) {
        const data = await res.json();
        setFile(data.fileName);
        setFilePath(data.filePath);
        setLastUpload(new Date(data.updatedAt).toLocaleString());
        setUploader(data.uploadedBy ? data.uploadedBy.name : null);
      } else {
        // Reset if no data found
        setFile(null);
        setFilePath(null);
        setLastUpload(null);
        setUploader(null);
      }
    } catch (err) { console.error(err); }
  }, [desaId, API_URL]);

  // Fetch initial state
  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("dusunName", desaName);
    formData.append("document", selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/verification/upload/${desaId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh data to get the populated uploader name properly
        await fetchStatus();
        setIsEditing(false);
        alert("Dokumen Desa berhasil diunggah!");
        onUpdate();
      } else {
        alert(data.message || "Gagal mengunggah dokumen");
      }
    } catch (err) {
      alert("Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/verification/${desaId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (res.ok) {
        setFile(null);
        setFilePath(null);
        setLastUpload(null);
        setUploader(null);
        setShowDeleteModal(false);
        alert("Dokumen berhasil dihapus");
        onUpdate();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menghapus dokumen");
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

  return (
    <>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDelete}
        isLoading={isLoading}
      />

      <div className="mb-6 p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="application/pdf"
        />

        <div className="flex flex-col gap-4">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <FileTextIcon size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Dokumen Verifikasi Desa</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload Berita Acara untuk Desa {desaName}</p>
              </div>
            </div>
            {file && (
              <span className="px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider border border-green-200 dark:border-green-800">
                Terverifikasi
              </span>
            )}
          </div>

          {/* File Info & Actions same as before but styled for main panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* File Info */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${file ? "bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400" : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"}`}>
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : <FileTextIcon size={24} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {file ? file : "Belum ada dokumen"}
                  </span>
                  {lastUpload ? (
                    <div className="flex flex-col gap-0.5 mt-1.5">
                      <span className="text-xs flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <ClockIcon size={12} /> Terakhir diubah: {lastUpload}
                      </span>
                      {uploader && (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 ml-4">
                          Oleh: {uploader}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic mt-1">Silahkan unggah berita acara desa</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {file && !isEditing ? (
                  <>
                    <button
                      onClick={handleDeleteClick}
                      disabled={isLoading}
                      className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      <TrashIcon size={16} /> Hapus
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      disabled={isLoading}
                      className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-50"
                    >
                      <EditIcon size={16} /> Ganti
                    </button>
                  </>
                ) : (
                  <button
                    onClick={triggerUpload}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sedang Mengunggah...
                      </>
                    ) : isEditing ? (
                      <>
                        <UploadCloudIcon size={18} /> Unggah File Baru
                      </>
                    ) : (
                      <>
                        <UploadCloudIcon size={18} /> Unggah Dokumen
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* PDF Preview */}
          {filePath && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
              <iframe
                src={`${API_URL}/${filePath}`}
                className="w-full h-[1500px] bg-gray-50 dark:bg-gray-900"
                title="Preview Dokumen"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 2. ACCORDION WRAPPER
const Accordion = ({
  title,
  children,
  level = 0,
  defaultOpen = false,
  onClick,
  isVerified
}: {
  title: string,
  children: React.ReactNode,
  level?: number,
  defaultOpen?: boolean,
  onClick?: () => void,
  isVerified?: boolean
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

        <div className="flex items-center gap-2">
          {level === 2 && (
            isVerified ? (
              <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">Sudah Verifikasi</span>
            ) : (
              <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Belum Verifikasi</span>
            )
          )}
          {onClick && level === 2 && (
            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">Buka Detail</span>
          )}
        </div>
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
  const [verifiedDesaIds, setVerifiedDesaIds] = useState<Set<string>>(new Set());

  // Function to fetch all verified IDs
  const fetchVerifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/verification`);
      if (res.ok) {
        const data = await res.json();
        const ids = new Set(data.map((v: any) => v.dusunId));
        setVerifiedDesaIds(ids);
      }
    } catch (err) { console.error(err); }
  };

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
    fetchVerifications();
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
                Verifikasi Desa {selectedDesa.desa.name}
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
                            isVerified={verifiedDesaIds.has(desa.id)}
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
            <DesaVerificationPanel desaId={selectedDesa.desa.id} desaName={selectedDesa.desa.name} onUpdate={fetchVerifications} />
          </div>
        )}
      </div>
    </div>
  );
}
