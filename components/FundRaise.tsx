import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialFundDetails, FundDetails, AppView } from '../types';
import { createFundRequest } from '../services/firebaseService';
import { auth } from '../services/firebase';

interface FundRaiseProps {
    onSubmitSocial: (details: SocialFundDetails) => void;
    onSubmitEmergency: (details: FundDetails) => void;
    onBack: () => void;
}

const FundRaise: React.FC<FundRaiseProps> = ({ onSubmitSocial, onSubmitEmergency, onBack }) => {
    const [view, setView] = useState<'intro' | 'social' | 'emergency'>('intro');
    const [loading, setLoading] = useState(false);

    // Placeholder until Toast is unified
    const showLocalToast = (msg: string) => alert(msg);

    // Social Fund State
    const [socialData, setSocialData] = useState<SocialFundDetails>({
        raiserName: '',
        email: '',
        number: '',
        description: '',
        rupeesNeeded: 0,
        location: ''
    });

    const [emergencyData, setEmergencyData] = useState<Partial<FundDetails>>({
        raiserName: '',
        email: '',
        number: '',
        description: '',
        crisisType: 'Disaster',
        affectedPeople: 0,
        amountNeeded: 0
    });

    const handleSocialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            onSubmitSocial(socialData);
            setLoading(false);
        }, 1500);
    };

    const handleEmergencySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        setLoading(true);
        try {
            const finalData = {
                ...emergencyData,
                createdAt: new Date().toISOString(),
                currentAmount: 0
            } as FundDetails;

            await createFundRequest(auth.currentUser.uid, finalData);
            onSubmitEmergency(finalData);
            setView('intro');
        } catch (error) {
            showLocalToast("Transmission Error.");
        } finally {
            setLoading(false);
        }
    };

    const renderIntro = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="section-gradient-border bg-secondary/80 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500/10 blur-3xl" />
                <h2 className="text-3xl font-bold text-white mb-4">V-Org Fund Raiser</h2>
                <div className="space-y-4 text-textLight leading-relaxed">
                    <p>
                        The Fund Raise module empowers organizations to bridge the financial gap for their missions.
                        V-Org connects your verified needs with a community of compassionate volunteers and donors.
                    </p>
                    <div className="bg-background/40 p-5 rounded-2xl border border-white/5 space-y-3">
                        <h4 className="text-primary font-bold uppercase tracking-wider text-xs">How it Works</h4>
                        <ul className="list-disc list-inside space-y-2 text-sm opacity-90">
                            <li>Create a dedicated fund-raising campaign for events or crises.</li>
                            <li>Volunteers can review your request, verify the proof, and contribute directly.</li>
                            <li>Real-time tracking of funds ensures transparency and trust.</li>
                            <li>Multi-channel broadcasting alerts the relevant volunteer groups.</li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                    <button
                        onClick={() => setView('social')}
                        className="flex flex-col items-center p-6 bg-background/60 border border-white/10 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🤝</span>
                        </div>
                        <span className="font-bold text-white mb-1">Social Event Fund</span>
                        <span className="text-xs text-textLight/60 text-center">Raise money for community workshops, fairs, or local events.</span>
                    </button>

                    <button
                        onClick={() => setView('emergency')}
                        className="flex flex-col items-center p-6 bg-background/60 border border-white/10 rounded-2xl hover:border-red-500 hover:bg-red-500/5 transition-all group"
                    >
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🚨</span>
                        </div>
                        <span className="font-bold text-white mb-1">Emergency Fund</span>
                        <span className="text-xs text-textLight/60 text-center">Rapid financial mobilization for disasters and life-critical crises.</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );

    const renderSocialForm = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="section-gradient-border bg-secondary/80 p-8 rounded-3xl border border-white/10 relative"
        >
            <button onClick={() => setView('intro')} className="text-xs text-textLight hover:text-white mb-6 flex items-center gap-1">
                ← Back to Selection
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">Social Event Fund Request</h3>
            <form onSubmit={handleSocialSubmit} className="space-y-5">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-textLight">Fund Raiser Name / Organization</label>
                    <input
                        type="text"
                        required
                        value={socialData.raiserName}
                        onChange={(e) => setSocialData({ ...socialData, raiserName: e.target.value })}
                        placeholder="e.g. Green Earth Initiative"
                        className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-textLight">Gmail Account</label>
                        <input
                            type="email"
                            required
                            value={socialData.email}
                            onChange={(e) => setSocialData({ ...socialData, email: e.target.value })}
                            placeholder="e.g. org@gmail.com"
                            className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-textLight">Contact Number</label>
                        <input
                            type="tel"
                            required
                            value={socialData.number}
                            onChange={(e) => setSocialData({ ...socialData, number: e.target.value })}
                            placeholder="e.g. +91 9876543210"
                            className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-textLight">Description of the Event</label>
                    <textarea
                        required
                        rows={3}
                        value={socialData.description}
                        onChange={(e) => setSocialData({ ...socialData, description: e.target.value })}
                        placeholder="What is the purpose of this fund-raiser?"
                        className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all resize-none"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-textLight">Rupees Needed (₹)</label>
                        <input
                            type="number"
                            required
                            value={socialData.rupeesNeeded || ''}
                            onChange={(e) => setSocialData({ ...socialData, rupeesNeeded: Number(e.target.value) })}
                            placeholder="e.g. 50000"
                            className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-textLight">Location</label>
                        <input
                            type="text"
                            required
                            value={socialData.location}
                            onChange={(e) => setSocialData({ ...socialData, location: e.target.value })}
                            placeholder="e.g. Mumbai, Maharashtra"
                            className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                        />
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4"
                >
                    Submit Fund Request
                </motion.button>
            </form>
        </motion.div>
    );

    const renderEmergencyForm = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="section-gradient-border bg-red-950/20 p-8 rounded-3xl border border-red-500/20 relative"
        >
            <button onClick={() => setView('intro')} className="text-xs text-textLight hover:text-white mb-6 flex items-center gap-1">
                ← Back to Selection
            </button>
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl"></span>
                <h3 className="text-2xl font-bold text-white">Emergency Fund Request</h3>
            </div>
            <form onSubmit={handleEmergencySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-textLight">Fund Raiser Name / Organization</label>
                    <input
                        type="text"
                        required
                        value={emergencyData.raiserName}
                        onChange={(e) => setEmergencyData({ ...emergencyData, raiserName: e.target.value })}
                        placeholder="e.g. Red Cross Volunteer Group"
                        className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-textLight">Gmail Account</label>
                    <input
                        type="email"
                        required
                        value={emergencyData.email}
                        onChange={(e) => setEmergencyData({ ...emergencyData, email: e.target.value })}
                        placeholder="e.g. contact@volunteer.org"
                        className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-textLight">Contact Number</label>
                    <input
                        type="tel"
                        required
                        value={emergencyData.number}
                        onChange={(e) => setEmergencyData({ ...emergencyData, number: e.target.value })}
                        placeholder="e.g. +91 9876543210"
                        className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-textLight">What Crisis?</label>
                    <input
                        type="text"
                        required
                        value={emergencyData.crisisType}
                        onChange={(e) => setEmergencyData({ ...emergencyData, crisisType: e.target.value })}
                        placeholder="e.g. Major Landslide in Hills"
                        className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-textLight">Picture Proof of Crisis (3 Images)</label>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-video bg-background/50 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-[10px] text-textLight/40 hover:border-red-500/40 cursor-pointer transition-all">
                                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Upload Image {i}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-textLight">Affected People</label>
                    <input
                        type="number"
                        required
                        value={emergencyData.affectedPeople || ''}
                        onChange={(e) => setEmergencyData({ ...emergencyData, affectedPeople: Number(e.target.value) })}
                        placeholder="Approx. count"
                        className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-textLight">Required Fund (₹)</label>
                    <input
                        type="number"
                        required
                        value={emergencyData.amountNeeded || ''}
                        onChange={(e) => setEmergencyData({ ...emergencyData, amountNeeded: Number(e.target.value) })}
                        placeholder="Amount in Rupees"
                        className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                    />
                </div>

                <div className="md:col-span-2 mt-4">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-900/30 transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
                    >
                        Ask Volunteers
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );

    return (
        <div className="max-w-4xl mx-auto py-10 relative">
            {loading && (
                <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                    <h3 className="text-2xl font-bold text-white">Security Verification</h3>
                    <p className="text-textLight opacity-60">Deploying fund-raiser to the grid...</p>
                </div>
            )}

            <button
                onClick={onBack}
                className="text-primary mb-6 flex items-center gap-2 hover:underline text-sm transition-colors"
            >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs">←</span>
                Back to Dashboard
            </button>

            <AnimatePresence mode="wait">
                {view === 'intro' && renderIntro()}
                {view === 'social' && renderSocialForm()}
                {view === 'emergency' && renderEmergencyForm()}
            </AnimatePresence>
        </div>
    );
};

export default FundRaise;
