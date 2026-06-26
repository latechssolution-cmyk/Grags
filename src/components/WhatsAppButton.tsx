import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useSettings } from "@/store/settingsStore";

const WhatsAppButton = () => {
  const { settings } = useSettings();

  return (
    <motion.a
      href={`https://wa.me/${settings.whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.1 }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-accent-foreground" />
    </motion.a>
  );
};

export default WhatsAppButton;
