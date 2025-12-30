import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Beranda from "./pages/Beranda";
import Kinerja from "./pages/Kinerja";
import Aspirasi from "./pages/Aspirasi";
import Program from "./pages/Program";
import Media from "./pages/Media";
import Tentang from "./pages/Tentang";
import Kontak from "./pages/Kontak";
import Aduan from "./pages/Aduan";



export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Beranda />} />
        <Route path="/kinerja" element={<Kinerja />} />
        <Route path="/aspirasi" element={<Aspirasi />} />
        <Route path="/program" element={<Program />} />
        <Route path="/media" element={<Media />} />
        <Route path="/tentang" element={<Tentang />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/aduan" element={<Aduan />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
