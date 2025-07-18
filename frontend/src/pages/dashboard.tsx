import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  IconCalendarEvent,
  IconUsers,
  IconTrendingUp,
  IconPlus,
  IconChartBar,
  IconCalendarCheck,
  IconClipboardList,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

import fetchApi from "@/config/api";
import DefaultLayout from "@/layouts/default";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalKegiatan: 0,
    kegiatanHariIni: 0,
    totalPresensi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch semua data statistik secara paralel
        const [kegiatanRes, todayRes, presensiRes] = await Promise.all([
          fetchApi("get", "/kegiatan/count"),
          fetchApi("get", "/kegiatan/today/count"),
          fetchApi("get", "/kegiatan/presensi/total"),
        ]);

        setStats({
          totalKegiatan: kegiatanRes?.data?.total || 0,
          kegiatanHariIni: todayRes?.data?.total || 0,
          totalPresensi: presensiRes?.data?.total || 0,
        });
      } catch {
        setStats({
          totalKegiatan: 0,
          kegiatanHariIni: 0,
          totalPresensi: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DefaultLayout title="Dashboard">
      <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16 md:-translate-y-32 md:translate-x-32" />
          <div className="absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-white/5 rounded-full blur-2xl translate-y-12 -translate-x-12 md:translate-y-24 md:-translate-x-24" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="p-2 md:p-3 bg-white/20 rounded-lg md:rounded-xl backdrop-blur-sm flex-shrink-0">
                <IconCalendarEvent className="md:w-8 md:h-8" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold leading-tight">
                  Selamat Datang di E-Presensi
                </h1>
                <p className="text-white/80 text-sm md:text-lg mt-1 leading-relaxed">
                  Kelola kegiatan dan presensi dengan mudah dan efisien
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button
                as={Link}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                size="md"
                startContent={<IconPlus size={18} />}
                to="/kegiatan"
                variant="bordered"
              >
                Buat Kegiatan Baru
              </Button>
              <Button
                as={Link}
                className="bg-white text-purple-600 hover:bg-white/90"
                size="md"
                startContent={<IconChartBar size={18} />}
                to="/kegiatan"
                variant="solid"
              >
                Lihat Semua Kegiatan
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Total Kegiatan Card */}
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border-violet-200 dark:border-violet-800 hover:shadow-lg transition-all duration-300">
            <CardBody className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-violet-600 dark:text-violet-400 mb-1">
                    Total Kegiatan
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {loading ? (
                      <div className="w-12 md:w-16 h-6 md:h-8 bg-violet-200 dark:bg-violet-800 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl md:text-3xl font-bold text-violet-900 dark:text-violet-100">
                        {stats.totalKegiatan}
                      </p>
                    )}
                    <Chip
                      className="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300"
                      size="sm"
                      variant="flat"
                    >
                      Aktif
                    </Chip>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-violet-100 dark:bg-violet-900/50 rounded-lg md:rounded-xl flex-shrink-0">
                  <IconCalendarEvent
                    className="text-violet-600 dark:text-violet-400"
                    size={20}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Presensi Hari Ini Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardBody className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Kegiatan Hari Ini
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {loading ? (
                      <div className="w-12 md:w-16 h-6 md:h-8 bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.kegiatanHariIni}
                      </p>
                    )}
                    <Chip
                      className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      size="sm"
                      variant="flat"
                    >
                      Jadwal
                    </Chip>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg md:rounded-xl flex-shrink-0">
                  <IconCalendarCheck
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Peserta Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardBody className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Total Presensi
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {loading ? (
                      <div className="w-12 md:w-16 h-6 md:h-8 bg-emerald-200 dark:bg-emerald-800 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl md:text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                        {stats.totalPresensi}
                      </p>
                    )}
                    <Chip
                      className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                      size="sm"
                      startContent={<IconTrendingUp size={12} />}
                      variant="flat"
                    >
                      Total
                    </Chip>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg md:rounded-xl flex-shrink-0">
                  <IconUsers
                    className="text-emerald-600 dark:text-emerald-400"
                    size={20}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tips & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {/* Tips Section */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/50 dark:to-yellow-950/50 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2 md:pb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <IconClipboardList
                    className="text-orange-600 dark:text-orange-400"
                    size={20}
                  />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-orange-900 dark:text-orange-100">
                  Tips Penggunaan
                </h2>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base text-orange-800 dark:text-orange-200">
                    Buat kegiatan baru dengan mengklik tombol{" "}
                    <span className="font-semibold">Buat Kegiatan Baru</span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base text-orange-800 dark:text-orange-200">
                    Kelola dan edit kegiatan langsung dari daftar kegiatan
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base text-orange-800 dark:text-orange-200">
                    Gunakan fitur pencarian untuk menemukan kegiatan dengan
                    cepat
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base text-orange-800 dark:text-orange-200">
                    Download PDF presensi untuk laporan dan dokumentasi
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2 md:pb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <IconTrendingUp
                    className="text-purple-600 dark:text-purple-400"
                    size={20}
                  />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-purple-900 dark:text-purple-100">
                  Aksi Cepat
                </h2>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                <Button
                  as={Link}
                  className="w-full justify-start bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/40"
                  size="md"
                  startContent={<IconPlus size={18} />}
                  to="/kegiatan"
                  variant="bordered"
                >
                  Buat Kegiatan Baru
                </Button>
                <Button
                  as={Link}
                  className="w-full justify-start bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/40"
                  size="md"
                  startContent={<IconCalendarEvent size={18} />}
                  to="/kegiatan"
                  variant="bordered"
                >
                  Lihat Semua Kegiatan
                </Button>
                <Button
                  as={Link}
                  className="w-full justify-start bg-white dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/40"
                  size="md"
                  startContent={<IconChartBar size={18} />}
                  to="/kegiatan"
                  variant="bordered"
                >
                  Lihat Statistik
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
