import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { IconTrash } from "@tabler/icons-react";

import fetchApi, { API_URL } from "@/config/api";
import ConfirmDialog from "@/components/ConfirmDialog";

interface PresensiItem {
  uuid: string;
  attendance: Record<string, string>;
  signature: string;
  waktu_presensi: string;
  created_at: string;
}

interface Kegiatan {
  uuid: string;
  nama: string;
  attendance_fields: string[];
  pin?: boolean;
}

interface DaftarPresensiKegiatanProps {
  isOpen: boolean;
  onClose: () => void;
  kegiatanUuid: string;
  kegiatanNama: string;
}

export default function DaftarPresensiKegiatan({
  isOpen,
  onClose,
  kegiatanUuid,
  kegiatanNama,
}: DaftarPresensiKegiatanProps) {
  const [presensiList, setPresensiList] = useState<PresensiItem[]>([]);
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSignature, setSelectedSignature] = useState<string>("");
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PresensiItem | null>(null);
  const [deletingPresensi, setDeletingPresensi] = useState(false);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && kegiatanUuid) {
      fetchPresensiData();
    }
  }, [isOpen, kegiatanUuid]);

  const fetchPresensiData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch kegiatan details
      const kegiatanRes = await fetchApi("get", `/kegiatan/${kegiatanUuid}`);

      setKegiatan(kegiatanRes.data);

      // Fetch presensi list
      const presensiRes = await fetchApi(
        "get",
        `/kegiatan/${kegiatanUuid}/presensi`,
      );

      setPresensiList(presensiRes.data || []);
    } catch {
      setError("Gagal mengambil data presensi");
    } finally {
      setLoading(false);
    }
  };

  // Filter presensi based on search term
  const filteredPresensi = presensiList.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    return Object.values(item.attendance).some((value) =>
      value.toLowerCase().includes(searchLower),
    );
  });

  const handleViewSignature = (signature: string) => {
    setSelectedSignature(signature);
    setSignatureModalOpen(true);
  };

  const handleDeletePresensi = (item: PresensiItem) => {
    setDeleteTarget(item);
    setDeleteConfirmOpen(true);
  };

  const confirmDeletePresensi = async () => {
    if (!deleteTarget) return;

    setDeletingPresensi(true);
    try {
      await fetchApi(
        "delete",
        `/kegiatan/${kegiatanUuid}/presensi/${deleteTarget.uuid}`,
      );

      // Update local state
      setPresensiList((prev) =>
        prev.filter((item) => item.uuid !== deleteTarget.uuid),
      );

      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch {
      setError("Gagal menghapus presensi");
    } finally {
      setDeletingPresensi(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const downloadPDF = async () => {
    if (!kegiatan || filteredPresensi.length === 0) return;

    setDownloadingPDF(true);
    setError("");
    try {
      // Use backend PDF generation instead of client-side
      const response = await fetch(
        `${API_URL}/kegiatan/${kegiatanUuid}/presensi/pdf`,
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
      link.download = `presensi-${kegiatanNama.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Gagal mendownload PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="5xl"
        onClose={onClose}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Daftar Presensi
            </h2>
            <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              {kegiatanNama}
            </p>
          </ModalHeader>
          <ModalBody>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                    Memuat data presensi...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <p className="text-red-700 dark:text-red-300 font-semibold">
                  ❌ {error}
                </p>
                <Button
                  className="mt-4"
                  color="primary"
                  variant="flat"
                  onPress={fetchPresensiData}
                >
                  🔄 Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header Stats & Search */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {filteredPresensi.length}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Total Presensi
                      </p>
                    </div>
                    <div className="h-8 w-px bg-purple-300 dark:bg-purple-700" />
                    <div className="text-center">
                      <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                        {kegiatan?.attendance_fields.length || 0}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Field Data
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      className="w-64"
                      placeholder="Cari berdasarkan data presensi..."
                      size="sm"
                      startContent={
                        <svg
                          className="w-4 h-4 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      }
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <Button
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                      isDisabled={
                        downloadingPDF || filteredPresensi.length === 0
                      }
                      isLoading={downloadingPDF}
                      size="sm"
                      onPress={downloadPDF}
                    >
                      {downloadingPDF ? "Memproses..." : "📄 Download PDF"}
                    </Button>
                  </div>
                </div>

                {/* Table */}
                {filteredPresensi.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-xl font-semibold text-zinc-600 dark:text-zinc-400">
                      {searchTerm
                        ? "Tidak ada data yang sesuai pencarian"
                        : "Belum ada presensi"}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-500 mt-2">
                      {searchTerm
                        ? "Coba kata kunci lain"
                        : "Data presensi akan muncul setelah ada yang melakukan presensi"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                          <th className="border border-purple-200 dark:border-purple-800 px-3 py-3 text-left text-sm font-semibold text-purple-700 dark:text-purple-300">
                            No
                          </th>
                          {kegiatan?.attendance_fields.map((field) => (
                            <th
                              key={field}
                              className="border border-purple-200 dark:border-purple-800 px-3 py-3 text-left text-sm font-semibold text-purple-700 dark:text-purple-300"
                            >
                              {field}
                            </th>
                          ))}
                          <th className="border border-purple-200 dark:border-purple-800 px-3 py-3 text-left text-sm font-semibold text-purple-700 dark:text-purple-300">
                            Tanda Tangan
                          </th>
                          <th className="border border-purple-200 dark:border-purple-800 px-3 py-3 text-left text-sm font-semibold text-purple-700 dark:text-purple-300">
                            Waktu Presensi
                          </th>
                          <th className="border border-purple-200 dark:border-purple-800 px-3 py-3 text-left text-sm font-semibold text-purple-700 dark:text-purple-300">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPresensi.map((item, index) => (
                          <tr
                            key={item.uuid}
                            className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                          >
                            <td className="border border-purple-200 dark:border-purple-800 px-3 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                              {index + 1}
                            </td>
                            {kegiatan?.attendance_fields.map((field) => (
                              <td
                                key={field}
                                className="border border-purple-200 dark:border-purple-800 px-3 py-3 text-sm text-zinc-700 dark:text-zinc-300"
                              >
                                {item.attendance[field] || "-"}
                              </td>
                            ))}
                            <td className="border border-purple-200 dark:border-purple-800 px-3 py-3">
                              <Button
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                size="sm"
                                onPress={() =>
                                  handleViewSignature(item.signature)
                                }
                              >
                                👁️ Lihat
                              </Button>
                            </td>
                            <td className="border border-purple-200 dark:border-purple-800 px-3 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                              {formatDateTime(item.waktu_presensi)}
                            </td>
                            <td className="border border-purple-200 dark:border-purple-800 px-3 py-3">
                              <Button
                                isIconOnly
                                color="danger"
                                size="sm"
                                variant="light"
                                onPress={() => handleDeletePresensi(item)}
                              >
                                <IconTrash size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        confirmText="Hapus"
        isOpen={deleteConfirmOpen}
        loading={deletingPresensi}
        message={`Apakah Anda yakin ingin menghapus presensi dari ${deleteTarget?.attendance?.nama || "peserta ini"}?`}
        title="Hapus Presensi"
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDeletePresensi}
      />

      {/* Signature Modal */}
      <Modal
        isOpen={signatureModalOpen}
        scrollBehavior="inside"
        size="2xl"
        onClose={() => setSignatureModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Tanda Tangan
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="flex justify-center">
              <img
                alt="Signature"
                className="max-w-full h-auto border-2 border-blue-200 bg-white dark:border-blue-800 rounded-lg"
                src={`${API_URL}${selectedSignature}`}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => setSignatureModalOpen(false)}
            >
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
