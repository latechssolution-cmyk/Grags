import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import CinematicLoader from "@/components/CinematicLoader";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import CollectionsSection from "@/components/CollectionsSection";
import FabricSection from "@/components/FabricSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  const [loading, setLoading] = useState(true);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <CinematicLoader onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {!loading && (
        <div className="min-h-screen bg-background">
          <AnnouncementBar />
          <Navbar />
          <main>
            <HeroSection />
            <ProductGrid />
            <CollectionsSection />
            <FabricSection />
            <ReviewsSection />
          </main>
          <Footer />
          <WhatsAppButton />
          <div className="grain-overlay" />
        </div>
      )}
    </>
  );
};

export default Index;
