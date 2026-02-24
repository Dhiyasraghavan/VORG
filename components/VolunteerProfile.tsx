import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';

interface VolunteerProfileProps {
    user: UserProfile;
    stars: number;
    onBack: () => void;
}

const VolunteerProfile: React.FC<VolunteerProfileProps> = ({ user, stars, onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
        >
            <button
                onClick={onBack}
                className="text-primary mb-8 flex items-center gap-2 hover:underline text-sm transition-colors"
            >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs">←</span>
                Back to Hub
            </button>

            <div className="section-gradient-border bg-secondary/80 rounded-[3rem] border border-white/10 overflow-hidden relative">
                {/* Profile Header */}
                <div className="h-48 bg-gradient-to-r from-primary/20 via-indigo-500/10 to-transparent relative">
                    <div className="absolute inset-0 bg-grid opacity-20" />
                </div>

                <div className="px-10 pb-10 -mt-20 relative z-10">
                    <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
                        <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-background shadow-2xl relative group">
                            <img src={user.profileImages[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Avatar" />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-4 mb-2">
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{user.fullName}</h2>
                                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black tracking-widest uppercase rounded-lg">Verified Account</span>
                            </div>
                            <p className="text-textLight/40 font-bold uppercase tracking-[0.3em] text-[10px]">{user.location} // Joined {user.joinedDate}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Stats Column */}
                        <div className="md:col-span-1 space-y-8">
                            <div className="p-8 bg-background/40 border border-white/5 rounded-[2rem]">
                                <h4 className="text-[10px] font-black text-textLight/40 uppercase tracking-widest mb-6">Core Rating</h4>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-4xl font-black text-white italic">LVL.{stars}</span>
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-4/5" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Impact Factor: HIGH</p>
                            </div>

                            <div className="p-8 bg-background/40 border border-white/5 rounded-[2rem]">
                                <h4 className="text-[10px] font-black text-textLight/40 uppercase tracking-widest mb-6">Tier Progression</h4>
                                <div className="space-y-4">
                                    {['Initiate', 'Activist', 'Impact Leader'].map((r, i) => (
                                        <div key={r} className={`flex items-center justify-between p-3 rounded-xl border ${user.rank === r ? 'bg-primary/20 border-primary/40 text-white' : 'border-white/5 text-textLight/20'}`}>
                                            <span className="text-xs font-black uppercase tracking-tight">{r}</span>
                                            {user.rank === r && <span className="text-xs">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Badges Column */}
                        <div className="md:col-span-2">
                            <div className="p-8 bg-background/40 border border-white/5 rounded-[2.5rem] h-full">
                                <h4 className="text-xs font-black text-textLight/40 uppercase tracking-[0.3em] mb-10 text-center">Neural Badges Earned</h4>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    {user.badges.map((badge, i) => (
                                        <motion.div
                                            key={badge.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex flex-col items-center text-center p-6 bg-secondary/80 border border-white/5 rounded-[2rem] hover:border-primary/40 transition-all group"
                                        >
                                            <div className="w-16 h-16 bg-background/60 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                                {badge.icon}
                                            </div>
                                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{badge.name}</h5>
                                            <p className="text-[8px] text-textLight/40 font-bold uppercase leading-tight">{badge.description}</p>
                                        </motion.div>
                                    ))}

                                    {/* Empty Slots */}
                                    {[...Array(6 - user.badges.length)].map((_, i) => (
                                        <div key={i} className="flex flex-col items-center justify-center p-6 border border-dashed border-white/5 rounded-[2rem] opacity-20">
                                            <div className="w-12 h-12 rounded-full border border-white/20 border-dashed" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] text-textLight/10 font-black uppercase tracking-[0.8em] mt-12 mb-10">
                V-ORG REPUTATION LEDGER // BLOCK_PROFILE_ENCRYPTED
            </p>
        </motion.div>
    );
};

export default VolunteerProfile;
