/* eslint-disable */

import { useEffect, useRef, useState } from "react";
import { Input } from "@heroui/input";
import { useParams } from "react-router-dom";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

import PageLoading from "@/components/LoadingPage";
import fetchApi from "@/config/api";

interface Kegiatan {
  uuid: string;
  nama: string;
  attendance_fields: string[];
  pin?: boolean; // Only indicates if PIN is required, not the actual PIN value
  error?: string; // Tambahkan properti error
  waktu_mulai: string;
  waktu_selesai: string;
  timeValidation?: {
    isValid: boolean;
    message: string;
    type: "early" | "late" | "valid";
  };
}

export default function FormPresensi() {
  const { kegiatan_uuid } = useParams<{ kegiatan_uuid: string }>();
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [modalDrawing, setModalDrawing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [submittedForm, setSubmittedForm] = useState<Record<string, string>>(
    {},
  );
  const [submittedSignature, setSubmittedSignature] = useState<string>("");
  const [submissionTime, setSubmissionTime] = useState<Date | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string>("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [timeValidation, setTimeValidation] = useState<{
    isValid: boolean;
    message: string;
    type: "early" | "late" | "valid";
  }>({ isValid: true, message: "", type: "valid" });

  // Fetch kegiatan
  useEffect(() => {
    if (kegiatan_uuid) fetchKegiatan();
  }, [kegiatan_uuid]);

  // Setup canvas when modal opens
  useEffect(() => {
    if (modalOpen && modalCanvasRef.current) {
      const canvas = modalCanvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
      }
    }
  }, [modalOpen]);

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Clear relevant errors when user is typing
    if (error) {
      if (field === "pin" && (error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah"))) {
        setError("");
      } else if (error.includes(`Field ${field}`)) {
        setError("");
      }
    }
  };

  // Validate kegiatan time
  const validateKegiatanTime = (kegiatan: Kegiatan) => {
    const now = new Date();
    const waktuMulai = new Date(kegiatan.waktu_mulai);
    const waktuSelesai = new Date(kegiatan.waktu_selesai);

    if (now < waktuMulai) {
      setTimeValidation({
        isValid: false,
        message: `Kegiatan belum dimulai. Presensi dapat dilakukan mulai ${waktuMulai.toLocaleString("id-ID")}`,
        type: "early",
      });

      return false;
    }

    if (now > waktuSelesai) {
      setTimeValidation({
        isValid: false,
        message: `Kegiatan sudah selesai. Presensi ditutup pada ${waktuSelesai.toLocaleString("id-ID")}`,
        type: "late",
      });

      return false;
    }

    setTimeValidation({
      isValid: true,
      message: "",
      type: "valid",
    });

    return true;
  };

  async function fetchKegiatan() {
    setIsInitialLoading(true);
    setNotFound(false);
    setFetchError(false);
    setFetchErrorMessage("");

    try {
      const res = await fetchApi("get", `/kegiatan/presensi/${kegiatan_uuid}`);

      document.title = `Presensi Kegiatan: ${res.data.nama}`;
      setKegiatan(res.data);

      // Use time validation from backend if available, otherwise validate locally
      if (res.data.timeValidation) {
        setTimeValidation(res.data.timeValidation);
      } else {
        validateKegiatanTime(res.data);
      }
    } catch (e: any) {
      // Check if it's a 404 error or kegiatan not found
      if (
        e.status === 404 ||
        e.message?.includes("tidak ditemukan") ||
        e.message?.includes("not found")
      ) {
        setNotFound(true);
        document.title = "Kegiatan Tidak Ditemukan";
      } else if (e.status === 400) {
        // Handle time validation errors from backend (for submit endpoint)
        setFetchError(true);
        setFetchErrorMessage(e.message || "Validasi waktu kegiatan gagal");
        document.title = "Error - e-presensi";
      } else {
        // Handle all other types of errors
        setFetchError(true);
        let errorMessage = "Terjadi kesalahan saat mengambil data kegiatan";

        if (e.status === 500) {
          errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi.";
        } else if (e.status === 403) {
          errorMessage = "Anda tidak memiliki akses ke kegiatan ini";
        } else if (e.status === 401) {
          errorMessage =
            "Sesi Anda telah berakhir. Silakan muat ulang halaman.";
        } else if (!navigator.onLine) {
          errorMessage = "Tidak ada koneksi internet. Periksa koneksi Anda.";
        } else if (e.message) {
          errorMessage = e.message;
        }

        setFetchErrorMessage(errorMessage);
        document.title = "Error - e-presensi";
      }
    } finally {
      setIsInitialLoading(false);
    }
  }

  // Helper function to get accurate coordinates
  const getCanvasCoordinates = (
    canvas: HTMLCanvasElement,
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  // Modal signature logic
  const handleModalStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setModalDrawing(true);
    const canvas = modalCanvasRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(canvas, e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleModalEnd = () => {
    setModalDrawing(false);
  };

  const handleModalDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!modalDrawing) return;
    e.preventDefault();
    const canvas = modalCanvasRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(canvas, e);

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.moveTo(x, y);
  };
  const handleModalClear = () => {
    const canvas = modalCanvasRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setSignature(""); // Hapus signature yang tersimpan
    setError(""); // Clear any errors when clearing canvas
  };
  const handleModalSave = () => {
    const canvas = modalCanvasRef.current;

    if (!canvas) return;

    // Periksa apakah canvas kosong
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Ambil data gambar dari canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Periksa apakah ada pixel yang bukan transparan (ada gambar)
    let hasContent = false;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    // Cari batas area yang memiliki content
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 0) {
          hasContent = true;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (!hasContent) {
      setError("Silakan buat tanda tangan terlebih dahulu");

      return;
    }

    // Tambahkan padding kecil di sekitar area content
    const padding = 10;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.min(canvas.width - cropX, maxX - minX + padding * 2);
    const cropHeight = Math.min(
      canvas.height - cropY,
      maxY - minY + padding * 2,
    );

    // Buat canvas sementara untuk crop
    const cropCanvas = document.createElement("canvas");

    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const cropCtx = cropCanvas.getContext("2d");

    if (!cropCtx) return;

    // Copy area yang diperlukan saja
    cropCtx.drawImage(
      canvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    // Resize untuk ukuran final yang lebih kecil
    const targetWidth = 200; // Ukuran final yang diinginkan
    const aspectRatio = cropHeight / cropWidth;
    const targetHeight = targetWidth * aspectRatio;

    const resizedCanvas = document.createElement("canvas");

    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;

    const resizeCtx = resizedCanvas.getContext("2d");

    if (!resizeCtx) return;

    resizeCtx.drawImage(cropCanvas, 0, 0, targetWidth, targetHeight);

    const base64Data = resizedCanvas.toDataURL("image/png", 0.8); // Kualitas sedikit lebih tinggi karena ukuran lebih kecil

    // Validasi ukuran base64
    const base64Size =
      (base64Data.length * 3) / 4 -
      (base64Data.indexOf("=") > 0
        ? base64Data.length - base64Data.indexOf("=")
        : 0);

    if (base64Size > 100 * 1024) {
      setError("Ukuran tanda tangan melebihi 100KB");

      return;
    }

    // Simpan tanda tangan sebagai base64
    setSignature(base64Data);
    setModalOpen(false);
    setError(""); // Clear any previous errors
  };

  // Submit presensi
  const handleSubmit = async () => {
    if (!kegiatan) return;

    // Validate time before submitting
    if (!validateKegiatanTime(kegiatan)) {
      return;
    }

    // Validate required fields
    const missingFields = kegiatan.attendance_fields.filter(
      (field) => !form[field] || form[field].trim() === ""
    );

    if (missingFields.length > 0) {
      setError(`Field wajib belum diisi: ${missingFields.join(", ")}`);
      return;
    }

    // Validate PIN if required
    if (kegiatan.pin) {
      if (!form["pin"] || form["pin"].trim() === "") {
        setError("PIN kegiatan wajib diisi");
        return;
      }
    }

    if (!signature || signature === "") {
      setError("Tanda tangan wajib diisi");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const submissionDateTime = new Date();

      await fetchApi("post", `/kegiatan/${kegiatan.uuid}/presensi`, {
        kegiatan_uuid: kegiatan.uuid,
        attendance: form,
        signature,
        waktu_presensi: submissionDateTime.toISOString(),
      });

      // Simpan data yang telah disubmit sebelum di-reset
      setSubmittedForm({ ...form });
      setSubmittedSignature(signature);
      setSubmissionTime(submissionDateTime);

      // Reset form
      setForm({});
      setSignature("");
      setSuccess(true); // Set state success menjadi true
    } catch (e: any) {
      // Handle different types of errors
      if (e.status === 400) {
        // Validation errors - show specific error message
        const message = e.message || "Gagal menyimpan presensi";
        setError(message);

        // If it's a time validation error, update time validation state
        if (
          message.includes("belum dimulai") ||
          message.includes("sudah selesai")
        ) {
          if (kegiatan) {
            validateKegiatanTime(kegiatan);
          }
        }
      } else if (e.status === 404) {
        // Kegiatan not found
        setError("Kegiatan tidak ditemukan");
        setNotFound(true);
      } else if (e.status === 429) {
        // Rate limiting
        setError("Terlalu banyak percobaan. Harap tunggu beberapa menit dan coba lagi");
      } else if (e.status >= 500) {
        // Server error
        setError("Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat");
      } else {
        // Other errors
        setError(e.message || "Gagal menyimpan presensi");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-lg">
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 px-4 py-6 sm:px-8 sm:py-10 backdrop-blur-sm">
            {/* Success Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                <svg
                  fill="none"
                  height="24"
                  className="sm:h-8 sm:w-8"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Presensi Berhasil!
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 px-2">
                Terima kasih telah melakukan presensi untuk kegiatan
              </p>
            </div>

            {/* Activity Info */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-purple-200 dark:border-purple-800">
              <h3 className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300 mb-3 sm:mb-4 text-center break-words">
                📅 {kegiatan?.nama}
              </h3>

              {/* Attendance Details */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-zinc-700 dark:text-zinc-200 text-sm mb-2 sm:mb-3">
                  📝 Detail Presensi:
                </h4>
                {Object.entries(submittedForm).map(([field, value]) => {
                  if (field === "pin") return null; // Skip PIN field

                  return (
                    <div
                      key={field}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 px-3 bg-white/60 dark:bg-zinc-800/60 rounded-lg gap-1 sm:gap-0"
                    >
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {field}:
                      </span>
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 break-words">
                        {value}
                      </span>
                    </div>
                  );
                })}

                {/* Timestamp */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 px-3 bg-white/60 dark:bg-zinc-800/60 rounded-lg gap-1 sm:gap-0">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Waktu Presensi:
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {submissionTime?.toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Display */}
            {submittedSignature && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-700 dark:text-green-300 text-center mb-3 sm:mb-4 text-sm sm:text-base">
                  ✍️ Tanda Tangan Anda
                </h4>
                <div className="flex justify-center">
                  <img
                    alt="Tanda Tangan"
                    className="border-2 border-green-300 dark:border-green-700 rounded-lg shadow-md max-w-full"
                    src={submittedSignature}
                    style={{
                      maxWidth: "200px",
                      maxHeight: "100px",
                      background: "#f9fafb",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                Data presensi Anda telah berhasil disimpan dan dapat digunakan
                sebagai bukti kehadiran.
              </p>

              {/* Optional: Add buttons for further actions */}
              <div className="space-y-3">
                <button
                  className="w-full py-3 px-4 sm:px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  onClick={() => window.location.reload()}
                >
                  🔄 Presensi Lagi
                </button>
              </div>
            </div>

            {/* Copyright */}
            <div className="w-full text-center text-xs text-zinc-400 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-200 dark:border-zinc-700">
              &copy; {new Date().getFullYear()} e-presensi. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error page if kegiatan not found
  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 via-red-300 to-red-500 p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 px-8 py-10 backdrop-blur-sm">
            {/* Error Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg
                  fill="none"
                  height="32"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  width="32"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6" />
                  <path d="M9 9l6 6" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Kegiatan Tidak Ditemukan
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-300">
                Maaf, kegiatan yang Anda cari tidak dapat ditemukan
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6 border-2 border-red-200 dark:border-red-800">
              <div className="text-center space-y-4">
                <div className="text-6xl">😔</div>
                <h3 className="text-xl font-bold text-red-700 dark:text-red-300">
                  Oops! Halaman tidak tersedia
                </h3>
                <div className="space-y-2 text-sm text-red-600 dark:text-red-400">
                  <p>Kemungkinan penyebab:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>Kegiatan sudah tidak aktif atau telah dihapus</li>
                    <li>Link yang Anda gunakan tidak valid</li>
                    <li>Kegiatan belum tersedia untuk presensi</li>
                    <li>Terjadi kesalahan pada sistem</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="text-center space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Silakan periksa kembali link kegiatan atau hubungi penyelenggara
                untuk informasi lebih lanjut.
              </p>

              <div className="space-y-3">
                <button
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => window.history.back()}
                >
                  ← Kembali
                </button>
                <button
                  className="w-full py-3 px-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => window.location.reload()}
                >
                  🔄 Coba Lagi
                </button>
              </div>
            </div>

            {/* Copyright */}
            <div className="w-full text-center text-xs text-zinc-400 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              &copy; {new Date().getFullYear()} e-presensi. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show general error page for other errors
  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 via-orange-300 to-orange-500 p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 px-8 py-10 backdrop-blur-sm">
            {/* Error Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg
                  fill="none"
                  height="32"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  width="32"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Terjadi Kesalahan
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-300">
                Maaf, ada masalah saat memuat halaman presensi
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 mb-6 border-2 border-orange-200 dark:border-orange-800">
              <div className="text-center space-y-4">
                <div className="text-6xl">⚠️</div>
                <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  Oops! Ada yang tidak beres
                </h3>
                <div className="bg-white/70 dark:bg-zinc-800/70 rounded-lg p-4 border border-orange-300 dark:border-orange-700">
                  <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                    {fetchErrorMessage}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-orange-600 dark:text-orange-400">
                  <p>Yang dapat Anda lakukan:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>Periksa koneksi internet Anda</li>
                    <li>Coba muat ulang halaman</li>
                    <li>Tunggu beberapa saat dan coba lagi</li>
                    <li>Hubungi administrator jika masalah berlanjut</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="text-center space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Jika masalah terus berlanjut, silakan hubungi tim dukungan
                teknis.
              </p>

              <div className="space-y-3">
                <button
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => fetchKegiatan()}
                >
                  🔄 Coba Lagi
                </button>
                <button
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => window.history.back()}
                >
                  ← Kembali
                </button>
                <button
                  className="w-full py-3 px-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => window.location.reload()}
                >
                  🔄 Muat Ulang Halaman
                </button>
              </div>
            </div>

            {/* Copyright */}
            <div className="w-full text-center text-xs text-zinc-400 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              &copy; {new Date().getFullYear()} e-presensi. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading page only during initial loading and when kegiatan is not yet loaded
  if (isInitialLoading || (!kegiatan && !notFound && !fetchError)) {
    return <PageLoading />;
  }

  // If we reach here and still no kegiatan, something went wrong
  if (!kegiatan) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 px-8 py-10 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-4 shadow-lg">
              <svg
                fill="none"
                height="28"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="28"
              >
                <rect height="16" rx="2" width="18" x="3" y="4" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Presensi Kegiatan
            </h2>
          </div>

          <div className="mb-8 text-center">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl px-4 py-3 border border-purple-200 dark:border-purple-800">
              {kegiatan.nama}
            </h3>

            {/* Time validation warning */}
            {!timeValidation.isValid && (
              <div
                className={`mt-4 p-4 rounded-xl border-2 ${timeValidation.type === "early"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {timeValidation.type === "early" ? (
                    <div className="text-2xl">⏰</div>
                  ) : (
                    <div className="text-2xl">⛔</div>
                  )}
                  <h4
                    className={`font-bold ${timeValidation.type === "early"
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-red-700 dark:text-red-300"
                      }`}
                  >
                    {timeValidation.type === "early"
                      ? "Kegiatan Belum Dimulai"
                      : "Kegiatan Sudah Selesai"}
                  </h4>
                </div>
                <p
                  className={`text-sm ${timeValidation.type === "early"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                    }`}
                >
                  {timeValidation.message}
                </p>
              </div>
            )}

            {/* Time information for active kegiatan */}
            {timeValidation.isValid && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-lg">✅</div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300">
                    Presensi Tersedia
                  </h4>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <p>
                    Dimulai:{" "}
                    {new Date(kegiatan.waktu_mulai).toLocaleString("id-ID")}
                  </p>
                  <p>
                    Berakhir:{" "}
                    {new Date(kegiatan.waktu_selesai).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            )}
          </div>
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {kegiatan.attendance_fields.map((field) => (
              <div key={field} className="space-y-2">
                <Input
                  required
                  className="rounded-xl shadow-sm transition-all duration-200 hover:shadow-md focus-within:shadow-lg"
                  classNames={{
                    input: "text-sm",
                    inputWrapper: `border-2 ${error.includes(`Field ${field}`) || error.includes(field)
                      ? "border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 focus-within:border-red-500 dark:focus-within:border-red-400"
                      : "border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 focus-within:border-purple-500 dark:focus-within:border-purple-400"
                      }`,
                  }}
                  description={
                    error.includes(`Field ${field}`) && (
                      <span className="text-red-500 text-xs flex items-center gap-1">
                        ❌ {field} wajib diisi
                      </span>
                    )
                  }
                  isDisabled={!timeValidation.isValid}
                  label={field}
                  value={form[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </div>
            ))}
            {kegiatan.pin && (
              <div className="space-y-2">
                <Input
                  required
                  className="rounded-xl shadow-sm transition-all duration-200 hover:shadow-md focus-within:shadow-lg"
                  classNames={{
                    input: "text-sm",
                    inputWrapper: `border-2 ${error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah")
                      ? "border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 focus-within:border-red-500 dark:focus-within:border-red-400"
                      : "border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 focus-within:border-purple-500 dark:focus-within:border-purple-400"
                      }`,
                  }}
                  description={
                    error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah") ? (
                      <span className="text-red-500 text-xs flex items-center gap-1">
                        ❌ PIN tidak valid
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">
                        Masukkan PIN yang diberikan penyelenggara
                      </span>
                    )
                  }
                  isDisabled={!timeValidation.isValid}
                  label="PIN Kegiatan"
                  type="password"
                  value={form["pin"] || ""}
                  onChange={(e) => {
                    handleChange("pin", e.target.value);
                    // Clear PIN-related errors when typing
                    if (error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah")) {
                      setError("");
                    }
                  }}
                />
              </div>
            )}

            <div className="space-y-3">
              <label
                className="block font-semibold text-zinc-700 dark:text-zinc-200 text-sm"
                htmlFor="signature-canvas"
              >
                Tanda Tangan <span className="text-red-500">*</span>
              </label>
              <Button
                className="rounded-xl w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                isDisabled={!timeValidation.isValid}
                type="button"
                onPress={() => {
                  setModalOpen(true);
                  setError(""); // Clear error when opening modal
                }}
              >
                {signature ? "✓ Ubah Tanda Tangan" : "📝 Buat Tanda Tangan"}
              </Button>

              {signature && signature !== "" ? (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2 text-center">
                    ✓ Tanda tangan telah dibuat
                  </p>
                  <img
                    alt="Preview Tanda Tangan"
                    className="mx-auto border border-green-300 dark:border-green-700 rounded-lg shadow-sm"
                    src={signature}
                    style={{
                      maxWidth: 200,
                      maxHeight: 100,
                      background: "#f9fafb",
                    }}
                  />
                </div>
              ) : (
                <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl">
                  <p className="text-sm text-orange-700 dark:text-orange-300 font-medium text-center">
                    ⚠️ Tanda tangan diperlukan untuk melanjutkan
                  </p>
                </div>
              )}

              <Modal
                isOpen={modalOpen}
                size="xl"
                onClose={() => setModalOpen(false)}
              >
                <ModalContent>
                  <ModalHeader className="font-bold text-lg border-b border-purple-200 dark:border-purple-800 pb-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
                    ✍️ Buat Tanda Tangan
                  </ModalHeader>
                  <ModalBody className="py-6">
                    <div className="flex flex-col items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          Gambar tanda tangan Anda pada area di bawah ini
                        </p>
                      </div>
                      <canvas
                        ref={modalCanvasRef}
                        className="border-2 border-purple-300 dark:border-purple-700 rounded-xl bg-gray-50 dark:bg-zinc-800 shadow-lg transition-all duration-200 hover:shadow-xl"
                        height={250}
                        id="signature-canvas"
                        style={{ touchAction: "none", maxWidth: "100%" }}
                        width={600}
                        onMouseDown={handleModalStart}
                        onMouseMove={handleModalDraw}
                        onMouseUp={handleModalEnd}
                        onTouchEnd={handleModalEnd}
                        onTouchMove={handleModalDraw}
                        onTouchStart={handleModalStart}
                      />
                      <div className="flex gap-4 w-full justify-center">
                        <Button
                          className="rounded-xl px-6 py-2 font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                          type="button"
                          onPress={handleModalClear}
                        >
                          🗑️ Bersihkan
                        </Button>
                        <Button
                          className="rounded-xl px-6 py-2 font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                          type="button"
                          onPress={handleModalSave}
                        >
                          ✅ Simpan Tanda Tangan
                        </Button>
                      </div>
                    </div>
                  </ModalBody>
                </ModalContent>
              </Modal>
            </div>

            {error && (
              <div className={`border-2 rounded-xl p-4 text-center ${error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah")
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : error.includes("tunggu") || error.includes("percobaan")
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  : error.includes("server") || error.includes("Server")
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah") ? (
                    <div className="text-2xl">🔑</div>
                  ) : error.includes("tunggu") || error.includes("percobaan") ? (
                    <div className="text-2xl">⏱️</div>
                  ) : error.includes("server") || error.includes("Server") ? (
                    <div className="text-2xl">🔧</div>
                  ) : error.includes("sudah ada") || error.includes("duplicate") ? (
                    <div className="text-2xl">👥</div>
                  ) : error.includes("tanda tangan") || error.includes("signature") ? (
                    <div className="text-2xl">✍️</div>
                  ) : (
                    <div className="text-2xl">❌</div>
                  )}
                  <p className={`font-semibold text-sm ${error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah")
                    ? "text-yellow-700 dark:text-yellow-300"
                    : error.includes("tunggu") || error.includes("percobaan")
                      ? "text-orange-700 dark:text-orange-300"
                      : error.includes("server") || error.includes("Server")
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-red-700 dark:text-red-300"
                    }`}>
                    {error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah")
                      ? "PIN Tidak Valid"
                      : error.includes("tunggu") || error.includes("percobaan")
                        ? "Terlalu Cepat"
                        : error.includes("server") || error.includes("Server")
                          ? "Masalah Server"
                          : error.includes("sudah ada") || error.includes("duplicate")
                            ? "Data Sudah Ada"
                            : error.includes("tanda tangan") || error.includes("signature")
                              ? "Masalah Tanda Tangan"
                              : "Gagal Menyimpan"
                    }
                  </p>
                </div>
                <p className={`text-xs ${error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah")
                  ? "text-yellow-600 dark:text-yellow-400"
                  : error.includes("tunggu") || error.includes("percobaan")
                    ? "text-orange-600 dark:text-orange-400"
                    : error.includes("server") || error.includes("Server")
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                  {/* Show user-friendly message for PIN errors */}
                  {error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah")
                    ? "PIN yang Anda masukkan tidak sesuai. Silakan periksa kembali PIN dari penyelenggara."
                    : error.includes("Request failed with status code 400")
                      ? "Terjadi kesalahan validasi data. Pastikan semua field telah diisi dengan benar."
                      : error
                  }
                </p>
                {(error.includes("PIN") || error.includes("pin") || error.includes("tidak valid") || error.includes("salah")) && (
                  <div className="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
                    💡 <strong>Tips:</strong> Pastikan PIN yang dimasukkan sesuai dengan yang diberikan penyelenggara. PIN bersifat case-sensitive.
                  </div>
                )}
                {(error.includes("tunggu") || error.includes("percobaan")) && (
                  <div className="mt-3 text-xs text-orange-600 dark:text-orange-400">
                    💡 <strong>Tips:</strong> Tunggu beberapa menit sebelum mencoba lagi
                  </div>
                )}
                {(error.includes("sudah ada") || error.includes("duplicate")) && (
                  <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                    💡 <strong>Tips:</strong> Periksa kembali data yang dimasukkan, mungkin sudah pernah melakukan presensi
                  </div>
                )}
              </div>
            )}

            <Button
              className="rounded-xl text-base font-bold py-4 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              isDisabled={!timeValidation.isValid}
              isLoading={loading}
              type="submit"
            >
              {loading
                ? "🔄 Menyimpan..."
                : timeValidation.isValid
                  ? "💾 Simpan Presensi"
                  : timeValidation.type === "early"
                    ? "⏰ Belum Waktunya"
                    : "⛔ Waktu Habis"}
            </Button>
          </form>

          {/* Copyright */}
          <div className="w-full text-center text-xs text-zinc-400 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            &copy; {new Date().getFullYear()} e-presensi. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
