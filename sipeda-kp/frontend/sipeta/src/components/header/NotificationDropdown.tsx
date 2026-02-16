import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CheckCheckIcon, Trash2Icon, Loader2 } from "lucide-react";

const _rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = _rawUrl.replace(/\/+$/, '');






interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    userName: string;
    createdAt: string;
    isRead: boolean;
    readBy: string[]; // List of user IDs who have read this
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    type
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    type: 'read-all' | 'clear-all';
}) => {
    if (!isOpen) return null;

    const isClear = type === 'clear-all';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isClear ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        {isClear ? <Trash2Icon size={40} /> : <CheckCheckIcon size={40} />}
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                        {isClear ? 'Hapus Semua?' : 'Tandai Semua?'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                        {isClear
                            ? 'Apakah Anda yakin ingin menghapus semua riwayat notifikasi Anda? Tindakan ini tidak dapat dibatalkan.'
                            : 'Apakah Anda yakin ingin menandai semua notifikasi Anda sebagai sudah dibaca?'}
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-6 py-4 rounded-2xl font-bold text-white shadow-lg shadow-current/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${isClear ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isClear ? 'Hapus' : 'Tandai')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showMore, setShowMore] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'read-all' | 'clear-all' }>({ isOpen: false, type: 'read-all' });
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setNotifications(data);


                // Calculate unread based on presence in readBy array
                const unread = data.filter((n: Notification) => !(n.readBy || []).includes(user?.id || '')).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAllAsRead = async () => {
        try {
            setIsActionLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/notifications/read-all`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && user) {
                updateUser({ ...user, lastReadNotificationsAt: data.lastReadAt });
                setUnreadCount(0);
                // Also update local notifications state
                setNotifications(prev => prev.map(n => ({ ...n, readBy: [...(n.readBy || []), user.id] })));
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleDropdown = async () => {
        const nextState = !isOpen;
        setIsOpen(nextState);

        // Removed auto-mark-read to prevent sudden graying out
        // User must manually click "Tandai Baca" or click the item
    };

    const handleClearAll = async () => {
        try {
            setIsActionLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/notifications/clear`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setNotifications([]);
                setUnreadCount(0);
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        // 1. Mark as read immediately in the backend
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_URL}/api/notifications/${notif._id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            // Update local state to reflect read status
            setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, readBy: [...n.readBy, user?.id || ''] } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }

        // 2. Logic to navigate based on notification content
        const isVerificationUpdate = notif.title === "Pembaruan Verifikasi" || notif.message.includes("mengunggah dokumen baru") || notif.title === "Pembaruan Status Verifikasi";
        const isStatusUpdate = notif.title === "Pembaruan Status Dusun";

        if (isVerificationUpdate) {
            // Attempt to extract location name from "untuk [LocationName]" or "Berita Acara [LocationName]"
            const match = notif.message.match(/(untuk|Berita Acara)\s+(.+?)(?=\s+telah|$)/i);
            if (match && match[2]) {
                let locationName = match[2].trim();
                // Remove specific prefixes to ensure better matching with data
                // We strip common prefixes to normalize the name
                locationName = locationName.replace(/^(Desa|Gampong|Kelurahan)\s+/i, '');

                navigate(`/dashboard/verifikasi?desa=${encodeURIComponent(locationName)}`);
                setIsOpen(false);
            } else {
                // Fallback to general verification page
                navigate(`/dashboard/verifikasi`);
                setIsOpen(false);
            }
        } else if (isStatusUpdate) {
            const match = notif.message.match(/Status Dusun (.+?) di Desa (.+?) telah diubah menjadi (.+)/i);

            if (match && match[2]) {
                const dusunName = match[1].trim();
                const newStatus = match[3].trim();

                const isWarning = newStatus === 'Belum Berlistrik' || newStatus.includes('BELUM') || newStatus === '0';
                const tab = isWarning ? 'warning' : 'stable';

                navigate(`/dashboard/dusun?tab=${tab}&highlight=${encodeURIComponent(dusunName)}`);
                setIsOpen(false);
            }
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggleDropdown}
                className="relative flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <svg
                    className="size-5 fill-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-black text-white bg-red-500 rounded-full border-[2px] border-white dark:border-gray-900 shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="absolute right-0 mt-3 flex w-[320px] sm:w-[380px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900"
            >
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifikasi</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setConfirmModal({ isOpen: true, type: 'read-all' })}
                            className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                        >
                            Tandai Baca
                        </button>
                        <button
                            onClick={() => setConfirmModal({ isOpen: true, type: 'clear-all' })}
                            className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                        >
                            Hapus
                        </button>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-3">
                    {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-gray-500 text-sm">Belum ada notifikasi.</p>
                        </div>
                    ) : (
                        <>
                            {(showMore ? notifications : notifications.slice(0, 3)).map((notif) => {
                                const isUnread = !(notif.readBy || []).includes(user?.id || '');

                                const isClickable = notif.title === "Pembaruan Verifikasi" ||
                                    notif.title === "Pembaruan Status Verifikasi" ||
                                    notif.message.includes("mengunggah dokumen baru") ||
                                    notif.title === "Pembaruan Status Dusun";

                                return (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 rounded-xl transition-all border ${!isUnread
                                            ? "bg-gray-200/50 border-gray-200 dark:bg-gray-800/80 dark:border-gray-700"
                                            : "bg-white border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-md ring-1 ring-blue-500/5"} ${isClickable ? "cursor-pointer hover:brightness-95" : ""}`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {isUnread && (
                                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
                                                )}
                                                <h4 className={`font-bold text-base line-clamp-1 ${isUnread ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                                                    {notif.title}
                                                </h4>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2">
                                                {new Date(notif.createdAt).toLocaleString('id-ID', {
                                                    weekday: 'short',
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed mb-3 ${isUnread ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isUnread ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.4" d="M12.1207 12.78C12.0507 12.77 11.9607 12.77 11.8807 12.78C10.1207 12.72 8.7207 11.28 8.7207 9.50998C8.7207 7.72998 10.1607 6.28998 11.9407 6.28998C13.7207 6.28998 15.1607 7.72998 15.1607 9.50998C15.1607 11.28 13.7507 12.72 12.1207 12.78Z" fill="currentColor" />
                                                    <path d="M18.7407 19.3801C18.2807 21.0101 16.6907 22.2501 14.8207 22.2501H9.1807C7.3107 22.2501 5.7207 21.0101 5.2607 19.3801C4.7807 17.6801 5.7907 16.0201 7.6407 14.8801C8.9407 14.0701 10.5207 13.6201 12.0007 13.6201C13.4807 13.6201 15.0607 14.0701 16.3607 14.8801C18.2107 16.0201 19.2207 17.6801 18.7407 19.3801Z" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <span className={`text-xs font-bold ${isUnread ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                                                {notif.userName}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {notifications.length > 3 && (
                                <button
                                    onClick={() => setShowMore(!showMore)}
                                    className="w-full py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    {showMore ? "Sembunyikan" : `Tampilkan Semua (${notifications.length - 3} lainnya)`}
                                </button>
                            )}
                        </>
                    )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </Dropdown>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                type={confirmModal.type}
                isLoading={isActionLoading}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.type === 'read-all' ? handleMarkAllAsRead : handleClearAll}
            />
        </div>
    );
}
