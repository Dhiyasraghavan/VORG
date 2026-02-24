import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { QUIZ_TRANSLATIONS } from '../volunteerConstants';

interface BehavioralQuizProps {
    language: Language;
    onComplete: (score: number) => void;
}

const BehavioralQuiz: React.FC<BehavioralQuizProps> = ({ language, onComplete }) => {
    const questions = QUIZ_TRANSLATIONS[language];
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);

    const handleAnswer = (optionIdx: number) => {
        const isCorrect = optionIdx === questions[currentIdx].correct;
        const newScore = isCorrect ? score + (100 / questions.length) : score;

        if (currentIdx < questions.length - 1) {
            setScore(newScore);
            setCurrentIdx(currentIdx + 1);
        } else {
            onComplete(newScore);
        }
    };

    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
        >
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Skill Assessment</h2>
                    <p className="text-textLight/40 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Behavioral Integrity Protocol</p>
                </div>
                <div className="text-right">
                    <span className="text-primary font-black text-2xl tracking-tighter">{currentIdx + 1}</span>
                    <span className="text-textLight/20 font-bold mx-1">/</span>
                    <span className="text-textLight/40 font-bold">{questions.length}</span>
                </div>
            </div>

            <div className="h-1.5 bg-white/5 rounded-full mb-12 overflow-hidden border border-white/5 p-[2px]">
                <motion.div
                    className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="section-gradient-border bg-secondary/80 p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden"
                >
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-3xl" />

                    <h3 className="text-2xl font-bold text-white mb-8 leading-tight tracking-tight relative z-10">
                        {questions[currentIdx].text}
                    </h3>

                    <div className="grid grid-cols-1 gap-4 relative z-10">
                        {questions[currentIdx].options.map((option, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                className="w-full text-left p-5 bg-background/60 border border-white/5 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all group flex items-center gap-4"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-white/20 group-hover:bg-primary group-hover:text-white transition-all">
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <span className="text-textLight/90 font-medium group-hover:text-white transition-colors">{option}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <p className="text-center text-[10px] text-textLight/10 font-black uppercase tracking-[0.5em] mt-12">
                AUTOMATED MERIT ASSESSMENT // SYSTEM_V1.1
            </p>
        </motion.div>
    );
};

export default BehavioralQuiz;
