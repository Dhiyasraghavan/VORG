import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExperienceData } from '../types';
import { analyzeVolunteerExperience } from '../services/geminiService';

interface ExperienceVerificationProps {
    profileImages: string[];
    onSubmit: (data: ExperienceData) => void;
    onSkip: () => void;
}

const ExperienceVerification: React.FC<ExperienceVerificationProps> = ({ profileImages, onSubmit, onSkip }) => {
    const [essay, setEssay] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const score = await analyzeVolunteerExperience(essay);
            onSubmit({
                essay,
                links: [],
                experienceImages: [],
                score
            });
        } catch (error) {
            console.error("AI Analysis Error:", error);
            onSubmit({
                essay,
                links: [],
                experienceImages: [],
                score: Math.min(Math.floor(essay.length / 5), 100)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Credibility Check</h2>
                    <p className="text-textLight/40 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Previous Experience Protocol</p>
                </div>
                <button onClick={onSkip} className="text-textLight/30 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                    Decline / Skip Layer
                </button>
            </div>

            <div className="section-gradient-border bg-secondary/80 p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary/5 blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex-1 space-y-8 relative z-10">
                        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                            Document your previous volunteer missions.
                        </h3>

                        <p className="text-textLight/60 text-sm leading-relaxed">
                            Our AI analyst will review your narrative and media to verify your commitment levels and skill depth. This data directly influences your Network Rank.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em] mb-3 ml-1">Mission Narrative (Min 50 words)</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={essay}
                                    onChange={e => setEssay(e.target.value)}
                                    className="w-full bg-background/60 border border-white/5 rounded-3xl py-6 px-8 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background/80 transition-all font-medium resize-none placeholder:text-white/5 text-sm selection:bg-primary/30"
                                    placeholder="Describe your role, actions, and the impact created in your previous volunteer work..."
                                />
                                <div className="flex justify-between mt-2 px-2">
                                    <span className="text-[9px] text-textLight/20 uppercase tracking-widest font-black">AI Audit Ready</span>
                                    <span className={`text-[9px] uppercase tracking-widest font-black ${essay.length >= 250 ? 'text-green-500' : 'text-textLight/20'}`}>
                                        Character Count: {essay.length}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black font-black py-5 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all relative overflow-hidden group uppercase tracking-widest text-sm"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span>ANALYZING DATA...</span>
                                    </div>
                                ) : (
                                    <span>Submit for AI Audit</span>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="w-full md:w-64 space-y-6 relative z-10">
                        <div className="bg-background/40 border border-white/5 rounded-[2rem] p-6">
                            <h4 className="text-[10px] font-bold text-textLight/40 uppercase tracking-widest mb-4 text-center">Identity Anchor</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {profileImages.slice(0, 3).map((img, i) => (
                                    <div key={i} className="aspect-video bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                        <img src={img} className="w-full h-full object-cover opacity-60" alt={`Anchor ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 text-center">
                            <div className="text-primary text-2xl font-black mb-1">Rank Up ⚡</div>
                            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Unlock 'Activist' Tier</p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] text-textLight/10 font-black uppercase tracking-[0.4em] mt-12">
                V-ORG CREDIBILITY AUDIT // ENGINE_v4.0.2
            </p>
        </motion.div>
    );
};

export default ExperienceVerification;
