import React from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import {
  IconCalendarEvent,
  IconUser,
  IconMail,
  IconUserPlus,
  IconLogin,
  IconSparkles,
} from "@tabler/icons-react";

import { userState } from "@/config/recoil";
import PasswordInput from "@/components/PasswordInput";
import DefaultLayout from "@/layouts/default";
import fetchApi from "@/config/api";
import NotificationContainer from "@/components/NotificationContainer";
import { useNotification } from "@/hooks/useNotification";

export default function IndexPage() {
  const [showRegister, setShowRegister] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { notifications, showSuccess, showError, removeNotification } =
    useNotification();
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userState);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const loginData = {
      login: formData.get("login") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await fetchApi("POST", "/auth/login", loginData);

      // Handle successful login (e.g., save token, redirect)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        // Save user data to recoil and localStorage
        if (response.data.user) {
          setUser(response.data.user);
        }
        showSuccess("Login Berhasil", "Selamat datang kembali!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      // Handle error (e.g., show notification)
      showError("Login Gagal", error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const registerData = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const confirmPassword = formData.get("confirmPassword") as string;

    if (registerData.password !== confirmPassword) {
      showError("Validasi Error", "Password tidak cocok");
      setIsLoading(false);

      return;
    }

    try {
      const response = await fetchApi("POST", "/auth/register", registerData);

      // Handle successful registration with JWT token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        // Save user data to recoil and localStorage
        if (response.data.user) {
          setUser(response.data.user);
        }
        showSuccess(
          "Register Berhasil",
          "Akun berhasil dibuat! Selamat datang!",
        );
        navigate("/dashboard");
      } else {
        // If no token in response, show success and switch to login
        showSuccess(
          "Register Berhasil",
          "Akun berhasil dibuat! Silakan login.",
        );
        setShowRegister(false);
      }
    } catch (error: any) {
      // Handle error (e.g., show notification)
      showError(
        "Register Gagal",
        error.response?.data?.message || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="hidden lg:block space-y-8">
            <div className="relative">
              {/* Animated background shapes */}
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-violet-200 to-purple-300 rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full blur-xl opacity-60 animate-pulse delay-1000" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                    <IconCalendarEvent className="text-white" size={40} />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      E-Presensi
                    </h1>
                    <p className="text-lg text-violet-600 dark:text-violet-400 font-medium">
                      Digital Attendance System
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">
                    Kelola Presensi dengan{" "}
                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      Mudah & Efisien
                    </span>
                  </h2>
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Sistem presensi digital yang memungkinkan Anda mengelola
                    kegiatan dan mengumpulkan tanda tangan elektronik dengan
                    mudah.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-8">
                  <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-xl border border-violet-200 dark:border-violet-800">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                      <IconSparkles
                        className="text-violet-600 dark:text-violet-400"
                        size={20}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Tanda Tangan Digital
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Kumpulkan tanda tangan peserta secara digital
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <IconCalendarEvent
                        className="text-blue-600 dark:text-blue-400"
                        size={20}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Manajemen Kegiatan
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Buat dan kelola berbagai jenis kegiatan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Register Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-2 border-violet-200/50 dark:border-violet-800/50 shadow-2xl">
              <CardBody className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                      <IconCalendarEvent className="text-white" size={32} />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {showRegister ? "Buat Akun Baru" : "Selamat Datang Kembali"}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {showRegister
                      ? "Daftar untuk mulai menggunakan E-Presensi"
                      : "Masuk ke akun Anda untuk melanjutkan"}
                  </p>
                </div>

                {/* Toggle Buttons */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-6">
                  <Button
                    className={`flex-1 transition-all duration-300 ${!showRegister
                      ? "bg-white dark:bg-zinc-700 shadow-sm text-violet-600 dark:text-violet-400"
                      : "bg-transparent text-zinc-500"
                      }`}
                    radius="lg"
                    startContent={<IconLogin size={18} />}
                    variant="light"
                    onClick={() => setShowRegister(false)}
                  >
                    Login
                  </Button>
                  <Button
                    className={`flex-1 transition-all duration-300 ${showRegister
                      ? "bg-white dark:bg-zinc-700 shadow-sm text-violet-600 dark:text-violet-400"
                      : "bg-transparent text-zinc-500"
                      }`}
                    radius="lg"
                    startContent={<IconUserPlus size={18} />}
                    variant="light"
                    onClick={() => setShowRegister(true)}
                  >
                    Register
                  </Button>
                </div>

                <Divider className="mb-6" />

                {/* Forms */}
                {!showRegister ? (
                  <form className="space-y-5" onSubmit={handleLogin}>
                    <Input
                      isRequired
                      autoComplete="username"
                      label="Email atau Username"
                      name="login"
                      placeholder="Masukkan email atau username"
                      radius="lg"
                      startContent={
                        <IconUser className="text-zinc-400" size={20} />
                      }
                      type="text"
                      variant="bordered"
                    />
                    <PasswordInput
                      isRequired
                      autoComplete="current-password"
                      label="Password"
                      name="password"
                      placeholder="Masukkan password"
                      radius="lg"
                      variant="bordered"
                    />
                    <Button
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg"
                      isLoading={isLoading}
                      radius="lg"
                      size="lg"
                      startContent={!isLoading && <IconLogin size={20} />}
                      type="submit"
                    >
                      {isLoading ? "Memproses..." : "Masuk"}
                    </Button>
                  </form>
                ) : (
                  <form className="space-y-5" onSubmit={handleRegister}>
                    <Input
                      isRequired
                      autoComplete="name"
                      label="Nama Lengkap"
                      name="name"
                      placeholder="Masukkan nama lengkap"
                      radius="lg"
                      startContent={
                        <IconUser className="text-zinc-400" size={20} />
                      }
                      type="text"
                      variant="bordered"
                    />
                    <Input
                      isRequired
                      autoComplete="username"
                      label="Username"
                      name="username"
                      placeholder="Masukkan username"
                      radius="lg"
                      startContent={
                        <IconUser className="text-zinc-400" size={20} />
                      }
                      type="text"
                      variant="bordered"
                    />
                    <Input
                      isRequired
                      autoComplete="email"
                      label="Email"
                      name="email"
                      placeholder="Masukkan email"
                      radius="lg"
                      startContent={
                        <IconMail className="text-zinc-400" size={20} />
                      }
                      type="email"
                      variant="bordered"
                    />
                    <PasswordInput
                      isRequired
                      autoComplete="new-password"
                      label="Password"
                      name="password"
                      placeholder="Masukkan password"
                      radius="lg"
                      variant="bordered"
                    />
                    <PasswordInput
                      isRequired
                      autoComplete="new-password"
                      label="Konfirmasi Password"
                      name="confirmPassword"
                      placeholder="Masukkan ulang password"
                      radius="lg"
                      variant="bordered"
                    />
                    <Button
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg"
                      isLoading={isLoading}
                      radius="lg"
                      size="lg"
                      startContent={!isLoading && <IconUserPlus size={20} />}
                      type="submit"
                    >
                      {isLoading ? "Memproses..." : "Daftar"}
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
