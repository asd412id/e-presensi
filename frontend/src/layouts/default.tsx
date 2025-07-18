import { useEffect } from "react";
import { IconHeart } from "@tabler/icons-react";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      {/* Background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-violet-950 transition-all duration-700">
        {/* Animated background shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200/30 to-purple-300/20 dark:from-violet-800/20 dark:to-purple-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-300/20 dark:from-blue-800/20 dark:to-cyan-900/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-rose-300/15 dark:from-pink-800/15 dark:to-rose-900/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Main content with enhanced styling */}
        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex flex-col">
          <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col">
            {/* Content wrapper with backdrop blur effect */}
            <div className="flex-grow flex flex-col backdrop-blur-sm">
              {children}
            </div>
          </div>
        </main>

        {/* Enhanced footer */}
        <footer className="relative z-10 w-full border-t border-violet-200/50 dark:border-violet-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span>Made with</span>
                  <IconHeart className="text-red-500 animate-pulse" size={14} />
                  <span>for better attendance</span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
                <span className="text-zinc-500 dark:text-zinc-400">
                  &copy; {new Date().getFullYear()} E-Presensi
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
