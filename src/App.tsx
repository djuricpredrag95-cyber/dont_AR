import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import IzlaznostLayout from "@/components/IzlaznostLayout";
import Index from "./pages/Index";
import DataEntry from "./pages/DataEntry";
import NotFound from "./pages/NotFound";

// Izlaznost pages
import Login from "./pages/izlaznost/Login";
import Pregled from "./pages/izlaznost/Pregled";
import KsgTeamPage from "./pages/izlaznost/KsgTeamPage";
import KsgPregled from "./pages/izlaznost/KsgPregled";
import Teren from "./pages/izlaznost/Teren";
import Kolcentar from "./pages/izlaznost/Kolcentar";
import Bo from "./pages/izlaznost/Bo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DataEntry />} />
            <Route path="/pregled" element={<Index />} />

            <Route path="/izlaznost/login" element={<Login />} />
            <Route path="/izlaznost" element={<ProtectedRoute><IzlaznostLayout /></ProtectedRoute>}>
              <Route path="pregled" element={<Pregled />} />
              <Route path="ksg/:team" element={<KsgTeamPage />} />
              <Route path="ksg/pregled" element={<KsgPregled />} />
              <Route path="teren" element={<Teren />} />
              <Route path="kolcentar" element={<Kolcentar />} />
              <Route path="bo" element={<Bo />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
