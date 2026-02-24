
import React, { useState } from 'react';
import { EventDetails, VolunteerDepartment } from '../types';
import { hostNewEvent } from '../services/firebaseService';
import { auth } from '../services/firebase';
import { motion } from 'framer-motion';

interface RecruitmentSummaryProps {
  event: EventDetails;
  suggestions: VolunteerDepartment[];
  onConfirm: () => void;
  onBack: () => void;
}

const RecruitmentSummary: React.FC<RecruitmentSummaryProps> = ({ event, suggestions, onConfirm, onBack }) => {
  const [editableSuggestions, setEditableSuggestions] = useState<VolunteerDepartment[]>(suggestions);
  const [saving, setSaving] = useState(false);

  const handleCountChange = (index: number, newCount: number) => {
    const updated = [...editableSuggestions];
    updated[index].finalCount = Math.max(0, newCount);
    setEditableSuggestions(updated);
  };

  const removeDepartment = (index: number) => {
    if (confirm("Are you sure you want to remove this department from the recruitment plan?")) {
      const updated = editableSuggestions.filter((_, i) => i !== index);
      setEditableSuggestions(updated);
    }
  };

  const totalVolunteers = editableSuggestions.reduce((acc, curr) => acc + curr.finalCount, 0);

  const handleSave = async () => {
    if (editableSuggestions.length === 0) {
      alert("Please have at least one department in your recruitment plan.");
      return;
    }
    if (!auth.currentUser) {
      alert("Neural sync lost. Re-login required.");
      return;
    }

    setSaving(true);
    try {
      await hostNewEvent(auth.currentUser.uid, {
        ...event,
        recruitment: editableSuggestions
      } as any);
      onConfirm();
    } catch (error: any) {
      console.error("Event Launch Failure:", error);
      alert(`Launch Canceled: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="text-textLight/40 mb-4 uppercase tracking-widest text-xs">Uplink Lost / Cache Purged</p>
        <button onClick={onBack} className="text-primary font-bold hover:underline">Re-initialize Mission Profile &rarr;</button>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto py-10 px-4"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <button
        onClick={onBack}
        className="text-primary mb-6 flex items-center gap-2 hover:underline hover:text-indigo-300 transition-colors text-sm"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs">
          ←
        </span>
        Refine Event Details
      </button>

      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Recruitment Plan
        </h2>
        <p className="text-textLight opacity-80 text-sm md:text-base">
          Gemini AI has analyzed your event <strong>"{event.eventName}"</strong> and suggested
          the following distribution for <strong>{event.attendeesCount}</strong> attendees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {editableSuggestions.length > 0 ? (
            editableSuggestions.map((dept, idx) => (
              <motion.div
                key={`${dept.name}-${idx}`}
                className="bg-secondary/80 p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-hover-lift relative overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/15 blur-2xl" />
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-bold text-white">{dept.name}</h4>
                  </div>
                  <p className="text-sm text-textLight opacity-70 leading-tight mb-2">
                    {dept.description}
                  </p>
                  <div className="text-xs text-primary font-medium flex items-center gap-2">
                    <span className="bg-primary/10 px-2 py-0.5 rounded">
                      AI Suggested: {dept.suggestedCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  <div className="flex items-center gap-3 bg-background/80 px-3 py-1.5 rounded-xl border border-white/5">
                    <button
                      onClick={() => handleCountChange(idx, dept.finalCount - 1)}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-white/10 flex items-center justify-center text-xl text-white transition-colors"
                      title="Decrease"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={dept.finalCount}
                      onChange={(e) => handleCountChange(idx, parseInt(e.target.value) || 0)}
                      className="w-16 bg-transparent text-center text-xl font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => handleCountChange(idx, dept.finalCount + 1)}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-white/10 flex items-center justify-center text-xl text-white transition-colors"
                      title="Increase"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeDepartment(idx)}
                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Remove Department"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-secondary/30 border-2 border-dashed border-white/5 p-12 rounded-3xl text-center">
              <p className="text-textLight opacity-50 italic">No departments selected. Go back to add skills.</p>
              <button onClick={onBack} className="mt-4 text-primary font-bold hover:underline">Add Departments &rarr;</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary/85 p-8 rounded-3xl border border-white/10 sticky top-24 shadow-2xl section-gradient-border">
            <h3 className="text-2xl font-bold text-white mb-6">Final Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-textLight">
                <span>Active Departments</span>
                <span className="font-bold text-white">{editableSuggestions.length}</span>
              </div>
              <div className="flex justify-between text-textLight">
                <span>Total Volunteers</span>
                <span className="font-bold text-white text-3xl">{totalVolunteers}</span>
              </div>
              <div className="flex justify-between text-textLight border-t border-white/5 pt-4">
                <span>Efficiency Ratio</span>
                <span className="text-primary font-bold">1:{totalVolunteers > 0 ? Math.round(event.attendeesCount / totalVolunteers) : 0} (Att:Vol)</span>
              </div>
            </div>

            <motion.button
              onClick={handleSave}
              disabled={saving || editableSuggestions.length === 0}
              whileTap={!saving && editableSuggestions.length > 0 ? { scale: 0.97 } : {}}
              className={`w-full ${saving || editableSuggestions.length === 0
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-primary via-indigo-500 to-primary hover:brightness-110'
                } text-white font-semibold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 text-sm tracking-wide uppercase`}
            >
              {saving ? 'Processing...' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Confirm & Launch
                </>
              )}
            </motion.button>
            <p className="mt-4 text-[10px] text-textLight opacity-40 text-center uppercase tracking-widest leading-relaxed">
              Recruitment notifications will be sent to matched volunteers upon confirmation.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecruitmentSummary;
