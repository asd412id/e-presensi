export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-violet-100 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-violet-950">
      <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500 via-pink-400 to-blue-500 shadow-lg mb-6 animate-pulse">
        <svg fill="none" height="48" viewBox="0 0 48 48" width="48">
          <circle cx="24" cy="24" fill="white" r="20" />
          <text
            alignmentBaseline="middle"
            fill="#8b5cf6"
            fontSize="24"
            fontWeight="bold"
            textAnchor="middle"
            x="50%"
            y="58%"
          >
            EP
          </text>
        </svg>
      </span>
      <div className="flex items-center gap-2">
        <span className="animate-spin inline-block w-6 h-6 border-4 border-violet-500 border-t-transparent rounded-full" />
        <span className="text-lg font-semibold text-violet-700 dark:text-violet-300">
          Memuat data...
        </span>
      </div>
    </div>
  );
}
