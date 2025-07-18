import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { Chip } from "@heroui/chip";
import { CalendarDateTime } from "@internationalized/date";
import { IconX } from "@tabler/icons-react";

import fetchApi from "@/config/api";
import { useNotification } from "@/hooks/useNotification";

// Helper functions for date conversion
const stringToDateValue = (dateString: string) => {
  if (!dateString) return null;
  try {
    // Convert from "YYYY-MM-DDTHH:mm" to CalendarDateTime
    const date = new Date(dateString);

    return new CalendarDateTime(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
    );
  } catch {
    return null;
  }
};

const dateValueToString = (dateValue: any) => {
  if (!dateValue) return "";
  try {
    // Convert CalendarDateTime back to string format
    const year = dateValue.year.toString().padStart(4, "0");
    const month = dateValue.month.toString().padStart(2, "0");
    const day = dateValue.day.toString().padStart(2, "0");
    const hour = dateValue.hour.toString().padStart(2, "0");
    const minute = dateValue.minute.toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return "";
  }
};

interface FormKegiatanProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

interface KegiatanFormData {
  nama: string;
  deskripsi: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  latitude?: number;
  longitude?: number;
  pin?: string;
  attendance_fields: string[];
}

const defaultAttendanceFields = ["Nama Lengkap", "Jabatan", "No. Telp"];

// Helper function to get default times
const getDefaultTimes = () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return {
    waktu_mulai: formatDateTime(now),
    waktu_selesai: formatDateTime(oneHourLater),
  };
};

export default function FormKegiatan({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEdit = false,
}: FormKegiatanProps) {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [customField, setCustomField] = useState("");

  const [formData, setFormData] = useState<KegiatanFormData>(() => {
    const defaultTimes = getDefaultTimes();

    return {
      nama: initialData?.nama || "",
      deskripsi: initialData?.deskripsi || "",
      waktu_mulai: initialData?.waktu_mulai || defaultTimes.waktu_mulai,
      waktu_selesai: initialData?.waktu_selesai || defaultTimes.waktu_selesai,
      lokasi: initialData?.lokasi || "",
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
      pin: initialData?.pin || "",
      attendance_fields: initialData?.attendance_fields || [
        ...defaultAttendanceFields,
      ],
    };
  });

  // Sync formData jika initialData berubah (edit mode)
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        nama: initialData.nama || "",
        deskripsi: initialData.deskripsi || "",
        waktu_mulai: initialData.waktu_mulai || "",
        waktu_selesai: initialData.waktu_selesai || "",
        lokasi: initialData.lokasi || "",
        latitude: initialData.latitude || undefined,
        longitude: initialData.longitude || undefined,
        pin: initialData.pin || "",
        attendance_fields: initialData.attendance_fields || [
          ...defaultAttendanceFields,
        ],
      });
    }
  }, [isEdit, initialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof KegiatanFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setUseCurrentLocation(false);
          showSuccess("Lokasi berhasil diambil", "Koordinat lokasi tersimpan");
        },
        (error) => {
          setUseCurrentLocation(false);
          showError("Gagal mengambil lokasi", error.message);
        },
      );
    } else {
      setUseCurrentLocation(false);
      showError(
        "Geolokasi tidak didukung",
        "Browser tidak mendukung geolokasi",
      );
    }
  };

  const addCustomField = () => {
    if (
      customField.trim() &&
      !formData.attendance_fields.includes(customField)
    ) {
      setFormData((prev) => ({
        ...prev,
        attendance_fields: [...prev.attendance_fields, customField.trim()],
      }));
      setCustomField("");
    }
  };

  const removeAttendanceField = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      attendance_fields: prev.attendance_fields.filter((f) => f !== field),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama kegiatan wajib diisi";
    if (!formData.deskripsi.trim())
      newErrors.deskripsi = "Deskripsi wajib diisi";
    if (!formData.waktu_mulai)
      newErrors.waktu_mulai = "Waktu mulai wajib diisi";
    if (!formData.waktu_selesai)
      newErrors.waktu_selesai = "Waktu selesai wajib diisi";
    if (!formData.lokasi.trim()) newErrors.lokasi = "Lokasi wajib diisi";

    // Validate time
    if (formData.waktu_mulai && formData.waktu_selesai) {
      const startTime = new Date(formData.waktu_mulai);
      const endTime = new Date(formData.waktu_selesai);

      if (endTime <= startTime) {
        newErrors.waktu_selesai =
          "Waktu selesai harus lebih besar dari waktu mulai";
      }
    }

    if (formData.attendance_fields.length === 0) {
      newErrors.attendance_fields = "Minimal satu field presensi harus dipilih";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = isEdit ? `/kegiatan/${initialData?.uuid}` : "/kegiatan";
      const method = isEdit ? "PUT" : "POST";

      const response: any = await fetchApi(method, endpoint, formData);

      showSuccess(
        isEdit ? "Kegiatan berhasil diperbarui" : "Kegiatan berhasil dibuat",
        response.message || "Data kegiatan telah tersimpan",
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      showError(
        isEdit ? "Gagal memperbarui kegiatan" : "Gagal membuat kegiatan",
        error.response?.data?.message || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    const defaultTimes = getDefaultTimes();

    setFormData({
      nama: "",
      deskripsi: "",
      waktu_mulai: defaultTimes.waktu_mulai,
      waktu_selesai: defaultTimes.waktu_selesai,
      lokasi: "",
      latitude: undefined,
      longitude: undefined,
      pin: "",
      attendance_fields: [...defaultAttendanceFields],
    });
    setErrors({});
    setCustomField("");
    onClose();
  };

  return (
    <Modal
      closeButton={<></>}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      size="2xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-row items-center justify-between">
          <span>{isEdit ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}</span>
          <Button isIconOnly size="sm" variant="light" onPress={handleClose}>
            <IconX size={18} />
          </Button>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {/* Nama Kegiatan */}
            <Input
              errorMessage={errors.nama}
              isInvalid={!!errors.nama}
              label="Nama Kegiatan"
              placeholder="Masukkan nama kegiatan"
              value={formData.nama}
              onChange={(e) => handleInputChange("nama", e.target.value)}
            />

            {/* Deskripsi */}
            <Textarea
              errorMessage={errors.deskripsi}
              isInvalid={!!errors.deskripsi}
              label="Deskripsi"
              placeholder="Masukkan deskripsi kegiatan"
              value={formData.deskripsi}
              onChange={(e) => handleInputChange("deskripsi", e.target.value)}
            />

            {/* Waktu Mulai dan Selesai */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                errorMessage={errors.waktu_mulai}
                granularity="minute"
                hourCycle={24}
                isInvalid={!!errors.waktu_mulai}
                label="Waktu Mulai"
                value={stringToDateValue(formData.waktu_mulai)}
                onChange={(date) =>
                  handleInputChange("waktu_mulai", dateValueToString(date))
                }
              />
              <DatePicker
                errorMessage={errors.waktu_selesai}
                granularity="minute"
                hourCycle={24}
                isInvalid={!!errors.waktu_selesai}
                label="Waktu Selesai"
                value={stringToDateValue(formData.waktu_selesai)}
                onChange={(date) =>
                  handleInputChange("waktu_selesai", dateValueToString(date))
                }
              />
            </div>

            {/* Lokasi */}
            <Input
              errorMessage={errors.lokasi}
              isInvalid={!!errors.lokasi}
              label="Lokasi"
              placeholder="Masukkan lokasi kegiatan"
              value={formData.lokasi}
              onChange={(e) => handleInputChange("lokasi", e.target.value)}
            />

            {/* Koordinat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Latitude"
                placeholder="Latitude (opsional)"
                type="number"
                value={formData.latitude?.toString() || ""}
                onChange={(e) =>
                  handleInputChange(
                    "latitude",
                    parseFloat(e.target.value) || undefined,
                  )
                }
              />
              <Input
                label="Longitude"
                placeholder="Longitude (opsional)"
                type="number"
                value={formData.longitude?.toString() || ""}
                onChange={(e) =>
                  handleInputChange(
                    "longitude",
                    parseFloat(e.target.value) || undefined,
                  )
                }
              />
            </div>

            <Button
              color="secondary"
              isLoading={useCurrentLocation}
              variant="flat"
              onPress={getCurrentLocation}
            >
              {useCurrentLocation
                ? "Mengambil Lokasi..."
                : "Gunakan Lokasi Saat Ini"}
            </Button>

            {/* PIN */}
            <Input
              label="PIN Kegiatan"
              placeholder="PIN untuk akses kegiatan (opsional)"
              value={formData.pin}
              onChange={(e) => handleInputChange("pin", e.target.value)}
            />

            {/* Attendance Fields */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                htmlFor="customAttendanceField"
              >
                Field Presensi
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.attendance_fields.map((field) => (
                  <Chip
                    key={field}
                    color="primary"
                    variant="flat"
                    onClose={() => removeAttendanceField(field)}
                  >
                    {field}
                  </Chip>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="customAttendanceField"
                  placeholder="Tambah field custom"
                  size="sm"
                  value={customField}
                  onChange={(e) => setCustomField(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomField()}
                />
                <Button
                  color="primary"
                  size="sm"
                  variant="flat"
                  onPress={addCustomField}
                >
                  Tambah
                </Button>
              </div>
              {errors.attendance_fields && (
                <p className="text-danger text-sm">
                  {errors.attendance_fields}
                </p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Batal
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSubmit}>
            {isEdit ? "Perbarui" : "Simpan"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
