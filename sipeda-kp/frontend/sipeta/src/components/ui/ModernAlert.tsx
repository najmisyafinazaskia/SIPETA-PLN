import React, { useEffect } from "react";
import { CheckCircle2Icon, XCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from "lucide-react";

interface ModernAlertProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
    autoClose?: number;
}

const ModernAlert: React.FC<ModernAlertProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = "success",
    autoClose = 0
}) => {
    useEffect(() => {
        if (isOpen && autoClose > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoClose);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, onClose]);

    if (!isOpen) return null;

    const config = {
        success: {
            icon: <CheckCircle2Icon className="text-white" size={32} />,
            bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
            lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
            border: "border-emerald-100 dark:border-emerald-800",
            btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/40",
            text: "text-emerald-700 dark:text-emerald-400"
        },
        error: {
            icon: <XCircleIcon className="text-white" size={32} />,
            bg: "bg-gradient-to-br from-rose-500 to-red-600",
            lightBg: "bg-rose-50 dark:bg-rose-950/30",
            border: "border-rose-100 dark:border-rose-800",
            btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/40",
            text: "text-rose-700 dark:text-rose-400"
        },
        warning: {
            icon: <AlertCircleIcon className="text-white" size={32} />,
            bg: "bg-gradient-to-br from-amber-400 to-orange-500",
            lightBg: "bg-amber-50 dark:bg-amber-950/30",
            border: "border-amber-100 dark:border-amber-800",
            btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/40",
            text: "text-amber-700 dark:text-amber-400"
        },
        info: {
            icon: <InfoIcon className="text-white" size={32} />,
            bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
            lightBg: "bg-blue-50 dark:bg-blue-950/30",
            border: "border-blue-100 dark:border-blue-800",
            btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/40",
            text: "text-blue-700 dark:text-blue-400"
        }
    };

    const style = config[type];

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] max-w-sm w-full p-10 border ${style.border} transform transition-all scale-100 animate-in zoom-in-95 duration-300 overflow-hidden`}>

                {/* Abstract Background Shapes */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${style.lightBg} opacity-50 blur-3xl`} />
                <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full ${style.lightBg} opacity-50 blur-3xl`} />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-200 transition-all hover:rotate-90 duration-300"
                >
                    <XIcon size={24} />
                </button>

                <div className="relative flex flex-col items-center text-center gap-6">
                    {/* Icon Container with Glow */}
                    <div className={`relative w-24 h-24 rounded-3xl ${style.bg} flex items-center justify-center shadow-2xl animate-bounce-gentle`}>
                        <div className="absolute inset-0 rounded-3xl bg-inherit opacity-40 blur-xl scale-110" />
                        <div className="relative">
                            {style.icon}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className={`text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white`}>
                            {title}
                        </h3>
                        <div className="h-1 w-12 bg-gray-100 dark:bg-gray-800 mx-auto rounded-full" />
                        <p className="text-base font-bold text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-full py-5 rounded-2xl font-black text-white ${style.btn} shadow-2xl transition-all uppercase tracking-[0.2em] text-xs active:scale-95 group relative overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[25deg]" />
                        <span className="relative">Lanjutkan</span>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                .animate-bounce-gentle {
                    animation: bounce-gentle 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default ModernAlert;

