
import React, { useState } from 'react';
import { EmergencyDetails } from '../types';
import { motion } from 'framer-motion';

interface EmergencyCrisisProps {
    onCallVolunteers: (details: EmergencyDetails) => void;
    onBack: () => void;
}

const EmergencyCrisis: React.FC<EmergencyCrisisProps> = ({ onCallVolunteers, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<EmergencyDetails>({
        type: '',
        volunteersNeeded: 0,
        peopleAffected: 0,
        location: null,
        description: ''
    });
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({
            ...prev,
            [name]: (name === 'volunteersNeeded' || name === 'peopleAffected') ? Number(value) : value
        }));
    };

    const handleGetLocation = () => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            setLocationStatus('error');
            setDetails(prev => ({ ...prev, location: { lat: 0, lng: 0, error: 'Geolocation not supported' } }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setDetails(prev => ({
                    ...prev,
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                }));
                setLocationStatus('success');
            },
            () => {
                setLocationStatus('error');
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (details.volunteersNeeded <= 0 || details.peopleAffected <= 0) {
            alert("Please enter valid numbers for volunteers and people affected.");
            return;
        }
        if (!details.location) {
            if (!confirm("No location detected. Proceed without live location?")) {
                return;
            }
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            onCallVolunteers(details);
            setLoading(false);
        }, 1500);
    };

    return (
        <motion.div
            className="max-w-3xl mx-auto py-10"
            initial={{ opacity: 0, y: 24 }}
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
                Back to Dashboard
            </button>

            <div className="section-gradient-border bg-red-950/30 p-8 rounded-3xl border border-red-500/20 shadow-[0_24px_80px_rgba(200,0,0,0.15)] relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h3 className="text-2xl font-bold text-white mb-2">Broadcasting Emergency Alert</h3>
                        <p className="text-textLight">Notifying nearest response teams...</p>
                    </div>
                )}

                <div className="absolute -right-32 -top-24 w-72 h-72 bg-red-600/10 blur-3xl opacity-50" />

                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Emergency Crisis
                    </h2>
                </div>
                <p className="text-sm text-textLight opacity-80 mb-8 ml-16">
                    Rapidly mobilize volunteers for urgent situations. Live location will be shared with the response team.
                </p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-textLight">Type of Emergency</label>
                        <input
                            type="text"
                            name="type"
                            required
                            value={details.type}
                            onChange={handleChange}
                            placeholder="e.g. Flash Flood, Building Collapse, Fire"
                            className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-textLight/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-textLight">Approx. People Affected</label>
                        <input
                            type="number"
                            name="peopleAffected"
                            required
                            min="1"
                            value={details.peopleAffected || ''}
                            onChange={handleChange}
                            className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-textLight/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-textLight">Volunteers Needed</label>
                        <input
                            type="number"
                            name="volunteersNeeded"
                            required
                            min="1"
                            value={details.volunteersNeeded || ''}
                            onChange={handleChange}
                            className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-textLight/40"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-textLight">Location</label>
                        <div className="flex items-center gap-4 bg-background/40 p-4 rounded-xl border border-white/5">
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                disabled={locationStatus === 'loading' || locationStatus === 'success'}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${locationStatus === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        locationStatus === 'loading' ? 'bg-white/10 text-white/50 cursor-wait' :
                                            'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    }`}
                            >
                                {locationStatus === 'loading' ? 'Detecting...' :
                                    locationStatus === 'success' ? 'Location Detected' :
                                        'Get Live Location'}
                            </button>
                            <div className="text-sm text-textLight">
                                {locationStatus === 'success' && (
                                    <span>Lat: {details.location?.lat.toFixed(4)}, Lng: {details.location?.lng.toFixed(4)}</span>
                                )}
                                {locationStatus === 'error' && (
                                    <span className="text-red-400">Failed to get location. Please allow permissions.</span>
                                )}
                                {locationStatus === 'idle' && (
                                    <span className="opacity-50">Press button to capture coordinates</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-textLight">Description of the Problem</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={details.description}
                            onChange={handleChange}
                            placeholder="Describe the situation, specific needs, and immediate dangers..."
                            className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-textLight/40 resize-none"
                        ></textarea>
                    </div>

                    <div className="md:col-span-2 mt-4">
                        <motion.button
                            type="submit"
                            whileTap={{ scale: 0.97 }}
                            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-red-900/40 text-lg flex items-center justify-center gap-3 tracking-wide uppercase"
                        >
                            <span className="animate-pulse">⚠</span>
                            Call for Volunteers
                            <span className="animate-pulse">⚠</span>
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default EmergencyCrisis;
