import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { compressImage } from '../services/imageService';
import { validateEmail, validatePassword } from '../utils/validation';
import { useToast } from '../context/ToastContext';

interface VolunteerRegistrationProps {
    onSubmit: (data: Partial<UserProfile>, password: string) => void;
    onBack: () => void;
}

const VolunteerRegistration: React.FC<VolunteerRegistrationProps> = ({ onSubmit, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        location: '',
        profileImages: [] as string[]
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { showToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(formData.email)) {
            showToast("Invalid email format.", 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast("Passwords do not match.", 'error');
            return;
        }

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            showToast(passwordCheck.errors[0], 'error');
            return;
        }

        onSubmit(formData, password);
    };

    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result as string, 300, 300);
                const newImages = [...formData.profileImages];
                newImages[index] = compressed;
                setFormData(prev => ({
                    ...prev,
                    profileImages: newImages
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
        >
            <button
                onClick={onBack}
                className="text-primary mb-8 flex items-center gap-2 hover:underline text-sm transition-colors"
            >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs">←</span>
                Back to Login
            </button>

            <div className="section-gradient-border bg-secondary/80 p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/10 blur-3xl opacity-50" />

                <div className="mb-10 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-3xl font-black text-white tracking-tighter">JOIN NETWORK</h2>
                        <div className="flex gap-1">
                            {[1, 2].map(i => (
                                <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                    <p className="text-textLight/60 text-xs font-bold tracking-widest uppercase">
                        {step === 1 ? 'Step 01: Biological Identity' : 'Step 02: Visual Verification'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {step === 1 ? (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em] mb-2 ml-1">Full Legal Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background/60 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all font-medium"
                                    placeholder="e.g. Jordan Smith"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em] mb-2 ml-1">Secure Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-background/60 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all font-medium"
                                    placeholder="name@network.org"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em] mb-2 ml-1">Phone Number (Tactical Comms)</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full bg-background/60 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all font-medium"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em] mb-2 ml-1">Operational Base (City)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background/60 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all font-medium"
                                    placeholder="e.g. Mumbai, India"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-background/60 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all font-medium"
                                    placeholder="Minimum 8 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em] mb-2 ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-background/60 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all font-medium"
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-5 rounded-2xl border border-white/5 transition-all mt-4 tracking-widest uppercase text-sm"
                            >
                                Proceed to Verification
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <p className="text-sm text-textLight/80 leading-relaxed mb-4">
                                Upload 3 clear front-facing identification images. Our neural network will verify your profile for the safety of our mission.
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        onClick={() => document.getElementById(`cam-input-${i}`)?.click()}
                                        className={`aspect-square bg-background/60 border border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative ${formData.profileImages[i] ? 'border-primary/60 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' : 'border-white/10 hover:border-primary/40'}`}
                                    >
                                        {formData.profileImages[i] ? (
                                            <>
                                                <img src={formData.profileImages[i]} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" alt={`Preview ${i}`} />
                                                <div className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow-lg z-20">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </>
                                        ) : (
                                            <svg className="w-6 h-6 mb-1 text-white/20 group-hover:text-primary/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                            </svg>
                                        )}
                                        <span className={`text-[10px] font-bold uppercase relative z-10 ${formData.profileImages[i] ? 'text-white' : 'text-white/20'}`}>
                                            {formData.profileImages[i] ? 'Re-scan' : `Cam ${i + 1}`}
                                        </span>
                                        <input
                                            id={`cam-input-${i}`}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(i, e)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-white/5 text-white/60 font-bold py-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                                >
                                    Adjust Identity
                                </button>
                                <button
                                    type="submit"
                                    disabled={formData.profileImages.length < 3 || formData.profileImages.some(img => !img)}
                                    className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 disabled:opacity-30 disabled:grayscale transition-all uppercase tracking-widest text-sm"
                                >
                                    {formData.profileImages.filter(img => img).length < 3
                                        ? `Upload ${3 - formData.profileImages.filter(img => img).length} More`
                                        : 'Finalize Profile'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </div>
        </motion.div>
    );
};

export default VolunteerRegistration;

