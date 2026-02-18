import React, { useState, useMemo, useEffect } from "react";
import { ChevronRightIcon, SearchIcon, UploadCloudIcon, FileTextIcon, ClockIcon, EditIcon, MapPinIcon, Loader2, ArrowLeftIcon, TrashIcon, CheckCircle2Icon, XCircleIcon, AlertCircleIcon, ImageIcon, DownloadIcon, XIcon } from "lucide-react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ModernAlert from "../components/ui/ModernAlert";

const _rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = _rawUrl.replace(/\/+$/, '');






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


// --- COMPONENTS ---

// --- HELPERS ---
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Terverifikasi':
      return {
        label: 'Terverifikasi',
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: <CheckCircle2Icon size={14} />
      };
    case 'Tidak Sesuai':
      return {
        label: 'Tidak Sesuai',
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: <XCircleIcon size={14} />
      };
    case 'Sesuai (Perlu Perbaikan)':
      return {
        label: 'Perlu Perbaikan',
        color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        icon: <AlertCircleIcon size={14} />
      };
    case 'Menunggu Verifikasi':
      return {
        label: 'Menunggu',
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: <ClockIcon size={14} />
      };
    default:
      return {
        label: 'Belum Unggah',
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700',
        icon: <UploadCloudIcon size={14} />
      };
  }
};

const getStatusLabel = (status: string) => {
  const config = getStatusConfig(status);
  return (
    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border flex items-center gap-1 ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

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

const StatusActionModal = ({
  isOpen,
  status,
  onClose,
  onConfirm,
  isLoading,
  desaName
}: {
  isOpen: boolean;
  status: string;
  onClose: () => void;
  onConfirm: (message: string) => void;
  isLoading: boolean;
  desaName: string;
}) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) setMessage("");
  }, [isOpen]);

  if (!isOpen) return null;

  const isCorrection = status === 'Sesuai (Perlu Perbaikan)';
  const colorClass = isCorrection ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20" : "text-red-500 bg-red-50 dark:bg-red-900/20";
  const btnClass = isCorrection ? "bg-orange-600 hover:bg-orange-700 shadow-orange-500/30" : "bg-red-600 hover:bg-red-700 shadow-red-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full p-8 border border-gray-100 dark:border-gray-700 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
              {isCorrection ? <AlertCircleIcon size={24} /> : <XCircleIcon size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{status}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Desa {desaName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-lg font-bold text-gray-700 dark:text-gray-300">Deskripsi / Alasan:</label>
            <textarea
              className="w-full p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 focus:border-blue-500/30 outline-none transition-all text-lg font-bold min-h-[220px] dark:text-white"
              placeholder={`Masukkan alasan mengapa dokumen ${status.toLowerCase()}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => onConfirm(message)}
              disabled={isLoading || !message.trim()}
              className={`px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${btnClass}`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Simpan Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CancelConfirmationModal = ({
  isOpen,
  status,
  onClose,
  onConfirm,
  isLoading,
  desaName
}: {
  isOpen: boolean;
  status: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  desaName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-700 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-2">
            <AlertCircleIcon size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {status === 'Terverifikasi' ? 'Batalkan Verifikasi?' : 'Batalkan Status?'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
              Apakah Anda yakin ingin membatalkan {status === 'Terverifikasi' ? 'verifikasi' : 'status kategori'} untuk desa <span className="text-blue-600">{desaName}</span>?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Tidak
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Ya, Batalkan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerificationSuccessModal = ({
  isOpen,
  onClose,
  desaName
}: {
  isOpen: boolean;
  onClose: () => void;
  desaName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-gray-100 dark:border-gray-700 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500 animate-bounce">
            <CheckCircle2Icon size={48} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Berhasil!</h3>
            <p className="text-base text-gray-600 dark:text-gray-400 font-bold">
              Berita acara desa <span className="text-blue-600">{desaName}</span> telah diverifikasi
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-4 rounded-2xl font-black text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/30 transition-all uppercase tracking-widest text-sm"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkUploadKecamatanModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  kecamatanName,
  onShowAlert
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File, skipExisting: boolean) => void;
  isLoading: boolean;
  kecamatanName: string;
  onShowAlert?: (title: string, message: string, type: "success" | "error" | "warning" | "info") => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skipExisting, setSkipExisting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setSkipExisting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Batasan Vercel Serverless Function adalah 4.5MB (kita gunakan 4.4MB untuk margin overhead)
      const MAX_FILE_SIZE = 4.4 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        if (onShowAlert) {
          onShowAlert("File Terlalu Besar", "Ukuran file tidak boleh melebihi 4.4MB untuk menjamin keberhasilan upload", "warning");
        }
        if (e.target) e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-700 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-2">
            <UploadCloudIcon size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Upload Berita Acara Massal</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed px-2">
              Dokumen ini akan diterapkan ke <span className="text-blue-600 font-black">SELURUH DESA</span> di Kecamatan <span className="text-blue-600 font-black">{kecamatanName}</span>.
            </p>
          </div>

          <div className="w-full mt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="application/pdf,image/jpeg,image/png"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-2xl transition-all font-bold 
                ${selectedFile
                  ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:bg-gray-50"}`}
            >
              {selectedFile ? (
                <>
                  <FileTextIcon size={24} className="animate-bounce" />
                  <span className="text-sm truncate max-w-full italic">{selectedFile.name}</span>
                </>
              ) : (
                <>
                  <UploadCloudIcon size={24} className="opacity-50" />
                  <span className="text-sm">Klik untuk pilih file</span>
                </>
              )}
            </button>
          </div>

          {/* Opsi Skip Existing */}
          <div className="w-full mt-2 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={skipExisting}
                  onChange={(e) => setSkipExisting(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-blue-200 transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400 dark:border-gray-600"
                />
                <svg
                  className="absolute h-5 w-5 pointer-events-none stroke-white opacity-0 peer-checked:opacity-100 transition-opacity p-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase leading-none mb-1">Proteksi Dokumen Manual</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-tight">
                  Hanya unggah untuk desa yang belum memiliki dokumen atau sedang error. Dokumen manual tidak akan ditimpa.
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl font-black text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors uppercase text-xs tracking-wider"
            >
              Batal
            </button>
            <button
              onClick={() => selectedFile && onConfirm(selectedFile, skipExisting)}
              disabled={isLoading || !selectedFile}
              className="px-4 py-3 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase text-xs tracking-wider"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "PROSES"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BulkDeleteKecamatanModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  kecamatanName
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  kecamatanName: string;
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Hapus Berita Acara Massal</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed px-2">
              Tindakan ini akan <span className="text-red-600 font-black">MENGHAPUS SELURUH</span> dokumen yang ada di Kecamatan <span className="text-red-600 font-black">{kecamatanName}</span>.
              Data yang dihapus tidak dapat dikembalikan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl font-black text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors uppercase text-xs tracking-wider"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase text-xs tracking-wider"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "YA, HAPUS SEMUA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 1.5 DESA VERIFICATION PANEL (Moved from DusunItem)
const ReplaceConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  desaName
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  desaName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-700 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-2">
            <EditIcon size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ganti Dokumen?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
              Apakah Anda yakin ingin mengganti dokumen untuk desa <span className="text-blue-600">{desaName}</span>? Dokumen yang lama akan digantikan oleh yang baru.
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
              className="px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              Ya, Ganti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const DesaVerificationPanel = ({ desaId, desaName, onUpdate, setVerifiedDesaMap }: {
  desaId: string,
  desaName: string,
  onUpdate: () => void,
  setVerifiedDesaMap: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<string | null>(null);
  const [uploader, setUploader] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Menunggu Verifikasi");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ open: boolean, status: string }>({ open: false, status: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const showAlert = (title: string, message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setAlertConfig({ isOpen: true, title, message, type });
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isUP2K = user?.role === "superadmin";
  const isUP3 = user?.role === "admin";

  const [message, setMessage] = useState<string | null>(null);

  // Defined outside useEffect to be reusable
  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/verification/${desaId}?t=${new Date().getTime()}`);
      if (!res.ok) {
        // Attempt to get error message as text if it's not JSON
        const errorText = await res.text();
        console.error("[FETCH_STATUS_ERR]", errorText);
        return;
      }

      const data = await res.json();
      setFile(data.fileName);
      setFilePath(data.filePath);
      setLastUpload(new Date(data.updatedAt).toLocaleString());
      const uName = data.uploadedBy?.name || "Admin";
      const uUnit = data.uploadedBy?.unit;
      setUploader(uUnit ? `${uUnit} - ${uName}` : uName);
      setStatus(data.status || "Menunggu Verifikasi");
      setMessage(data.message || null);
    } catch (err) {
      console.error(err);
    }
  }, [desaId, API_URL]);

  // Fetch initial state
  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(selectedFile.type)) {
      showAlert("File Tidak Valid", "Hanya file PDF atau Gambar (JPG/PNG) yang diperbolehkan", "warning");
      return;
    }

    // Batasan Vercel Serverless Function adalah 4.5MB (kita gunakan 4.4MB untuk margin overhead)
    const MAX_FILE_SIZE = 4.4 * 1024 * 1024;
    if (selectedFile.size > MAX_FILE_SIZE) {
      showAlert("File Terlalu Besar", "Ukuran file tidak boleh melebihi 4.4MB untuk menjamin keberhasilan upload", "warning");
      if (e.target) e.target.value = '';
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("dusunName", desaName);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/verification/upload/${desaId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        let errorMsg = "Gagal mengunggah dokumen";
        const resClone = res.clone();
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          const text = await resClone.text();
          if (text.includes("Request Entity Too Large")) {
            errorMsg = "File terlalu besar untuk server (Limit 4.5MB di Vercel)";
          } else {
            errorMsg = text.substring(0, 100) || "Gagal mengunggah (Format response tidak dikenali)";
          }
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (data?.data) {
        const v = data.data;
        setFile(v.fileName);
        setFilePath(v.filePath);
        setLastUpload(new Date(v.updatedAt).toLocaleString());

        const uName = v.uploadedBy?.name || user?.name || "Admin";
        const uUnit = v.uploadedBy?.unit || user?.unit;
        setUploader(uUnit ? `${uUnit} - ${uName}` : uName);

        setStatus("Menunggu Verifikasi");
        setMessage(v.message || null);

        setVerifiedDesaMap(prev => ({
          ...prev,
          [desaId]: "Menunggu Verifikasi"
        }));

        setIsEditing(false);
        showAlert("Berhasil!", "Dokumen berhasil diunggah", "success");
      } else {
        throw new Error(data?.message || "Gagal mengunggah dokumen");
      }
    } catch (err: any) {
      console.error("Upload Error:", err);
      showAlert("Gagal!", err.message || "Terjadi kesalahan saat mengunggah", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string, message?: string) => {
    if (!isUP2K) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/verification/status/${desaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          status: newStatus,
          message: message,
          dusunName: desaName
        })
      });

      if (res.ok) {
        setStatus(newStatus);
        setMessage(message || null);
        setShowActionModal({ open: false, status: '' });
        setShowCancelModal(false);
        if (newStatus === 'Terverifikasi') {
          setShowSuccessModal(true);
        }

        // Update global map immediately
        setVerifiedDesaMap(prev => ({
          ...prev,
          [desaId]: newStatus
        }));

        // onUpdate() removed

        // Visual delay to let notifications process
        setLoadingNotif(true);
        setTimeout(() => {
          setLoadingNotif(false);
        }, 1500);

      } else {
        let errorMsg = "Gagal memperbarui status";
        const resClone = res.clone();
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          const text = await resClone.text();
          errorMsg = text.substring(0, 100) || errorMsg;
        }
        showAlert("Gagal!", errorMsg, "error");
      }
    } catch (err) {
      showAlert("Error!", "Gagal menghubungi server", "error");
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
        setStatus("Belum Diunggah");
        setMessage(null);
        setShowDeleteModal(false);
        showAlert("Berhasil!", "Dokumen berhasil dihapus", "success");

        // Use functional state update to ensure we have the latest map
        setVerifiedDesaMap(prev => {
          const newMap = { ...prev };
          delete newMap[desaId];
          return newMap;
        });

        // onUpdate() removed
      } else {
        const data = await res.json();
        showAlert("Gagal!", data.message || "Gagal menghapus dokumen", "error");
      }
    } catch (err) {
      showAlert("Error!", "Gagal menghubungi server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };


  const statusConfig = getStatusConfig(status);

  return (
    <>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDelete}
        isLoading={isLoading}
      />

      <StatusActionModal
        isOpen={showActionModal.open}
        status={showActionModal.status}
        desaName={desaName}
        onClose={() => setShowActionModal({ open: false, status: '' })}
        onConfirm={(msg) => handleStatusUpdate(showActionModal.status, msg)}
        isLoading={isLoading}
      />

      <VerificationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        desaName={desaName}
      />

      <CancelConfirmationModal
        isOpen={showCancelModal}
        status={status}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => handleStatusUpdate('Menunggu Verifikasi')}
        isLoading={isLoading}
        desaName={desaName}
      />

      <ReplaceConfirmationModal
        isOpen={showReplaceModal}
        onClose={() => setShowReplaceModal(false)}
        onConfirm={() => {
          setShowReplaceModal(false);
          setIsEditing(true);
          triggerUpload();
        }}
        isLoading={isLoading}
        desaName={desaName}
      />

      {loadingNotif && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ClockIcon className="text-blue-600 animate-pulse" size={24} />
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Memproses Notifikasi</h4>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Mohon tunggu sebentar...</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="application/pdf,image/jpeg,image/png"
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <FileTextIcon size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Dokumen Verifikasi Desa</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Verifikasi Berita Acara untuk Desa {desaName}</p>
              </div>
            </div>
            {file && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </div>
            )}
          </div>

          {message && (status === 'Tidak Sesuai' || status === 'Sesuai (Perlu Perbaikan)') && (
            <div className={`mt-2 mb-4 p-4 rounded-xl border-l-4 ${status === 'Tidak Sesuai'
              ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/10 dark:text-red-200'
              : 'bg-orange-50 border-orange-500 text-orange-800 dark:bg-orange-900/10 dark:text-orange-200'
              }`}>
              <h5 className="font-bold uppercase text-xs tracking-wider mb-2 flex items-center gap-2 opacity-80">
                <AlertCircleIcon size={16} /> CATATAN VERIFIKATOR:
              </h5>
              <p className="text-lg font-bold leading-relaxed whitespace-pre-wrap ml-7">"{message}"</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${file ? "bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400" : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"}`}>
                  {isLoading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : file?.toLowerCase().endsWith('.pdf') ? (
                    <FileTextIcon size={24} />
                  ) : file ? (
                    <ImageIcon size={24} />
                  ) : (
                    <FileTextIcon size={24} />
                  )}
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
                    <span className="text-xs text-gray-400 italic mt-1">Silakan unggah berita acara desa (Maks. 4.4MB)</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isUP3 && (
                  status === 'Terverifikasi' ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800 rounded-xl text-sm font-bold">
                      <CheckCircle2Icon size={16} /> Dokumen Sudah Terverifikasi
                    </div>
                  ) : file && !isEditing ? (
                    <>
                      <button
                        onClick={handleDeleteClick}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        <TrashIcon size={16} /> Hapus
                      </button>
                      <button
                        onClick={() => setShowReplaceModal(true)}
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
                  )
                )}
                {isUP2K && !file && (
                  <span className="text-sm font-bold text-gray-400 italic">Menunggu Unggahan UP3</span>
                )}
              </div>
            </div>
          </div>

          {isUP2K && file && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <CheckCircle2Icon size={18} />
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white">Kategorikan Dokumen</h5>
                  <span className="text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded border border-blue-100">Role: Super Admin</span>
                </div>

                {['Terverifikasi', 'Tidak Sesuai', 'Sesuai (Perlu Perbaikan)'].includes(status) ? (
                  <div className={`flex flex-col sm:flex-row items-center justify-between p-4 border-2 rounded-2xl gap-4 ${status === 'Terverifikasi'
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-500/20 text-green-700 dark:text-green-400'
                    : status === 'Tidak Sesuai'
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-500/20 text-red-700 dark:text-red-400'
                      : 'bg-orange-50 dark:bg-orange-900/10 border-orange-500/20 text-orange-700 dark:text-orange-400'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg ${status === 'Terverifikasi' ? 'bg-green-500 shadow-green-500/20' :
                        status === 'Tidak Sesuai' ? 'bg-red-500 shadow-red-500/20' :
                          'bg-orange-500 shadow-orange-500/20'
                        }`}>
                        {status === 'Terverifikasi' ? <CheckCircle2Icon size={20} /> :
                          status === 'Tidak Sesuai' ? <XCircleIcon size={20} /> :
                            <AlertCircleIcon size={20} />}
                      </div>
                      <span className="text-sm font-black uppercase tracking-tight">
                        Dokumen {status === 'Terverifikasi' ? 'Sudah Terverifikasi' :
                          status === 'Tidak Sesuai' ? 'Tidak Sesuai' :
                            'Perlu Perbaikan'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 transition-all shadow-sm"
                    >
                      Batalkan {status === 'Terverifikasi' ? 'Verifikasi' : 'Status'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleStatusUpdate('Terverifikasi')}
                      disabled={isLoading || status === 'Terverifikasi'}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-sm transition-all border-2
                                              ${status === 'Terverifikasi'
                          ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-green-500 hover:text-green-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}
                                          `}
                    >
                      <CheckCircle2Icon size={20} />
                      Terverifikasi
                    </button>

                    <button
                      onClick={() => setShowActionModal({ open: true, status: 'Tidak Sesuai' })}
                      disabled={isLoading || status === 'Tidak Sesuai'}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-sm transition-all border-2
                                              ${status === 'Tidak Sesuai'
                          ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-red-500 hover:text-red-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}
                                          `}
                    >
                      <XCircleIcon size={20} />
                      Tidak Sesuai
                    </button>

                    <button
                      onClick={() => setShowActionModal({ open: true, status: 'Sesuai (Perlu Perbaikan)' })}
                      disabled={isLoading || status === 'Sesuai (Perlu Perbaikan)'}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-sm transition-all border-2
                                              ${status === 'Sesuai (Perlu Perbaikan)'
                          ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:border-orange-600 dark:text-orange-400'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-orange-500 hover:text-orange-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}
                                          `}
                    >
                      <AlertCircleIcon size={20} />
                      Sesuai (Perlu Perbaikan)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {filePath && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                {(file?.toLowerCase().endsWith('.pdf') || (filePath && filePath.toLowerCase().includes('.pdf'))) ? (
                  <embed
                    src={`${API_URL}/api/verification/download/${desaId}?preview=true#toolbar=0`}
                    type="application/pdf"
                    className="w-full h-[800px] md:h-[1200px] bg-gray-50 dark:bg-gray-900 border-none rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900/50">
                    <img
                      src={`${API_URL}/api/verification/download/${desaId}?preview=true`}
                      alt="Preview Dokumen"
                      className="max-w-full h-auto rounded-lg mx-auto shadow-sm"
                    />
                  </div>
                )}
              </div>

              <a
                href={`${API_URL}/api/verification/download/${desaId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
              >
                <DownloadIcon size={18} /> Unduh Dokumen ({file?.split('.').pop()?.toUpperCase() || 'FILE'})
              </a>
            </div>
          )}
        </div>
      </div>

      <ModernAlert
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </>
  );
};


const Accordion = ({

  title,
  children,
  level = 0,
  defaultOpen = false,
  onClick,
  onActionClick,
  actionIcon,
  onSecondaryActionClick,
  secondaryActionIcon,
  isVerified,
  status
}: {
  title: string,
  children: React.ReactNode,
  level?: number,
  defaultOpen?: boolean,
  onClick?: () => void,
  onActionClick?: (e: React.MouseEvent) => void,
  actionIcon?: React.ReactNode,
  onSecondaryActionClick?: (e: React.MouseEvent) => void,
  secondaryActionIcon?: React.ReactNode,
  isVerified?: boolean,
  status?: string
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'Terverifikasi':
        return <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">Terverifikasi</span>;
      case 'Tidak Sesuai':
        return <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">Tidak Sesuai</span>;
      case 'Sesuai (Perlu Perbaikan)':
        return <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">Perbaikan</span>;
      default:
        return <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">Menunggu</span>;
    }
  };

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
          {onSecondaryActionClick && secondaryActionIcon && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSecondaryActionClick(e);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100 dark:bg-red-900/20 dark:border-red-800 mr-1"
              title="Hapus Massal (Kecamatan)"
            >
              {secondaryActionIcon}
              <span className="text-[10px] font-black uppercase">Hapus</span>
            </div>
          )}
          {onActionClick && actionIcon && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(e);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 mr-2"
              title="Unggah Massal (Kecamatan)"
            >
              {actionIcon}
              <span className="text-[10px] font-black uppercase">Massal</span>
            </div>
          )}
          {level === 2 && (
            isVerified ? (
              getStatusLabel(status || "")
            ) : (
              <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Belum Unggah</span>
            )
          )}
          {onClick && level === 2 && (
            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">Buka Detail</span>
          )}
        </div>
      </button>

      {!onClick && (
        <div className={`grid transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? "grid-rows-[1fr] opacity-100 pt-3" : "grid-rows-[0fr] opacity-0 pt-0"}`}>
          <div className="overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};


export default function VerifikasiPage() {
  const { user } = useAuth();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [activeKecamatan, setActiveKecamatan] = useState<{ name: string; kab: string } | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, type: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const showAlert = (title: string, message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const handleBulkUpload = async (file: File, skipExisting: boolean = false) => {
    if (!activeKecamatan) return;
    setIsBulkLoading(true);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("kabupaten", activeKecamatan.kab);
      formData.append("kecamatan", activeKecamatan.name);
      formData.append("skipExisting", String(skipExisting));

      const res = await fetch(`${API_URL}/api/verification/upload-kecamatan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (res.ok) {
        setShowBulkModal(false);
        setActiveKecamatan(null);
        fetchVerifications();
        showAlert("Berhasil!", `Dokumen untuk seluruh desa di Kecamatan ${activeKecamatan.name} telah diunggah.`, "success");
      } else {
        let errorMsg = "Gagal upload massal";
        const resClone = res.clone();
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          const text = await resClone.text();
          if (text.includes("Request Entity Too Large")) {
            errorMsg = "Payload massal terlalu besar untuk server (Batas 4.5MB)";
          } else {
            errorMsg = text.substring(0, 100) || errorMsg;
          }
        }
        showAlert("Gagal!", errorMsg, "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error!", "Terjadi kesalahan saat menghubungi server", "error");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!activeKecamatan) return;
    setIsBulkLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/verification/delete-kecamatan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          kabupaten: activeKecamatan.kab,
          kecamatan: activeKecamatan.name
        }),
      });

      if (res.ok) {
        setShowBulkDeleteModal(false);
        setActiveKecamatan(null);
        fetchVerifications();
        showAlert("Dihapus!", `Seluruh dokumen di Kecamatan ${activeKecamatan.name} telah berhasil dihapus.`, "success");
      } else {
        let errorMsg = "Gagal hapus massal";
        const resClone = res.clone();
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          const text = await resClone.text();
          errorMsg = text.substring(0, 100) || errorMsg;
        }
        showAlert("Gagal!", errorMsg, "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error!", "Terjadi kesalahan saat menghubungi server", "error");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });
  const [localSearchValue, setLocalSearchValue] = useState(searchTerm);

  // Sync LOCAL input if URL changes (e.g. Back button)
  useEffect(() => {
    setLocalSearchValue(searchTerm);
  }, [searchTerm]);
  const [allData, setAllData] = useState<Kabupaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const location = useLocation();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const [verifiedDesaMap, setVerifiedDesaMap] = useState<Record<string, string>>({});
  const statusFilter = searchParams.get("status") || "Semua";

  const setStatusFilter = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status && status !== "Semua") {
      newParams.set("status", status);
    } else {
      newParams.delete("status");
    }
    setSearchParams(newParams, { replace: true });
  };

  // Sync selectedDesa to URL params to support refreshing and deep linking
  // while ensuring fresh navigation (without params) starts at the list view


  const counts = useMemo(() => {
    const c = {
      Semua: 0,
      "Terverifikasi": 0,
      "Sesuai (Perlu Perbaikan)": 0,
      "Tidak Sesuai": 0,
      "Menunggu Verifikasi": 0,
      "Belum Diunggah": 0
    };

    allData.forEach(kab => {
      kab.kecamatan.forEach(kec => {
        kec.desa.forEach(desa => {
          c.Semua++;
          const status = verifiedDesaMap[desa.id];
          if (!status) {
            c["Belum Diunggah"]++;
          } else if (status === 'Terverifikasi') {
            c["Terverifikasi"]++;
          } else if (status === 'Sesuai (Perlu Perbaikan)') {
            c["Sesuai (Perlu Perbaikan)"]++;
          } else if (status === 'Tidak Sesuai') {
            c["Tidak Sesuai"]++;
          } else if (status === 'Menunggu Verifikasi') {
            c["Menunggu Verifikasi"]++;
          }
        });
      });
    });
    return c;
  }, [allData, verifiedDesaMap]);

  // Function to fetch all verified IDs
  const fetchVerifications = async () => {
    try {
      // Add timestamp to prevent caching
      const res = await fetch(`${API_URL}/api/verification?t=${new Date().getTime()}`);
      if (res.ok) {
        try {
          const data = await res.json();
          // console.log("[DEBUG] Raw Verification Data from Server:", data); // Removed for production
          const map: Record<string, string> = {};
          data.forEach((v: any) => {
            // Double-entry strategy to handle any ID type mismatch (String vs Number vs Object)
            // This guarantees lookup success without runtime conversion risks in render
            const status = v.status || "Menunggu Verifikasi";
            // Ensure we catch both raw ID and stringified ID
            if (v.dusunId) {
              map[v.dusunId] = status;
              map[String(v.dusunId)] = status;
            }
          });
          setVerifiedDesaMap(map);
        } catch (e) {
          console.error("JSON Parse Error in fetchVerifications");
        }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/locations/hierarchy`);
        if (!res.ok) {
          console.error("Failed to fetch hierarchy:", res.statusText);
          return;
        }
        const json = await res.json();
        if (json.success) {
          // Robust sorting at all levels
          const sortedData = json.data.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((kab: any) => ({
            ...kab,
            kecamatan: kab.kecamatan.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((kec: any) => ({
              ...kec,
              desa: kec.desa.sort((a: any, b: any) => a.name.localeCompare(b.name))
            }))
          }));
          setAllData(sortedData);
        }
      } catch (err) {
        console.error("Error fetching hierarchy:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
    fetchVerifications();

    // Polling every 30 seconds to sync data between users
    const interval = setInterval(() => {
      fetchVerifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);


  // Sync selectedDesa to URL params to support refreshing and deep linking
  // while ensuring fresh navigation (without params) starts at the list view
  // REFACTOR: Use URL as Single Source of Truth
  const selectedDesa = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const desaIdParam = params.get("id"); // Primary identifier
    const desaParam = params.get("desa"); // Fallback identifier

    if ((!desaIdParam && !desaParam) || allData.length === 0) return null;

    // IF ID IS PRESENT, SEARCH BY ID (More Precise)
    if (desaIdParam) {
      for (const kab of allData || []) {
        for (const kec of kab?.kecamatan || []) {
          const found = kec?.desa?.find(d => String(d?.id) === desaIdParam);
          if (found) return { kab: kab.name, kec: kec.name, desa: found };
        }
      }
    }

    // FALLBACK TO NAME SEARCH (For backward compatibility or shared links)
    const normalize = (name: string) => name.toLowerCase().replace(/^(desa|gampong|kelurahan)\s+/g, '').trim();
    const target = normalize(desaParam || "");

    for (const kab of allData) {
      for (const kec of kab.kecamatan) {
        // Robust matching
        const d = kec.desa.find(d => {
          const dName = normalize(d.name);
          return dName === target;
        });

        if (d) {
          return { kab: kab.name, kec: kec.name, desa: d };
        }
      }
    }
    return null;
  }, [location.search, allData]);




  // Sync localSearchValue to searchTerm with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchValue !== searchTerm) {
        setSearchTerm(localSearchValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchValue]);

  // Sync searchTerm to URL
  useEffect(() => {
    const currentUrlSearch = searchParams.get("search") || "";
    if (currentUrlSearch !== searchTerm) {
      const newParams = new URLSearchParams(searchParams);
      if (searchTerm) {
        newParams.set("search", searchTerm);
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [searchTerm, searchParams, setSearchParams]);





  // Helper to navigate ensures URL is the only thing we change

  // Helper to navigate ensures URL is the only thing we change
  const navigateToDesa = (desaData: { desa: { id: any, name: string } } | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (desaData) {
      newParams.set("desa", desaData.desa.name);
      newParams.set("id", String(desaData.desa.id)); // Add ID to URL
    } else {
      newParams.delete("desa");
      newParams.delete("id");
    }
    setSearchParams(newParams);
  };

  // HELPER: Unified Robust Search Logic
  const getSearchParts = (term: string) => {
    // Bersihkan karakter seperti { } [ ] yang mungkin diketik user
    const cleaned = term.toLowerCase().replace(/[{}[\]]/g, "");
    return cleaned.split(",").map(p => p.trim()).filter(Boolean);
  };

  const isLocationMatch = (kab: string, kec: string, desa: any, searchParts: string[]) => {
    if (searchParts.length === 0) return true;

    const dName = desa?.name?.toLowerCase() || "";
    const kName = kec?.toLowerCase() || "";
    const bName = kab?.toLowerCase() || "";
    const dusunNames = desa?.dusun?.map((d: any) => d?.name?.toLowerCase()).join(" ") || "";

    const searchableText = `${dName} ${kName} ${bName} ${dusunNames}`;

    // Setiap "bagian" (yang dipisah koma) harus ada di dalam hierarchy
    return searchParts.every(part => searchableText.includes(part));
  };

  // 1. Create flat results for easier search when many identical names exist
  const flatResults = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];
    const results: any[] = [];
    const parts = getSearchParts(searchTerm);

    allData?.forEach(kab => {
      kab?.kecamatan?.forEach(kec => {
        kec?.desa?.forEach(desa => {
          const isFinalMatch = isLocationMatch(kab.name, kec.name, desa, parts);

          // Apply Status Filter to Search Results
          const currentStatus = verifiedDesaMap[desa.id];
          let matchesStatus = true;
          if (statusFilter !== "Semua") {
            if (statusFilter === "Belum Diunggah") {
              matchesStatus = !currentStatus;
            } else {
              matchesStatus = currentStatus === statusFilter;
            }
          }

          if (isFinalMatch && matchesStatus) {
            results.push({
              kab: kab.name,
              kec: kec.name,
              desa: desa,
              isVerified: !!verifiedDesaMap[desa.id],
              status: verifiedDesaMap[desa.id]
            });
          }
        });
      });
    });

    return results.sort((a, b) => a.desa.name.localeCompare(b.desa.name));
  }, [searchTerm, allData, verifiedDesaMap, statusFilter]);

  // 2. Recursively filter data (For Tree View)
  const filteredData = useMemo(() => {
    const sortHierarchy = (data: Kabupaten[]) => {
      return [...data]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(kab => ({
          ...kab,
          kecamatan: [...kab.kecamatan]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(kec => ({
              ...kec,
              desa: [...kec.desa].sort((a, b) => a.name.localeCompare(b.name))
            }))
        }));
    };

    const filterByStatus = (data: Kabupaten[]) => {
      if (statusFilter === "Semua") return data;
      return data.map(kab => {
        const filteredKec = kab.kecamatan.map(kec => {
          const filteredDesa = kec.desa.filter(desa => {
            const status = verifiedDesaMap[desa.id];
            if (statusFilter === "Belum Diunggah") return !status;
            return status === statusFilter;
          });
          if (filteredDesa.length > 0) return { ...kec, desa: filteredDesa };
          return null;
        }).filter(Boolean) as Kecamatan[];
        if (filteredKec.length > 0) return { ...kab, kecamatan: filteredKec };
        return null;
      }).filter(Boolean) as Kabupaten[];
    };

    let result = allData;

    if (searchTerm || statusFilter !== "Semua") {
      const parts = getSearchParts(searchTerm);

      const filterKabupaten = (kab: Kabupaten): Kabupaten | null => {
        const kecMatches = kab.kecamatan.map(kec => {
          const desaMatches = kec.desa.map(desa => {
            // 1. Check Search Match
            const matchesSearch = isLocationMatch(kab.name, kec.name, desa, parts);
            if (!matchesSearch) return null;

            // 2. Check Status Match
            const currentStatus = verifiedDesaMap[desa.id];
            if (statusFilter !== "Semua") {
              if (statusFilter === "Belum Diunggah") {
                if (currentStatus) return null;
              } else if (currentStatus !== statusFilter) {
                return null;
              }
            }

            return desa;
          }).filter(Boolean) as Desa[];

          if (desaMatches.length > 0) return { ...kec, desa: desaMatches };
          return null;
        }).filter(Boolean) as Kecamatan[];

        if (kecMatches.length > 0) return { ...kab, kecamatan: kecMatches };
        return null;
      };

      result = allData.map(filterKabupaten).filter(Boolean) as Kabupaten[];
    }

    const filteredResult = filterByStatus(result);
    return sortHierarchy(filteredResult);
  }, [searchTerm, allData, statusFilter, verifiedDesaMap]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6 px-4 md:px-6">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit relative">

        {/* 1. Header & Navigation */}
        <div className="p-8 pb-4">
          {selectedDesa ? (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigateToDesa(null)}
                className="w-fit flex items-center gap-2 py-2 text-sm font-bold text-[#0052CC] hover:-translate-x-1 transition-transform cursor-pointer bg-transparent border-none p-0"
              >
                <ArrowLeftIcon size={14} className="group-hover:-translate-x-1 transition-transform" /> Kembali
              </button>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>{selectedDesa.kab}</span>
                  <ChevronRightIcon size={12} />
                  <span>{selectedDesa.kec}</span>
                </div>
                <h1 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                  Berita Acara Desa {selectedDesa.desa.name}
                </h1>
              </div>
            </div>
          ) : (
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Berita Acara
            </h1>
          )}
        </div>

        {/* 2. Content */}
        <div className="px-8 pb-8">
          {!selectedDesa ? (
            <>
              {/* 1.5 Quick Stats Header */}
              {!selectedDesa && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
                  {[
                    { label: "Total Desa", value: "Semua", count: counts.Semua, color: "blue", icon: <FileTextIcon size={14} /> },
                    { label: "Terverifikasi", value: "Terverifikasi", count: counts.Terverifikasi, color: "green", icon: <CheckCircle2Icon size={14} /> },
                    { label: "Perlu Perbaikan", value: "Sesuai (Perlu Perbaikan)", count: counts["Sesuai (Perlu Perbaikan)"], color: "orange", icon: <AlertCircleIcon size={14} /> },
                    { label: "Tidak Sesuai", value: "Tidak Sesuai", count: counts["Tidak Sesuai"], color: "red", icon: <XCircleIcon size={14} /> },
                    { label: "Menunggu", value: "Menunggu Verifikasi", count: counts["Menunggu Verifikasi"], color: "sky", icon: <ClockIcon size={14} /> },
                    { label: "Belum Unggah", value: "Belum Diunggah", count: counts["Belum Diunggah"], color: "slate", icon: <UploadCloudIcon size={14} /> },
                  ].map((stat, i) => {
                    const isActive = statusFilter === stat.value;
                    const colorMap: Record<string, any> = {
                      blue: { inactive: "border-blue-100 bg-blue-50/40 text-blue-700 dark:bg-blue-500/5 dark:border-blue-500/10", active: "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25", ripple: "bg-blue-400" },
                      green: { inactive: "border-green-100 bg-green-50/40 text-green-700 dark:bg-green-500/5 dark:border-green-500/10", active: "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/25", ripple: "bg-green-400" },
                      orange: { inactive: "border-orange-100 bg-orange-50/40 text-orange-700 dark:bg-orange-500/5 dark:border-orange-500/10", active: "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/25", ripple: "bg-orange-400" },
                      red: { inactive: "border-red-100 bg-red-50/40 text-red-700 dark:bg-red-500/5 dark:border-red-500/10", active: "bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/25", ripple: "bg-red-400" },
                      sky: { inactive: "border-sky-100 bg-sky-50/40 text-sky-700 dark:bg-sky-500/5 dark:border-sky-500/10", active: "bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/25", ripple: "bg-sky-300" },
                      slate: { inactive: "border-slate-100 bg-slate-50/40 text-slate-700 dark:bg-slate-500/5 dark:border-slate-500/10", active: "bg-slate-600 border-slate-600 text-white shadow-lg shadow-slate-500/25", ripple: "bg-slate-400" },
                    };
                    const style = colorMap[stat.color];

                    return (
                      <button
                        key={i}
                        onClick={() => setStatusFilter(stat.value)}
                        className={`text-left p-4 rounded-[20px] border-2 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[85px]
                        ${isActive ? style.active + " scale-[1.03] z-10" : style.inactive + " hover:border-gray-200 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5"}
                      `}
                      >
                        <div className="relative z-10">
                          <div className={`flex items-center gap-2 text-[10px] font-black font-outfit uppercase tracking-[0.15em] mb-2 transition-colors
                          ${isActive ? "text-white/80" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600"}
                        `}>
                            <span className={`${isActive ? "text-white" : "text-current opacity-70"}`}>{stat.icon}</span>
                            {stat.label}
                          </div>
                          <p className={`text-2xl font-black font-outfit transition-all duration-300
                          ${isActive ? "text-white scale-110 origin-left" : "text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"}
                        `}>
                            {stat.count.toLocaleString()}
                          </p>
                        </div>

                        {/* Decorative Background Element */}
                        <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl transition-all duration-500
                        ${isActive ? "bg-white/30 scale-150" : "bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-100"}
                      `}></div>

                        {/* Active Indicator Bar */}
                        {isActive && (
                          <div className="absolute left-0 bottom-0 top-0 w-1.5 bg-white/30"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SEARCH VIEW */}
              <div className="flex flex-col gap-5 mb-8">
                <div className="relative group w-full">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <SearchIcon size={20} />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari desa, kecamatan, atau kabupaten/kota..."
                    className="w-full pl-14 pr-12 py-4.5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-blue-500/30 outline-none transition-all text-sm font-bold placeholder:text-gray-400 dark:text-white shadow-sm focus:shadow-xl focus:shadow-blue-500/5"
                    value={localSearchValue}
                    onChange={(e) => setLocalSearchValue(e.target.value)}
                  />
                  {localSearchValue && (
                    <button
                      onClick={() => {
                        setLocalSearchValue("");
                        setSearchTerm("");
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                    >
                      <XIcon size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* HIERARCHY LIST OR SEARCH RESULTS */}
              <div className="space-y-4 pb-4">
                {searchTerm.trim().length >= 2 ? (
                  // SEARCH RESULTS VIEW
                  flatResults.length > 0 ? (
                    flatResults.map((res: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => navigateToDesa({ desa: res.desa })}
                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all group"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <MapPinIcon size={20} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-lg font-black text-gray-800 dark:text-white uppercase leading-tight">
                              {res.desa.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50/5/50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md w-fit border border-blue-100/50 dark:border-blue-800/50">
                              <span>{res.kec}</span>
                              <span className="text-blue-300">-</span>
                              <span>{res.kab}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {res.isVerified ? (
                            <div className="flex flex-col items-end gap-1">
                              {res.status === 'Terverifikasi' ? (
                                <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">Terverifikasi</span>
                              ) : res.status === 'Tidak Sesuai' ? (
                                <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">Tidak Sesuai</span>
                              ) : res.status === 'Sesuai (Perlu Perbaikan)' ? (
                                <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">Perbaikan</span>
                              ) : (
                                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">Menunggu</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Belum Unggah</span>
                          )}
                          <ChevronRightIcon size={16} className="text-gray-300" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <SearchIcon size={24} className="text-gray-300 dark:text-gray-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Tidak Ditemukan</h3>
                      <p className="text-gray-400 text-sm">Coba kata kunci pencarian yang lain</p>
                    </div>
                  )
                ) : (
                  // HIERARCHY TREE VIEW
                  (filteredData as Kabupaten[]).map((kab) => {
                    const isKabSelected = selectedDesa && (selectedDesa as any).kab === kab.name;
                    return (
                      <Accordion
                        key={kab.id}
                        title={kab.name}
                        level={0}
                        defaultOpen={!!searchTerm || !!isKabSelected}
                      >
                        {kab.kecamatan.map((kec) => {
                          const isKecSelected = selectedDesa && (selectedDesa as any).kec === kec.name;
                          const hasUnuploadedDesa = kec.desa.some(d => !verifiedDesaMap[d.id]);
                          const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

                          return (
                            <Accordion
                              key={kec.id}
                              title={`Kec. ${kec.name}`}
                              level={1}
                              defaultOpen={!!searchTerm || !!isKecSelected}
                              onActionClick={isAdmin && hasUnuploadedDesa ? () => {
                                setActiveKecamatan({ name: kec.name, kab: kab.name });
                                setShowBulkModal(true);
                              } : undefined}
                              actionIcon={<UploadCloudIcon size={14} strokeWidth={3} />}
                              onSecondaryActionClick={isAdmin && !hasUnuploadedDesa ? () => {
                                setActiveKecamatan({ name: kec.name, kab: kab.name });
                                setShowBulkDeleteModal(true);
                              } : undefined}
                              secondaryActionIcon={<TrashIcon size={14} strokeWidth={3} />}
                            >
                              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {kec.desa.map((desa) => (
                                  <Accordion
                                    key={desa.id}
                                    title={`Desa ${desa.name}`}
                                    level={2}
                                    onClick={() => navigateToDesa({ desa })}
                                    isVerified={!!verifiedDesaMap[desa.id]}
                                    status={verifiedDesaMap[desa.id]}
                                  >
                                    <div />
                                  </Accordion>
                                ))}
                              </div>
                            </Accordion>
                          );
                        })}
                      </Accordion>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* DESA DETAIL VIEW */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DesaVerificationPanel
                desaId={selectedDesa.desa.id}
                desaName={selectedDesa.desa.name}
                onUpdate={() => { }} // Disable full re-fetch to prevent race conditions
                setVerifiedDesaMap={setVerifiedDesaMap}
              />
            </div>
          )}
        </div>
      </div>
      <BulkUploadKecamatanModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onConfirm={handleBulkUpload}
        isLoading={isBulkLoading}
        kecamatanName={activeKecamatan?.name || ""}
        onShowAlert={showAlert}
      />

      <BulkDeleteKecamatanModal
        isOpen={showBulkDeleteModal}
        kecamatanName={activeKecamatan?.name || ""}
        isLoading={isBulkLoading}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
      />

      <ModernAlert
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
