import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface LanguageSelectProps {
    onSelect: (lang: Language) => void;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ onSelect }) => {
    const languages: { id: Language; label: string; sub: string; icon: string }[] = [
        { id: 'english', label: 'English', sub: 'Global Protocol', icon: '🌐' },
        { id: 'hindi', label: 'Hindi', sub: 'National Outreach', icon: '🇮🇳' },
        { id: 'tamil', label: 'Tamil', sub: 'Regional Impact', icon: '🐅' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
        >
            <div className="mb-10">
                <h2 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">Neural Interface</h2>
                <p className="text-textLight/60 font-bold tracking-widest uppercase text-xs">Select Primary Communication Channel</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {languages.map((lang, i) => (
                    <motion.button
                        key={lang.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => onSelect(lang.id)}
                        className="group flex items-center gap-6 p-6 bg-secondary/80 border border-white/5 rounded-3xl hover:border-primary/40 hover:bg-primary/5 transition-all relative overflow-hidden text-left"
                    >
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />

                        <div className="w-16 h-16 bg-background/60 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                            {lang.icon}
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">{lang.label}</h3>
                            <p className="text-sm text-textLight/40 font-bold uppercase tracking-widest">{lang.sub}</p>
                        </div>

                        <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                            <span className="text-xs text-white/20 group-hover:text-white transition-colors">→</span>
                        </div>
                    </motion.button>
                ))}
            </div>

            <p className="text-[10px] text-textLight/20 font-black uppercase tracking-[0.3em] mt-12">
                V-ORG COGNITIVE LINGUISTICS v1.0
            </p>
        </motion.div>
    );
};

export default LanguageSelect;
