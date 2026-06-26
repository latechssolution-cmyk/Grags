import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NewIn from "./pages/NewIn";
import Tops from "./pages/Tops";
import Bottoms from "./pages/Bottoms";
import Essentials from "./pages/Essentials";
import Heritage from "./pages/Heritage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import CollectionPage from "./pages/CollectionPage";
import ProductDetail from "./pages/ProductDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-in" element={<NewIn />} />
          <Route path="/tops" element={<Tops />} />
          <Route path="/bottoms" element={<Bottoms />} />
          <Route path="/essentials" element={<Essentials />} />
          <Route path="/heritage" element={<Heritage />} />
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/product/:code" element={<ProductDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
