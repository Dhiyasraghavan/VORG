import React, { useState } from "react";
import { motion } from "framer-motion";
import { validateEmail } from "../utils/validation";
import { useToast } from "../context/ToastContext";

interface VolunteerLoginProps {
  onSuccess: (email: string, pass: string) => void;
  onBack: () => void;
  onGoToSignup: () => void;
}

const VolunteerLogin: React.FC<VolunteerLoginProps> = ({
  onSuccess,
  onBack,
  onGoToSignup,
}) => {
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState({ email: "", pass: "" });
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(creds.email)) {
      showToast("Invalid email format. Please check and try again.", "error");
      return;
    }

    if (creds.pass.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);
    try {
      await onSuccess(creds.email, creds.pass);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <button
        onClick={onBack}
        className="text-primary mb-8 flex items-center gap-2 hover:underline text-sm transition-colors"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs">
          ←
        </span>
        Back to Entry
      </button>

      <div className="section-gradient-border bg-secondary/80 p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-3xl" />

        <div className="text-center mb-10 relative z-10">
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
            VOLUNTEER
          </h2>
          <p className="text-textLight/60 text-sm font-medium tracking-widest uppercase">
            Identity Verification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-textLight/40 uppercase tracking-widest mb-2 ml-1">
              Email Terminal
            </label>
            <input
              type="email"
              required
              value={creds.email}
              onChange={(e) =>
                setCreds((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full bg-background/60 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all placeholder:text-white/10 font-medium"
              placeholder="v-protocol@network.org"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-textLight/40 uppercase tracking-widest mb-2 ml-1">
              Access Pass
            </label>
            <input
              type="password"
              required
              value={creds.pass}
              onChange={(e) =>
                setCreds((prev) => ({ ...prev, pass: e.target.value }))
              }
              className="w-full bg-background/60 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all placeholder:text-white/10 font-black tracking-widest"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:brightness-110 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all relative overflow-hidden group mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>SYNCING...</span>
              </div>
            ) : (
              <span className="tracking-widest uppercase">
                Initialize Access
              </span>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center relative z-10">
          <p className="text-textLight/60 text-sm font-medium mb-4">
            New to the Volunteer Network?
          </p>
          <button
            onClick={onGoToSignup}
            className="text-primary font-bold hover:underline tracking-tight"
          >
            Create New Volunteer Profile
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] text-textLight/20 font-black uppercase tracking-[0.3em] mt-8">
        V-ORG IDENTITY PROTOCOL v3.2 // VOLUNTEER_BRANCH
      </p>
    </motion.div>
  );
};

export default VolunteerLogin;
