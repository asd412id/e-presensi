import { useState, useRef } from "react";
import {
  Table as HeroTable,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { IconSearch, IconFileX } from "@tabler/icons-react";

interface TableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
  }[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  renderActions?: (item: any) => React.ReactNode;
  actionSlot?: React.ReactNode;
  loading?: boolean;
}

const Table: React.FC<TableProps> = ({
  data,
  columns,
  meta,
  onSearch,
  onPageChange,
  actionSlot,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(e.target.value);
    }, 500); // 500ms debounce
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) onPageChange(page);
  };

  return (
    <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-2 border-violet-200/50 dark:border-violet-800/50 shadow-2xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border-b border-violet-200/50 dark:border-violet-800/50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 md:max-w-md">
            <Input
              className="w-full"
              classNames={{
                base: "backdrop-blur-sm",
                input: "text-zinc-700 dark:text-zinc-300",
                inputWrapper:
                  "bg-white/80 dark:bg-zinc-800/80 border-violet-200 dark:border-violet-700 hover:border-violet-300 dark:hover:border-violet-600 focus-within:border-violet-500 dark:focus-within:border-violet-500",
              }}
              placeholder="Cari data..."
              radius="lg"
              size="lg"
              startContent={
                <IconSearch
                  className="text-violet-500 dark:text-violet-400"
                  size={20}
                />
              }
              value={searchQuery}
              variant="bordered"
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-3 items-center">
            {actionSlot && <div className="flex gap-2">{actionSlot}</div>}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-3 md:p-6">
        <div className="overflow-x-auto overflow-y-hidden rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-violet-200/30 dark:border-violet-800/30">
          {loading ? (
            <div className="w-full flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-violet-200 dark:border-violet-800 rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-violet-500 dark:border-t-violet-400 rounded-full animate-spin" />
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-violet-600 dark:text-violet-400 mb-2">
                  Memuat Data
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Mohon tunggu sebentar...
                </p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-20">
              <div className="p-4 bg-violet-100 dark:bg-violet-900/50 rounded-2xl mb-6">
                <IconFileX
                  className="text-violet-500 dark:text-violet-400"
                  size={48}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Tidak Ada Data
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {searchQuery
                    ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                    : "Belum ada data yang tersedia"}
                </p>
              </div>
            </div>
          ) : (
            <HeroTable
              removeWrapper
              aria-label="Tabel Data"
              className="min-w-full"
              classNames={{
                base: "overflow-visible",
                table: "min-h-[200px] w-full min-w-[600px]",
                thead:
                  "bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50",
                tbody: "",
                tr: [
                  "hover:bg-violet-50/50 dark:hover:bg-violet-900/20",
                  "border-b border-violet-200/30 dark:border-violet-800/30",
                  "transition-colors duration-200",
                ],
                th: [
                  "bg-transparent",
                  "text-violet-700 dark:text-violet-300",
                  "font-semibold",
                  "text-xs md:text-sm",
                  "py-2 md:py-4 px-2 md:px-4",
                  "border-b-2 border-violet-300 dark:border-violet-700",
                  "break-words",
                ],
                td: [
                  "py-2 md:py-4 px-2 md:px-4",
                  "text-zinc-700 dark:text-zinc-300",
                  "text-xs md:text-sm",
                  "break-words",
                  "overflow-wrap-anywhere",
                ],
              }}
            >
              <TableHeader columns={[...columns]}>
                {(column: any) => (
                  <TableColumn key={column.key}>{column.label}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={data}>
                {(item: any) => (
                  <TableRow key={item.id || item.uuid || JSON.stringify(item)}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <div className="break-words overflow-wrap-anywhere">
                          {column.render
                            ? column.render(item)
                            : String(item[column.key] || "-")}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </TableBody>
            </HeroTable>
          )}
        </div>

        {/* Pagination and Stats */}
        {meta && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 md:mt-6 pt-4 md:pt-6 border-t border-violet-200/50 dark:border-violet-800/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 md:mb-0">
              <span className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                Menampilkan {data.length} dari {meta.total} data
              </span>
              {searchQuery && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" />
                  <span className="text-xs md:text-sm text-violet-600 dark:text-violet-400 font-medium">
                    Hasil pencarian: &ldquo;{searchQuery}&rdquo;
                  </span>
                </div>
              )}
            </div>
            <Pagination
              showControls
              className="flex justify-center md:justify-end"
              classNames={{
                base: "",
                wrapper: "gap-0.5 md:gap-1",
                item: "bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-xs md:text-sm min-w-[32px] md:min-w-[40px] h-8 md:h-10",
                cursor:
                  "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg text-xs md:text-sm min-w-[32px] md:min-w-[40px] h-8 md:h-10",
                prev: "bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-xs md:text-sm min-w-[32px] md:min-w-[40px] h-8 md:h-10",
                next: "bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-xs md:text-sm min-w-[32px] md:min-w-[40px] h-8 md:h-10",
              }}
              page={meta.page}
              radius="lg"
              size="sm"
              total={meta.totalPages}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
