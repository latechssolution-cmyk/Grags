import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cartStore";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, count, subtotal, updateQty, removeItem } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-background border-l border-foreground/10 z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <span className="text-sm font-medium tracking-widest uppercase">
                  Cart ({count})
                </span>
              </div>
              <button onClick={onClose} className="p-1 hover:text-foreground/60 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-foreground/40">
                  <ShoppingBag size={36} />
                  <p className="text-sm tracking-widest uppercase">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-4"
                  >
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate">{item.name}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {item.color && `${item.color} · `}Size {item.size}
                      </p>
                      <p className="text-sm mt-1">{item.price}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded border border-foreground/20 flex items-center justify-center hover:border-foreground/60 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded border border-foreground/20 flex items-center justify-center hover:border-foreground/60 transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-foreground/30 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-foreground/10 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60 tracking-widest uppercase text-xs">Subtotal</span>
                  <span className="font-medium">PKR {subtotal.toLocaleString()}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="block w-full text-center bg-foreground text-background text-xs tracking-widest uppercase font-semibold py-3.5 hover:bg-foreground/90 transition-colors"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
