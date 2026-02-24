
import React, { useState } from 'react';
import { Organization } from '../types';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { validateEmail } from '../utils/validation';

interface OrgLoginProps {
  onSubmit: (org: Organization, password: string) => void;
  onBack: () => void;
}

const OrgLogin: React.FC<OrgLoginProps> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState<Organization>({
    name: '',
    number: '',
    email: '',
    address: ''
  });
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.values(formData).some(v => v === '')) {
      showToast("All neural fields required for uplink.", 'error');
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast("Invalid email format. Please check and try again.", 'error');
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(formData, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      className="max-w-xl mx-auto py-10 px-4"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <button
        onClick={onBack}
        className="text-primary mb-6 flex items-center gap-2 hover:underline hover:text-indigo-300 transition-colors text-sm"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs">
          ←
        </span>
        Back to Home
      </button>
      <motion.div
        className="section-gradient-border bg-secondary/80 p-8 rounded-3xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.75)] relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <div className="absolute -top-24 right-0 w-56 h-56 bg-primary/25 blur-3xl" />
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Organization Access
        </h2>
        <p className="text-textLight mb-8 opacity-80 text-sm">
          Create a control profile for your organization so vorg can orchestrate events,
          volunteers, and impact analytics in one place.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Organization Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Hope Foundation"
              className="w-full bg-background/80 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Contact Number
            </label>
            <input
              type="tel"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-background/80 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@organization.org"
              className="w-full bg-background/80 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Physical Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Street, City, Zip Code"
              className="w-full bg-background/80 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40 resize-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your secure password"
              className="w-full bg-background/80 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={!isSubmitting ? { scale: 0.97 } : {}}
            className={`w-full bg-gradient-to-r from-primary via-indigo-500 to-primary text-white font-semibold py-4 rounded-2xl transition-all shadow-xl mt-4 flex items-center justify-center gap-2 text-sm tracking-wide uppercase ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110'
              }`}
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Access Dashboard'}</span>
            {!isSubmitting && (
              <span className="inline-flex h-6 w-6 rounded-full bg-white/10 items-center justify-center text-xs">
                ↗
              </span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default OrgLogin;
