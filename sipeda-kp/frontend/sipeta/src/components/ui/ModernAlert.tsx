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
            icon: <CheckCircle2Icon className="text-emerald-500" size={32} />,
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-100 dark:border-emerald-800",
            btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30",
            accent: "text-emerald-600"
        },
        error: {
            icon: <XCircleIcon className="text-rose-500" size={32} />,
            bg: "bg-rose-50 dark:bg-rose-900/20",
            border: "border-rose-100 dark:border-rose-800",
            btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/30",
            accent: "text-rose-600"
        },
        warning: {
            icon: <AlertCircleIcon className="text-amber-500" size={32} />,
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-100 dark:border-amber-800",
            btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/30",
            accent: "text-amber-600"
        },
        info: {
            icon: <InfoIcon className="text-blue-500" size={32} />,
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-100 dark:border-blue-800",
            btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
            accent: "text-blue-600"
        }
    };

    const style = config[type];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 border ${style.border} transform transition-all scale-100 animate-in zoom-in-95 duration-300`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <XIcon size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-5">
                    {/* Icon Circle */}
                    <div className={`w-20 h-20 rounded-full ${style.bg} flex items-center justify-center animate-bounce-slow`}>
                        {style.icon}
                    </div>

                    <div className="space-y-2">
                        <h3 className={`text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white`}>
                            {title}
                        </h3>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-full py-4 rounded-2xl font-black text-white ${style.btn} shadow-xl transition-all uppercase tracking-widest text-xs active:scale-95`}
                    >
                        Lanjutkan
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default ModernAlert;
