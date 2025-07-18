import { IconCalendarEvent, IconLoader2 } from "@tabler/icons-react";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-violet-200 to-purple-300 rounded-full blur-2xl opacity-60 animate-pulse" />
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full blur-xl opacity-60 animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full blur-lg opacity-40 animate-pulse delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo container with glass effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl blur-lg opacity-60 animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-3xl border-2 border-violet-200/50 dark:border-violet-800/50 shadow-2xl">
            <IconCalendarEvent
              className="text-violet-600 dark:text-violet-400"
              size={40}
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            E-Presensi
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            Sistem Presensi Digital
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-12 h-12 border-4 border-violet-200 dark:border-violet-800 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-violet-500 dark:border-t-violet-400 rounded-full animate-spin" />
            </div>
            {/* Inner pulse */}
            <div className="absolute inset-2 bg-violet-100 dark:bg-violet-900/50 rounded-full animate-pulse" />
          </div>

          {/* Loading text with animated dots */}
          <div className="flex items-center gap-2">
            <IconLoader2
              className="text-violet-600 dark:text-violet-400 animate-spin"
              size={20}
            />
            <span className="text-lg font-semibold text-violet-700 dark:text-violet-300">
              Memuat data
            </span>
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-violet-500 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-violet-500 rounded-full animate-bounce delay-100" />
              <span className="w-1 h-1 bg-violet-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>

        {/* Progress hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    </div>
  );
}
