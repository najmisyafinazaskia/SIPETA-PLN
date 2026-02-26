import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import LandingPage from "./pages/Landing/LandingPage";
import KabKotPage from "./pages/Dashboard/KabKotPage";
import KecamatanPage from "./pages/Dashboard/KecamatanPage";
import DesaPage from "./pages/Dashboard/DesaPage";
import DusunPage from "./pages/Dashboard/DusunPage";
import DusunDetailPage from "./pages/Dashboard/DusunDetailPage";
import RegionPage from "./pages/Dashboard/RegionPage";
import RegionDetailPage from "./pages/Dashboard/RegionDetailPage";
import Up3Page from "./pages/Dashboard/Up3Page";
import Up3Detail from "./pages/Dashboard/Up3Detail";
import Up3KecamatanDetail from "./pages/Dashboard/Up3KecamatanDetail";
import Up3DesaDetail from "./pages/Dashboard/Up3DesaDetail";
import UlpPage from "./pages/Dashboard/UlpPage";
import UlpKabupatenDetail from "./pages/Dashboard/UlpKabupatenDetail";
import UlpUnitDetail from "./pages/Dashboard/UlpUnitDetail";
import UlpKecamatanDetail from "./pages/Dashboard/UlpKecamatanDetail";
import UlpDesaDetail from "./pages/Dashboard/UlpDesaDetail";
import CallCenterPage from "./pages/Dashboard/CallCenterPage";
import VerifikasiPage from "./pages/VerifikasiPage";
import SignIn from "./pages/AuthPages/SignIn"; // Import SignIn
import HelpPage from "./pages/Landing/HelpPage"; // Import HelpPage

import { ScrollToTop } from "./components/common/ScrollToTop";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/help" element={<HelpPage />} />


        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <AppLayout /> : <Navigate to="/signin" replace />
          }
        >
          <Route index element={<KabKotPage />} />
          <Route path="kecamatan" element={<KecamatanPage />} />
          <Route path="desa" element={<DesaPage />} />
          <Route path="dusun" element={<DusunPage />} /> {/* Route Dusun */}
          <Route path="dusun/:id" element={<DusunDetailPage />} />
          <Route path="region" element={<RegionPage />} />
          <Route path="region/detail/:name" element={<RegionDetailPage />} />
          <Route path="up3" element={<Up3Page />} />
          <Route path="up3/detail/:name" element={<Up3Detail />} />
          <Route path="up3/kecamatan/:name" element={<Up3KecamatanDetail />} />
          <Route path="up3/desa/:name" element={<Up3DesaDetail />} />
          <Route path="ulp" element={<UlpPage />} />
          <Route path="ulp/kabupaten/:name" element={<UlpKabupatenDetail />} />
          <Route path="ulp/unit/:name" element={<UlpUnitDetail />} />
          <Route path="ulp/kecamatan/:name" element={<UlpKecamatanDetail />} />
          <Route path="ulp/desa/:name" element={<UlpDesaDetail />} />
          <Route path="verifikasi" element={<VerifikasiPage />} />
          <Route path="call-center" element={<CallCenterPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

