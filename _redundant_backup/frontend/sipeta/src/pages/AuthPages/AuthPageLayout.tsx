import React from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-300 via-blue-50 to-amber-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 font-outfit">

      <div className="w-full max-w-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-4xl py-10 px-10 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-800">

        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">{title}</h1>}
            {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{subtitle}</p>}
          </div>
        )}

        {children}
      </div>

      <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}