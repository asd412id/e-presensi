import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconDownload,
  IconCopy,
  IconLoader2,
  IconCalendarEvent,
  IconPlus,
  IconMapPin,
  IconClock,
  IconUsers,
} from "@tabler/icons-react";

import FormKegiatan from "./FormKegiatan";
import DaftarPresensiKegiatan from "./DaftarPresensiKegiatan";

import ConfirmDialog from "@/components/ConfirmDialog";
import fetchApi, { API_URL } from "@/config/api";
import DefaultLayout from "@/layouts/default";
import Table from "@/components/table";
import { useNotification } from "@/hooks/useNotification";
import NotificationContainer from "@/components/NotificationContainer";

export default function ListKegiatanPage() {
  const { showSuccess, showError, notifications, removeNotification } =
    useNotification();

  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchKegiatan();
  }, [currentPage, searchQuery]);

  const fetchKegiatan = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
      });

      const res: any = await fetchApi("get", `/kegiatan?${params}`);

      setData(res?.data?.data || []);
      setMeta(res?.data?.meta || null);
    } catch {
      showError("Gagal", "Gagal mengambil data kegiatan");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  // Helper format waktu
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const columns = [
    {
      key: "nama",
      label: "Nama Kegiatan",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
            <IconCalendarEvent
              className="text-violet-600 dark:text-violet-400"
              size={16}
            />
          </div>
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              {row.nama}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-xs">
              {row.deskripsi || "Tidak ada deskripsi"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "waktu_mulai",
      label: "Jadwal",
      render: (row: any) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconClock
              className="text-green-600 dark:text-green-400"
              size={14}
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Mulai: {formatDateTime(row.waktu_mulai)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconClock className="text-red-600 dark:text-red-400" size={14} />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Selesai: {formatDateTime(row.waktu_selesai)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "lokasi",
      label: "Lokasi",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <IconMapPin className="text-blue-600 dark:text-blue-400" size={16} />
          <span className="text-zinc-700 dark:text-zinc-300">
            {row.lokasi || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "attendance_fields",
      label: "Field Presensi",
      render: (row: any) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(row.attendance_fields) &&
            row.attendance_fields.length > 0 ? (
            row.attendance_fields.map((field: string, index: number) => (
              <Chip
                key={index}
                className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300"
                size="sm"
                variant="flat"
              >
                {field}
              </Chip>
            ))
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400 text-sm">
              Tidak ada field
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row: any) => (
        <div className="flex gap-1 items-center justify-end">
          <Button
            isIconOnly
            className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70"
            size="sm"
            variant="flat"
            onPress={() => handleViewPresensi(row)}
          >
            <IconEye size={16} />
          </Button>
          <Button
            isIconOnly
            className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70"
            isDisabled={downloadingId == row.uuid}
            size="sm"
            variant="flat"
            onPress={() => handleDownloadPDF(row)}
          >
            {downloadingId == row.uuid ? (
              <IconLoader2 className="animate-spin" size={16} />
            ) : (
              <IconDownload size={16} />
            )}
          </Button>
          <Button
            isIconOnly
            className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/70"
            size="sm"
            variant="flat"
            onPress={() => handleEdit(row)}
          >
            <IconEdit size={16} />
          </Button>
          <Button
            isIconOnly
            className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70"
            size="sm"
            variant="flat"
            onPress={() => handleDelete(row)}
          >
            <IconTrash size={16} />
          </Button>
          <Button
            isIconOnly
            className="bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/70"
            size="sm"
            variant="flat"
            onPress={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/presensi/${row.uuid}`,
              );
              showSuccess(
                "Link disalin",
                "Link presensi telah disalin ke clipboard",
              );
            }}
          >
            <IconCopy size={16} />
          </Button>
        </div>
      ),
    },
  ];

  // Handler untuk edit dan hapus
  const [editData, setEditData] = useState<any>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleEdit = (row: any) => {
    setEditData(row);
    setIsEditFormOpen(true);
  };

  // State untuk dialog konfirmasi hapus
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State untuk modal daftar presensi
  const [presensiModalOpen, setPresensiModalOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDelete = (row: any) => {
    setDeleteTarget(row);
    setConfirmOpen(true);
  };

  const handleViewPresensi = (row: any) => {
    setSelectedKegiatan(row);
    setPresensiModalOpen(true);
  };

  const handleDownloadPDF = async (row: any) => {
    setDownloadingId(row.uuid);
    try {
      showSuccess("Download", "Sedang memproses PDF...");

      // Use direct fetch with API_URL for PDF download
      const response = await fetch(
        `${API_URL}/kegiatan/${row.uuid}/presensi/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mendownload PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `presensi-${row.nama.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccess("Berhasil", "PDF berhasil didownload");
    } catch {
      showError("Gagal", "Gagal mendownload PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetchApi("delete", `/kegiatan/${deleteTarget.uuid}`);
      showSuccess("Berhasil", "Kegiatan berhasil dihapus");
      fetchKegiatan();
    } catch {
      showError("Gagal", "Gagal menghapus kegiatan");
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <DefaultLayout title="Daftar Kegiatan">
      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="relative z-10 container mx-auto px-6 py-12">
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-2 border-violet-200/50 dark:border-violet-800/50 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                      <IconCalendarEvent className="text-white" size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Daftar Kegiatan
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                        Kelola semua kegiatan dan presensi dalam satu tempat
                      </p>
                    </div>
                  </div>

                  <Button
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg"
                    radius="lg"
                    size="lg"
                    startContent={<IconPlus size={20} />}
                    onPress={handleOpenForm}
                  >
                    Buat Kegiatan Baru
                  </Button>
                </div>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/30 rounded-xl border border-violet-200 dark:border-violet-800">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                      <IconCalendarEvent
                        className="text-violet-600 dark:text-violet-400"
                        size={20}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Total Kegiatan
                      </p>
                      <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                        {meta?.total || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <IconUsers
                        className="text-blue-600 dark:text-blue-400"
                        size={20}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Halaman
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {meta?.currentPage || 1} /{" "}
                        {Math.ceil((meta?.total || 0) / (meta?.perPage || 10))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <IconClock
                        className="text-green-600 dark:text-green-400"
                        size={20}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Per Halaman
                      </p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {meta?.perPage || 10}
                      </p>
                    </div>
                  </div>
                </div>

                <Table
                  columns={columns}
                  data={data}
                  loading={loading}
                  meta={meta}
                  onPageChange={handlePageChange}
                  onSearch={handleSearch}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      <FormKegiatan
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          showSuccess("Berhasil", "Kegiatan berhasil ditambahkan");
          fetchKegiatan();
        }}
      />
      <FormKegiatan
        initialData={editData}
        isEdit={true}
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditData(null);
        }}
        onSuccess={() => {
          setIsEditFormOpen(false);
          setEditData(null);
          showSuccess("Berhasil", "Kegiatan berhasil diperbarui");
          fetchKegiatan();
        }}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        loading={deleteLoading}
        message={`Yakin ingin menghapus kegiatan '${deleteTarget?.nama}'?`}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
      {selectedKegiatan && (
        <DaftarPresensiKegiatan
          isOpen={presensiModalOpen}
          kegiatanNama={selectedKegiatan.nama}
          kegiatanUuid={selectedKegiatan.uuid}
          onClose={() => {
            setPresensiModalOpen(false);
            setSelectedKegiatan(null);
          }}
        />
      )}
    </DefaultLayout>
  );
}
