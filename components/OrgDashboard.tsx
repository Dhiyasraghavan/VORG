import React, { useState, useEffect } from 'react';
import { Organization, AppView, UserProfile } from '../types';
import { motion } from 'framer-motion';
import { getOrgEvents, getEventApplications, acceptVolunteer, getAllVolunteers, deleteVolunteer } from '../services/firebaseService';
import { calculateDistance } from '../utils/geoUtils';
import { auth } from '../services/firebase';

const EventApplicationsPanel: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = getEventApplications(eventId, (data) => setApps(data));
    return () => unsubscribe();
  }, [eventId]);

  const handleAccept = async (appId: string) => {
    try {
      await acceptVolunteer(appId, eventId);
    } catch (error) {
      console.error(error);
    }
  };

  if (apps.length === 0) return <p className="text-textLight/20 text-[10px] uppercase font-bold italic">No pending applications</p>;

  return (
    <div className="space-y-2">
      {apps.map(app => (
        <div key={app.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between group/app">
          <div>
            <p className="text-white text-xs font-bold">{app.role}</p>
            <p className="text-textLight/40 text-[9px] uppercase tracking-tighter">{app.volunteerId.slice(-8)}</p>
          </div>
          <button
            onClick={() => handleAccept(app.id)}
            className="bg-primary/20 text-primary text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
};

const VolunteersListModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  volunteers: (UserProfile & { id: string })[];
  events: any[];
  onRemove: (id: string) => void;
  title?: string;
  subtitle?: string;
}> = ({ isOpen, onClose, volunteers, events, onRemove, title = "Personnel Registry", subtitle = "Verified Personnel Database" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

                for (const event of events) {
                  if (event.acceptedVolunteers?.includes(vol.id) && event.liveLocations?.[vol.id]) {
                    const loc = event.liveLocations[vol.id];
                    const missionRadius = (event.radiusKm || 5) * 1000;
                    const dist = calculateDistance(
                      { latitude: loc.latitude, longitude: loc.longitude },
                      { latitude: event.liveLocation.lat, longitude: event.liveLocation.lng }
                    );

                    missionTag = event.id.slice(-6);
                    status = (dist <= (missionRadius + 100)) ? 'INSIDE' : 'OUTSIDE';
                    break; // Use the first active mission found for status
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
                            {status} MISSION {missionTag}
                          </span>
                        )}
                      </div>
                      <p className="text-textLight/40 text-[9px] uppercase tracking-tighter mb-1">{vol.location} • {vol.badges?.length || 0} Badges</p>
                      <p className="text-primary text-[10px] font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {vol.phoneNumber || vol.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex -space-x-2">
                        {vol.badges?.slice(0, 3).map(badge => (
                          <div key={badge.id} className="w-6 h-6 bg-background rounded-full border border-white/10 flex items-center justify-center text-[10px]" title={badge.name}>
                            {badge.icon}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => onRemove(vol.id)}
                        className="text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-tighter transition-colors"
                      >
                        Terminate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-white/5 bg-background/40 text-center">
          <p className="text-textLight/10 text-[8px] font-black uppercase tracking-[0.5em]">End of Personnel Data // V-ORG Secure Link</p>
        </div>
      </motion.div>
    </div>
  );
};

interface OrgDashboardProps {
  org: Organization | null;
  onNavigate: (view: AppView) => void;
}

export const OrgDashboard: React.FC<OrgDashboardProps> = ({ org, onNavigate }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<(UserProfile & { id: string })[]>([]);
  const [isVolModalOpen, setIsVolModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribeEvents = getOrgEvents(auth.currentUser.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });

    const unsubscribeVolunteers = getAllVolunteers((data) => {
      setVolunteers(data);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeVolunteers();
    };
  }, []);

  const handleRemoveVolunteer = async (id: string) => {
    if (window.confirm("Are you sure you want to terminate this volunteer's registry?")) {
      try {
        await deleteVolunteer(id);
      } catch (error) {
        console.error("Failed to remove volunteer:", error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10">
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-textLight/60 mb-1">Control Center</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Welcome, <span className="text-primary">{org?.name}</span>
            </h2>
          </div>
          <button
            onClick={() => onNavigate(AppView.HOST_EVENT)}
            className="bg-primary text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Host an Event
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => onNavigate(AppView.EMERGENCY_CRISIS)}
            className="section-gradient-border bg-red-500/5 hover:bg-red-500/10 p-8 rounded-[2.5rem] border border-red-500/20 group cursor-pointer transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🚨</div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/30 px-3 py-1 rounded-full animate-pulse">Critical Priority</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Emergency Crisis</h3>
            <p className="text-textLight/60 text-sm leading-relaxed mb-6">Dispatch immediate alerts for disaster relief or urgent community needs.</p>
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
              <span>Launch Emergency Protocol</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate(AppView.FUND_RAISE)}
            className="section-gradient-border bg-emerald-500/5 hover:bg-emerald-500/10 p-8 rounded-[2.5rem] border border-emerald-500/20 group cursor-pointer transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💰</div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/30 px-3 py-1 rounded-full">Financial Hub</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Fund Raise</h3>
            <p className="text-textLight/60 text-sm leading-relaxed mb-6">Orchestrate social funding or emergency relief collections.</p>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
              <span>Open Fund Channel</span>
              <span>→</span>
            </div>
          </div>
        </div>

        <div className="mt-6 section-gradient-border bg-secondary/70 p-6 rounded-3xl border border-white/10 text-textLight relative overflow-hidden">
          <div className="absolute -right-10 -top-16 w-52 h-52 bg-primary/20 blur-3xl" />
          <p className="mb-4 text-base md:text-lg">
            This is your live command surface for every volunteer‑driven initiative. Launch
            new projects, coordinate urgent deployments, and keep a pulse on your impact.
          </p>
          <div className="space-y-2 text-xs md:text-sm opacity-85">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Operating Guidelines
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Define precise event details so vorg can match the right volunteers.</li>
              <li>Use AI‑suggested staffing as a baseline, then tune for your context.</li>
              <li>Keep sessions updated so returning volunteers see a living history.</li>
              <li>Review recruitment plans before launch to prevent over‑ or under‑staffing.</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest text-[12px]">Tactical Operations (Active Events)</h3>
            <button
              onClick={() => setIsVolModalOpen(true)}
              className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              View Personnel Registry
            </button>
          </div>
          <span className="hidden md:inline-block px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full border border-primary/30 animate-pulse">LIVE SATELLITE LINK ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="h-64 bg-secondary/30 rounded-3xl animate-pulse flex items-center justify-center">
              <span className="text-textLight/40 uppercase tracking-[0.3em] text-xs">Decrypting Event Data...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="h-64 bg-secondary/30 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center p-8">
              <p className="text-textLight/40 text-sm mb-4">No active initiatives found in your sector.</p>
              <button onClick={() => onNavigate(AppView.HOST_EVENT)} className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Host First Mission</button>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="bg-secondary/60 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Mission: {event.id.slice(-6)}</span>
                    <h4 className="text-2xl font-bold text-white mb-2">{event.eventName}</h4>
                    <p className="text-textLight/60 text-sm mb-6 max-w-xl">{event.theme}</p>

                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
                      <div className="bg-background/80 px-4 py-2 rounded-xl border border-white/5">
                        <span className="text-textLight/40 mr-2">Personnel:</span>
                        <span className="text-primary">{event.acceptedVolunteers?.length || 0} / {event.attendeesCount / 10}</span>
                      </div>
                      <div className="bg-background/80 px-4 py-2 rounded-xl border border-white/5">
                        <span className="text-textLight/40 mr-2">Loc:</span>
                        <span className="text-white">{event.eventPlace}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-72 bg-background/40 p-6 rounded-2xl border border-white/5">
                    <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Live Deployment Desk</h5>
                    <div className="space-y-3">
                      <EventApplicationsPanel eventId={event.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <VolunteersListModal
        isOpen={isVolModalOpen}
        onClose={() => setIsVolModalOpen(false)}
        volunteers={volunteers}
        events={events}
        onRemove={handleRemoveVolunteer}
      />
    </div>
  );
};

export default OrgDashboard;
