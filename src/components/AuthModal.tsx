import { useState } from "react";
import { X, User, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/authStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Mode = "login" | "signup";

export default function AuthModal({ open, onClose }: Props) {
  const { user, login, logout } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim()) return setError("Username is required.");
    if (!form.password.trim()) return setError("Password is required.");
    if (mode === "signup" && !form.email.trim()) return setError("Email is required.");

    // Session-only auth — no backend for user accounts
    login({ username: form.username.trim(), email: form.email.trim() || undefined });
    onClose();
    setForm({ username: "", email: "", password: "" });
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const field = (key: keyof typeof form, placeholder: string, type = "text") => (
    <div className="relative">
      <input
        type={key === "password" ? (showPw ? "text" : "password") : type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
      />
      {key === "password" && (
        <button
          type="button"
          onClick={() => setShowPw((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-sm p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={18} />
              </button>

              {user ? (
                <div className="text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-sm tracking-widest uppercase">{user.username}</p>
                    {user.email && <p className="text-xs text-white/40 mt-1">{user.email}</p>}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full border border-white/20 py-3 text-xs tracking-widest uppercase hover:border-white/60 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-sm tracking-widest uppercase font-medium">
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {field("username", "Username")}
                    {mode === "signup" && field("email", "Email", "email")}
                    {field("password", "Password")}

                    {error && <p className="text-red-400 text-xs">{error}</p>}

                    <button
                      type="submit"
                      className="w-full bg-white text-black text-xs tracking-widest uppercase font-semibold py-3.5 hover:bg-white/90 transition-colors mt-2"
                    >
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </button>
                  </form>

                  <p className="text-center text-xs text-white/40 mt-5">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                      className="text-white/70 hover:text-white underline transition-colors"
                    >
                      {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
