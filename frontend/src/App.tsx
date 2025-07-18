import { Route, Routes, useLocation, Navigate, Outlet } from "react-router-dom";
import React from "react";
import { useSetRecoilState } from "recoil";

import ListKegiatanPage from "./pages/kegiatan/ListKegiatan";
import FormPresensi from "./pages/kegiatan/FormPresensi";

import LoadingPage from "@/components/LoadingPage";
import { userState } from "@/config/recoil";
import { checkLoginStatus } from "@/config/api";
import IndexPage from "@/pages/index";
import DashboardPage from "@/pages/dashboard";

function AuthRoute({
  children,
  requireAuth,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(
    null,
  );
  const setUser = useSetRecoilState(userState);
  const location = useLocation();

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const res = await checkLoginStatus();

      if (mounted) {
        setIsAuthenticated(res.loggedIn);
        if (res.loggedIn && res.user) {
          setUser(res.user);
        } else {
          setUser(null);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setUser]);

  if (isAuthenticated === null) {
    return <LoadingPage />;
  }

  // Jika route butuh login dan user belum login, redirect ke / (login)
  if (requireAuth && !isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/" />;
  }
  // Jika route tidak butuh login dan user sudah login, redirect ke dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/dashboard" />;
  }

  return <>{children}</>;
}

// Component untuk public routes
function PublicRoutes() {
  return (
    <AuthRoute requireAuth={false}>
      <Outlet />
    </AuthRoute>
  );
}

// Component untuk protected routes
function ProtectedRoutes() {
  return (
    <AuthRoute requireAuth={true}>
      <Outlet />
    </AuthRoute>
  );
}

function App() {
  return (
    <Routes>
      {/* Public Routes - No Authentication Required */}
      <Route element={<PublicRoutes />}>
        <Route element={<IndexPage />} path="/" />
      </Route>

      {/* Protected Routes - Authentication Required */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<ListKegiatanPage />} path="/kegiatan" />
      </Route>
      <Route element={<FormPresensi />} path="/presensi/:kegiatan_uuid" />
    </Routes>
  );
}

export default App;
