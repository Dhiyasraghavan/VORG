
import React, { useState } from 'react';
import { EventDetails, VolunteerDepartment, AppView } from '../types';
import { SKILL_OPTIONS } from '../constants';
import { getVolunteerSuggestions } from '../services/geminiService';
import { hostNewEvent } from '../services/firebaseService';
import { auth } from '../services/firebase';
import { compressImage } from '../services/imageService';
import { motion } from 'framer-motion';

interface HostEventProps {
  onRecruit: (details: EventDetails, suggestions: VolunteerDepartment[]) => void;
  onNavigate: (view: AppView) => void;
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const HostEvent: React.FC<HostEventProps> = ({ onRecruit, onBack, onNavigate, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventDetails>({
    eventName: '',
    eventPlace: '',
    eventTime: '',
    attendeesCount: 0,
    area: '',
    theme: '',
    requiredSkills: [],
    images: [],
    liveLocation: null,
    radiusKm: 5
  });
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isLocationFixed, setIsLocationFixed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendeesCount' || name === 'radiusKm' ? parseInt(value) || 0 : value
    }));
  };

  const handleGetLocation = () => {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          liveLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }));
        setLocationStatus('success');
      },
      () => setLocationStatus('error')
    );
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const exists = prev.requiredSkills.includes(skill);
      if (exists) {
        return { ...prev, requiredSkills: prev.requiredSkills.filter(s => s !== skill) };
      } else {
        return { ...prev, requiredSkills: [...prev.requiredSkills, skill] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLocationFixed) {
      showToast("Location must be fixed for neural deployment.", "error");
      return;
    }

    if (!auth.currentUser) {
      showToast("Neural link lost. Please log in again.", "error");
      return;
    }

    setLoading(true);
    try {
      const suggestions = await getVolunteerSuggestions(formData);
      onRecruit(formData, suggestions);
      showToast("Neural analysis complete. Recruitment plan ready.", "success");
    } catch (error) {
      console.error("AI Analysis Failure:", error);
      showToast("AI Analysis Failed. Manual override required.", "error");
      // Fallback: simple defaults if AI fails
      onRecruit(formData, [
        { name: 'General Support', suggestedCount: Math.ceil(formData.attendeesCount / 50), finalCount: Math.ceil(formData.attendeesCount / 50), description: 'General event assistance.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 800, 600);
        setFormData(prev => ({
          ...prev,
          images: [compressed]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto py-10"
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
        Back to Dashboard
      </button>

      <div className="section-gradient-border bg-secondary/85 p-8 rounded-3xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.75)] relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-bold text-white mb-2">Analyzing Event with AI</h3>
            <p className="text-textLight">Calculating optimal volunteer distribution based on event size and theme...</p>
          </div>
        )}

        <div className="absolute -right-32 -top-24 w-72 h-72 bg-primary/20 blur-3xl" />
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Register New Event
        </h2>
        <p className="text-sm text-textLight opacity-80 mb-6">
          Describe the operational blueprint for this event. vorg will convert it into a
          recruitment and staffing plan.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-textLight">
              Event Name
            </label>
            <input
              type="text"
              name="eventName"
              required
              value={formData.eventName}
              onChange={handleChange}
              placeholder="e.g. Annual Community Health Fair"
              className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-3 text-textLight">
              Upload Event Banner / Image
            </label>
            <div
              onClick={() => document.getElementById('event-banner-input')?.click()}
              className="aspect-[21/9] bg-background/50 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-textLight/40 hover:border-primary/40 cursor-pointer transition-all group relative overflow-hidden"
            >
              {formData.images.length > 0 ? (
                <img
                  src={formData.images[0]}
                  alt="Banner Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />
              ) : null}

              <div className="relative z-10 flex flex-col items-center">
                <svg className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-medium text-white/80">
                  {formData.images.length > 0 ? 'Change Image' : 'Click to upload or drag image'}
                </span>
                <span className="text-[10px] uppercase tracking-widest mt-1 opacity-60 text-white/40">JPG, PNG up to 10MB</span>
              </div>

              <input
                id="event-banner-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Event Place
            </label>
            <input
              type="text"
              name="eventPlace"
              required
              value={formData.eventPlace}
              onChange={handleChange}
              placeholder="e.g. Central Park Pavilion"
              className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Event Date & Time
            </label>
            <div className="flex gap-4">
              <input
                type="date"
                required
                value={formData.eventTime ? formData.eventTime.split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value;
                  const time = formData.eventTime && formData.eventTime.includes('T')
                    ? formData.eventTime.split('T')[1]
                    : '09:00';
                  setFormData(prev => ({ ...prev, eventTime: `${date}T${time}` }));
                }}
                className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all [color-scheme:dark]"
              />
              <input
                type="time"
                required
                value={formData.eventTime && formData.eventTime.includes('T')
                  ? formData.eventTime.split('T')[1]
                  : ''}
                onChange={(e) => {
                  const time = e.target.value;
                  const date = formData.eventTime && formData.eventTime.includes('T')
                    ? formData.eventTime.split('T')[0]
                    : new Date().toISOString().split('T')[0];
                  setFormData(prev => ({ ...prev, eventTime: `${date}T${time}` }));
                }}
                className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-textLight">Share Location</label>
            <div className="bg-background/40 p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocationFixed}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${locationStatus === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    locationStatus === 'loading' ? 'bg-white/10 text-white/50 cursor-wait' :
                      'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105'
                    }`}
                >
                  {locationStatus === 'loading' ? 'Locating...' :
                    locationStatus === 'success' ? '✓ Live Location Latency OK' :
                      '📍 Use Live Location'}
                </button>

                {locationStatus === 'error' && !isLocationFixed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Lat, Lng"
                      className="bg-background/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white w-32"
                      onBlur={(e) => {
                        const [lat, lng] = e.target.value.split(',').map(s => parseFloat(s.trim()));
                        if (!isNaN(lat) && !isNaN(lng)) {
                          setFormData(prev => ({ ...prev, liveLocation: { lat, lng } }));
                          setLocationStatus('success');
                        }
                      }}
                    />
                    <span className="text-[10px] text-red-400 font-bold uppercase">Manual Override</span>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-background/60 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-textLight px-2">Radius:</span>
                  <select
                    name="radiusKm"
                    value={formData.radiusKm}
                    onChange={handleChange}
                    disabled={isLocationFixed}
                    className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                  >
                    {[1, 5, 10, 25, 50].map(r => (
                      <option key={r} value={r} className="bg-secondary text-white">{r} km</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLocationFixed(!isLocationFixed)}
                  disabled={locationStatus !== 'success'}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all border ${isLocationFixed
                    ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]'
                    : 'border-white/10 text-textLight hover:border-primary hover:text-primary disabled:opacity-30'
                    }`}
                >
                  {isLocationFixed ? 'Fixed ✓' : 'Fix Location'}
                </button>
              </div>

              {locationStatus === 'success' && formData.liveLocation && (
                <div className="text-[10px] uppercase tracking-widest text-textLight/40 flex gap-4">
                  <span>LAT: {formData.liveLocation.lat.toFixed(6)}</span>
                  <span>LNG: {formData.liveLocation.lng.toFixed(6)}</span>
                  <span>ACCURACY: {locationStatus === 'success' ? 'CRYSTAL CLEAR ⚡' : 'ESTIMATED'}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Approx. Attendees
            </label>
            <input
              type="number"
              name="attendeesCount"
              required
              value={formData.attendeesCount || ''}
              onChange={handleChange}
              placeholder="e.g. 500"
              className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-textLight">
              Event Area (Acres/Radius km)
            </label>
            <input
              type="text"
              name="area"
              required
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. 2.5 Acres"
              className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-textLight">
              Event Theme / Description
            </label>
            <textarea
              name="theme"
              required
              value={formData.theme}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe the theme and purpose of the event..."
              className="w-full bg-background/75 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/60 transition-all placeholder:text-textLight/40 resize-none"
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-3 text-textLight">
              Required Volunteer Departments
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SKILL_OPTIONS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all border card-hover-lift ${formData.requiredSkills.includes(skill)
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-background border-white/5 text-textLight hover:border-white/20'
                    }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 mt-6">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gradient-to-r from-primary via-indigo-500 to-primary hover:brightness-110 text-white font-semibold py-5 rounded-2xl transition-all shadow-xl text-lg flex items-center justify-center gap-3 tracking-wide uppercase"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Recruit Volunteers
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default HostEvent;
