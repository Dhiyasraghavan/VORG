import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllActiveMissions, getGlobalFunds, getAllVolunteers, updateVolunteerLocation, broadcastSOS } from '../services/firebaseService';
import { UserProfile, VolunteerEvent, FirebaseEvent } from '../types';
import { calculateDistance, getCurrentPosition } from '../utils/geoUtils';
import { auth } from '../services/firebase';

declare const L: any;

const VolunteersListModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    volunteers: (UserProfile & { id: string })[];
    missions: FirebaseEvent[];
    title?: string;
    subtitle?: string;
}> = ({ isOpen, onClose, volunteers, missions, title = "Mission Personnel", subtitle = "Active Duty Personnel" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary/90 border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-background/40">
                    <div>
                        <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{title}</h3>
                        <p className="text-textLight/40 text-[10px] font-bold uppercase tracking-[0.2em]">{subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {volunteers.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-textLight/20 text-xs uppercase tracking-widest font-black italic">No personnel matches found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {volunteers.map(vol => {
                                // Find status context
                                let status: 'OFFLINE' | 'INSIDE' | 'OUTSIDE' = 'OFFLINE';
                                let missionTag = '';

                                for (const event of missions) {
                                    if (event.acceptedVolunteers?.includes(vol.id) && event.liveLocations?.[vol.id]) {
                                        const loc = event.liveLocations[vol.id];
                                        const missionRadius = (event.radiusKm || 5) * 1000;
                                        const dist = calculateDistance(
                                            { latitude: loc.latitude, longitude: loc.longitude },
                                            { latitude: event.liveLocation.lat, longitude: event.liveLocation.lng }
                                        );

                                        missionTag = event.id.slice(-6);
                                        status = (dist <= (missionRadius + 100)) ? 'INSIDE' : 'OUTSIDE';
                                        break;
                                    }
                                }

                                return (
                                    <div key={vol.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-4 group/vol hover:bg-white/10 transition-all">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 relative">
                                            <img src={vol.profileImages?.[0] || 'https://via.placeholder.com/150'} alt={vol.fullName} className="w-full h-full object-cover" />
                                            {status !== 'OFFLINE' && (
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-secondary ${status === 'INSIDE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-white text-sm font-bold">{vol.fullName}</p>
                                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded-md border border-primary/30">{vol.rank}</span>
                                                {status !== 'OFFLINE' && (
                                                    <span className={`px-2 py-0.5 text-[7px] font-black uppercase rounded-md border ${status === 'INSIDE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                        {status}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-textLight/40 text-[9px] uppercase tracking-tighter mb-1">{vol.location} • {vol.badges?.length || 0} Badges</p>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {vol.badges?.slice(0, 3).map(badge => (
                                                <div key={badge.id} className="w-6 h-6 bg-background rounded-full border border-white/10 flex items-center justify-center text-[10px]" title={badge.name}>
                                                    {badge.icon}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-white/5 bg-background/40 text-center">
                    <p className="text-textLight/10 text-[8px] font-black uppercase tracking-[0.5em]">Personnel Registry Viewer // V-ORG Secure Hub</p>
                </div>
            </motion.div>
        </div>
    );
};

interface VolunteerDashboardProps {
    user: UserProfile;
    stars: number;
    onApplyToEvent: (eventId: string, role: string) => void;
    onViewProfile: () => void;
}

const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ user, stars, onApplyToEvent, onViewProfile }) => {
    const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);
    const [activeMissions, setActiveMissions] = useState<FirebaseEvent[]>([]);
    const [allVolunteers, setAllVolunteers] = useState<(UserProfile & { id: string })[]>([]);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [targetMissionId, setTargetMissionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Live Tracking States
    const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [sosActive, setSosActive] = useState(false);
    const [isPunchingIn, setIsPunchingIn] = useState(false);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    const refreshLocation = async (missionId: string, currentMissions: FirebaseEvent[]) => {
        if (!auth.currentUser) return;
        try {
            const pos = await getCurrentPosition();
            const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            setCurrentLocation(loc);

            const mission = currentMissions.find(m => m.id === missionId);
            if (mission && mission.liveLocation) {
                const missionRadius = (mission.radiusKm || 5) * 1000;
                const d = calculateDistance(loc, { latitude: mission.liveLocation.lat, longitude: mission.liveLocation.lng });
                setDistance(d);
                await updateVolunteerLocation(auth.currentUser.uid, missionId, loc);
            }
        } catch (err) {
            console.error("Tracking Error:", err);
        }
    };

    useEffect(() => {
        const unsubscribeMissions = getAllActiveMissions((missions) => {
            setActiveMissions(missions);
            setLoading(false);
        });

        const unsubscribeVolunteers = getAllVolunteers((data) => {
            setAllVolunteers(data);
        });

        return () => {
            unsubscribeMissions();
            unsubscribeVolunteers();
        };
    }, []);

    useEffect(() => {
        let trackingInterval: any;
        if (activeTrackingId) {
            // Immediate refresh
            refreshLocation(activeTrackingId, activeMissions);

            // Set interval
            trackingInterval = setInterval(() => {
                refreshLocation(activeTrackingId, activeMissions);
            }, 10000);
        }

        return () => {
            if (trackingInterval) clearInterval(trackingInterval);
        };
    }, [activeTrackingId]);

    // Map Initialization Effect
    useEffect(() => {
        if (activeTrackingId && mapContainerRef.current && !mapRef.current && currentLocation) {
            const mission = activeMissions.find(m => m.id === activeTrackingId);
            if (!mission || !mission.liveLocation) return;

            mapRef.current = L.map(mapContainerRef.current, {
                zoomControl: false, attributionControl: false
            }).setView([currentLocation.latitude, currentLocation.longitude], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);

            const missionRadius = (mission.radiusKm || 5) * 1000;
            const buffer = 100; // 100m operational buffer
            const isWithin = distance !== null && distance <= (missionRadius + buffer);
            const zoneColor = isWithin ? '#829672' : '#ef4444';

            L.circle([mission.liveLocation.lat, mission.liveLocation.lng], {
                color: zoneColor, fillColor: zoneColor, fillOpacity: 0.15, weight: 4, radius: missionRadius
            }).addTo(mapRef.current);

            const officeIcon = L.divIcon({
                className: 'office-icon',
                html: `<div style="background-color: #050510; width: 32px; height: 32px; border: 4px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#829672" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"/><path d="M21 21V7H3v14"/></svg></div>`,
                iconSize: [32, 32], iconAnchor: [16, 16]
            });
            L.marker([mission.liveLocation.lat, mission.liveLocation.lng], { icon: officeIcon }).addTo(mapRef.current);

            const userIcon = L.divIcon({
                className: 'user-icon',
                html: `<div style="background-color: #829672; width: 18px; height: 18px; border: 3px solid #fff; border-radius: 50%;"></div>`,
                iconSize: [18, 18], iconAnchor: [9, 9]
            });
            L.marker([currentLocation.latitude, currentLocation.longitude], { icon: userIcon }).addTo(mapRef.current);

            const group = new L.featureGroup([
                L.marker([currentLocation.latitude, currentLocation.longitude]),
                L.marker([mission.liveLocation.lat, mission.liveLocation.lng])
            ]);
            mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        }

        return () => {
            if (!activeTrackingId && mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [activeTrackingId, currentLocation, activeMissions, distance]);

    const handleSOS = async () => {
        if (!activeTrackingId || !currentLocation || !auth.currentUser) return;
        setSosActive(true);
        try {
            await broadcastSOS(auth.currentUser.uid, activeTrackingId, currentLocation, user.fullName);
            alert("EMERGENCY BROADCAST SENT: Organize and HQ have been notified of your coordinates.");
        } catch (err) {
            console.error(err);
        } finally {
            setSosActive(false);
        }
    };

    const handleStartTracking = async (missionId: string) => {
        setIsPunchingIn(true);
        try {
            // This will trigger the useEffect immediately after setting the ID
            setActiveTrackingId(missionId);
        } catch (err) {
            alert("GPS Signal Required for Deployment Access.");
        } finally {
            setIsPunchingIn(false);
        }
    };

    const getSuitabilityColor = (score: number) => {
        if (score >= 40) return 'text-primary border-primary/40 bg-primary/5';
        if (score >= 20) return 'text-indigo-400 border-indigo-400/40 bg-indigo-400/5';
        return 'text-textLight/40 border-white/5 bg-white/2';
    };

    const teamVolunteers = targetMissionId
        ? allVolunteers.filter(v => activeMissions.find(m => m.id === targetMissionId)?.acceptedVolunteers?.includes(v.id))
        : [];

    const activeMission = activeMissions.find(m => m.id === activeTrackingId);

    return (
        <div className="space-y-10">
            {/* Header Stat Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <div className="section-gradient-border bg-secondary/80 p-6 rounded-3xl border border-white/10 flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                    <div>
                        <p className="text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em]">Current Rank</p>
                        <h4 className="text-xl font-black text-white tracking-tighter uppercase">{user.rank}</h4>
                    </div>
                </div>

                <div className="section-gradient-border bg-secondary/80 p-6 rounded-3xl border border-white/10 flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
                    <div>
                        <p className="text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em]">Impact Rating</p>
                        <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-4 h-1.5 rounded-full ${i < stars ? 'bg-primary' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="section-gradient-border bg-secondary/80 p-6 rounded-3xl border border-white/10 flex items-center gap-5 cursor-pointer hover:bg-primary/5 transition-all group" onClick={onViewProfile}>
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/40 transition-all">
                        <img src={user.profileImages[0]} className="w-full h-full object-cover" alt="Profile" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-textLight/40 uppercase tracking-[0.2em]">Profile Verified</p>
                        <h4 className="text-xl font-black text-white tracking-tighter uppercase">{user.fullName.split(' ')[0]}</h4>
                    </div>
                </div>
            </motion.div>

            {/* Live Tracking HUD Overlay */}
            <AnimatePresence>
                {activeTrackingId && activeMission && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="section-gradient-border bg-secondary p-8 rounded-[2.5rem] border border-primary/30 shadow-2xl space-y-8 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-2 block flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Mission Tracking Active
                                </span>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{activeMission.eventName}</h3>
                                <p className="text-textLight/40 text-xs font-bold uppercase tracking-widest">Auth: {activeMission.id.slice(-8)} // Base: {activeMission.eventPlace}</p>
                            </div>
                            <button
                                onClick={() => setActiveTrackingId(null)}
                                className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl text-textLight/60 transition-colors"
                            >
                                Exit HUD
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                            <div className="h-[400px] rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 relative">
                                <div ref={mapContainerRef} className="w-full h-full" />
                                {!currentLocation && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                                        <span className="text-primary font-black animate-pulse uppercase tracking-widest text-xs">Acquiring Satellite Lock...</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background/40 p-6 rounded-3xl border border-white/5">
                                        <p className="text-[10px] font-black text-textLight/20 uppercase tracking-widest mb-1">Target Radius</p>
                                        <h4 className="text-2xl font-black text-white">{(activeMission.radiusKm || 5)} km</h4>
                                    </div>
                                    <div className="bg-background/40 p-6 rounded-3xl border border-white/5">
                                        <p className="text-[10px] font-black text-textLight/20 uppercase tracking-widest mb-1">Geofence Status</p>
                                        <h4 className={`text-2xl font-black ${distance === null ? 'text-indigo-400' : distance <= ((activeMission.radiusKm || 5) * 1000 + 100) ? 'text-green-500' : 'text-red-500'}`}>
                                            {distance === null ? 'SCANNING...' : distance <= ((activeMission.radiusKm || 5) * 1000 + 100) ? 'INSIDE' : 'OUTSIDE'}
                                        </h4>
                                    </div>
                                    <div className="bg-background/40 p-6 rounded-3xl border border-white/5 col-span-2">
                                        <p className="text-[10px] font-black text-textLight/20 uppercase tracking-widest mb-1">Live Distance to Base</p>
                                        <h4 className="text-4xl font-black text-white">{distance !== null ? `${Math.round(distance)}m` : 'Scanning...'}</h4>
                                    </div>
                                </div>

                                <div className="bg-background/40 p-8 rounded-[2rem] border border-white/5 space-y-6">
                                    <h4 className="text-xs font-black text-textLight/40 uppercase tracking-[0.3em]">Operational Readiness</h4>
                                    <div className="space-y-3">
                                        {activeMission.requiredSkills.map((skill, i) => (
                                            <div key={i} className="flex items-center gap-4 text-white p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-[10px]">✓</div>
                                                <span className="text-sm font-bold uppercase tracking-tight">{skill} Verified</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSOS}
                                    disabled={sosActive}
                                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all ${sosActive ? 'bg-red-900 border-red-500 animate-pulse' : 'bg-red-500 hover:bg-red-600 text-white border-2 border-red-400/20'}`}
                                >
                                    {sosActive ? 'Broadcasting SOS Signal...' : 'More Options'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mission Hub */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Mission Hub</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-textLight/40 uppercase tracking-widest">Neural Filter: ACTIVE</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-64 bg-secondary/30 rounded-[2.5rem] animate-pulse border border-white/5" />
                        ))
                    ) : activeMissions.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-secondary/20 rounded-[3rem] border border-dashed border-white/5">
                            <p className="text-textLight/40 uppercase tracking-widest text-xs">No active missions detected in your network.</p>
                        </div>
                    ) : (
                        activeMissions.map((event, i) => {
                            const isAccepted = event.acceptedVolunteers?.includes(auth.currentUser?.uid || '');
                            const personnelCount = event.acceptedVolunteers?.length || 0;
                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="section-gradient-border bg-secondary/80 rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-primary/30 transition-all flex flex-col"
                                >
                                    <div className="aspect-video relative overflow-hidden">
                                        <img src={event.images?.[0] || 'https://picsum.photos/seed/vorg/800/600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.eventName} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                                        <div className={`absolute top-4 right-4 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${getSuitabilityColor(80)} flex items-center gap-2`}>
                                            Personnel: {personnelCount}
                                            {personnelCount > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTargetMissionId(event.id);
                                                        setIsTeamModalOpen(true);
                                                    }}
                                                    className="ml-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-all"
                                                >
                                                    View Team
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-xl font-black text-white mb-2 leading-tight tracking-tight uppercase">{event.eventName}</h3>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex items-center gap-1.5 text-textLight/60 text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-primary text-base">📅</span> {event.eventTime?.split('T')[0] || 'LIVE'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-textLight/60 text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-primary text-base">📍</span> {event.eventPlace?.split(',')[0]}
                                            </div>
                                        </div>

                                        <p className="text-textLight/60 text-sm leading-relaxed line-clamp-2 mb-8 flex-1">
                                            {event.theme}
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setSelectedEvent({
                                                    id: event.id,
                                                    title: event.eventName,
                                                    description: event.theme,
                                                    location: event.eventPlace,
                                                    date: event.eventTime,
                                                    image: event.images?.[0] || 'https://picsum.photos/seed/vorg/800/600',
                                                    prerequisites: event.requiredSkills || [],
                                                    checklist: ['Bring personal ID', 'Water bottle required'],
                                                    suitableScore: 85,
                                                    roles: (event.requiredSkills || []).map((s: string) => ({ name: s, description: `Support the ${s} department during deployment.` }))
                                                })}
                                                className="flex-[2] bg-background/60 border border-white/5 hover:border-primary/40 hover:bg-primary/5 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                                            >
                                                Mission Ops
                                            </button>
                                            {isAccepted && (
                                                <button
                                                    onClick={() => handleStartTracking(event.id)}
                                                    disabled={isPunchingIn}
                                                    className="flex-[3] bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    {isPunchingIn ? 'Scanning...' : 'Start Tracking'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Event Details Overlay */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvent(null)}
                            className="absolute inset-0 bg-background/95 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-secondary/90 w-full max-w-4xl rounded-[3rem] border border-white/10 overflow-hidden relative shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="h-64 relative">
                                <img src={selectedEvent.image} className="w-full h-full object-cover" alt={selectedEvent.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-8 right-8 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl hover:bg-primary transition-all"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="p-10 -mt-10 relative z-10">
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {selectedEvent.prerequisites.map((p, i) => (
                                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20">
                                            {p}
                                        </span>
                                    ))}
                                </div>

                                <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">{selectedEvent.title}</h3>
                                <p className="text-textLight/80 text-lg leading-relaxed mb-10">{selectedEvent.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div>
                                        <h4 className="text-xs font-black text-textLight/40 uppercase tracking-[0.3em] mb-6">Available Roles</h4>
                                        <div className="space-y-4">
                                            {selectedEvent.roles.map((role, i) => {
                                                const isApplied = user.appliedEvents.some(ae => ae.eventId === selectedEvent.id && ae.role === role.name);
                                                return (
                                                    <div key={i} className="p-6 bg-background/40 border border-white/5 rounded-[2rem] hover:border-primary/30 transition-all group">
                                                        <h5 className="font-bold text-white mb-2 uppercase tracking-tight">{role.name}</h5>
                                                        <p className="text-sm text-textLight/60 mb-6">{role.description}</p>
                                                        <button
                                                            onClick={() => {
                                                                onApplyToEvent(selectedEvent.id, role.name);
                                                                setSelectedEvent(null);
                                                            }}
                                                            disabled={isApplied}
                                                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isApplied ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02]'
                                                                }`}
                                                        >
                                                            {isApplied ? '✓ Applied Successfully' : 'Deploy for this Role'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div>
                                            <h4 className="text-xs font-black text-textLight/40 uppercase tracking-[0.3em] mb-6">Equip Check</h4>
                                            <div className="space-y-3">
                                                {selectedEvent.checklist.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-4 text-textLight/80 font-bold">
                                                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-[10px]">✓</div>
                                                        <span className="tracking-tight uppercase text-sm">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Location Intel</h4>
                                            <p className="text-white font-bold tracking-tight">{selectedEvent.location}</p>
                                            <div className="mt-4 h-32 bg-background/60 rounded-xl overflow-hidden grayscale contrast-125 opacity-40">
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-textLight uppercase tracking-widest font-black">Satellite Data Preview</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <VolunteersListModal
                isOpen={isTeamModalOpen}
                onClose={() => {
                    setIsTeamModalOpen(false);
                    setTargetMissionId(null);
                }}
                volunteers={teamVolunteers}
                missions={activeMissions}
                title="Mission Personnel"
                subtitle={targetMissionId ? `Active Duty for Mission: ${targetMissionId.slice(-6)}` : "Verified Personnel Database"}
            />

            <p className="text-center text-[10px] text-textLight/10 font-black uppercase tracking-[0.6em] mt-12 py-10">
                V-ORG MISSION OPERATING SYSTEM // V_HUD_7.4
            </p>
        </div>
    );
};

export default VolunteerDashboard;
