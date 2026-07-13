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
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import { PrivacyPage, TermsPage, ContactPage } from "./pages/LegalPages";
import JournalPage from "./pages/JournalPage";
import JournalArticlePage from "./pages/JournalArticlePage";
import Summer from "./pages/Summer";
import Winter from "./pages/Winter";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-in" element={<NewIn />} />
          <Route path="/summer" element={<Summer />} />
          <Route path="/winter" element={<Winter />} />
          <Route path="/tops" element={<Tops />} />
          <Route path="/bottoms" element={<Bottoms />} />
          <Route path="/essentials" element={<Essentials />} />
          <Route path="/heritage" element={<Heritage />} />
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/product/:code" element={<ProductDetail />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalArticlePage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
