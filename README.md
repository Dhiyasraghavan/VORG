# 🌐 V-Org — Volunteer Orchestration Grid

> *A next-generation operations platform for social organizations and passionate volunteers.*

---

## 🚨 The Problem

Volunteering is one of the most powerful forces for social good — yet the infrastructure behind it is broken.

**By the numbers:**
- 🌍 Over **1 billion people** globally engage in some form of volunteering each year *(UN Volunteers Report, 2022)*
- 🇮🇳 India alone has **~500 million** people who participate in informal community service
- 📉 **70% of NGOs** report difficulty in recruiting and managing volunteers consistently *(Nonprofit Hub Survey)*
- ⏱️ Volunteer coordinators spend an average of **30+ hours per event** on manual logistics — emails, spreadsheets, phone calls
- 🚑 During emergencies like floods and earthquakes, volunteer response time is delayed by **2–6 hours** due to lack of a centralized rapid-response system
- 💸 Poor fund visibility causes **₹1000s of crores** in community donations to go underutilized or misallocated every year in India

The core issue: **there is no single, intelligent platform** that connects organizations, volunteers, and crisis-response in real time.

---

## 💡 Our Solution — V-Org

**V-Org (Volunteer Orchestration Grid)** is a full-stack web application that acts as a command center for two types of users:

### 🏢 For Organizations
- Create and manage volunteer-driven **events and missions**
- Get **AI-generated staffing recommendations** — instantly know how many volunteers you need per department for any event
- View and **accept/reject volunteer applications** in real time
- Trigger **emergency crisis protocols** with live GPS coordinates to mobilize volunteers rapidly
- Launch **fundraising campaigns** — both social (community events) and emergency (disaster relief)
- Monitor all volunteers — their rank, badges, live mission status (INSIDE/OUTSIDE geofence)

### 🧑‍🤝‍🧑 For Volunteers
- Register, complete a **multilingual behavioral quiz** (English, Hindi, Tamil) to prove commitment
- Submit an **experience essay** — scored in real time by AI to grant ranks and badges
- Browse active missions and **apply for specific roles**
- **Live GPS tracking** during missions with geofence awareness — view your distance to mission base in real time
- Trigger an **SOS emergency broadcast** when in danger, alerting the organization immediately

---

## 🎯 Our Goal

To build a **unified, intelligent, and real-time** platform that:
1. Eliminates manual coordination overhead for NGOs and social organizations
2. Creates a trustworthy, qualified volunteer pool through AI-powered verification
3. Enables **rapid emergency response** by reducing mobilization time from hours to minutes
4. Provides full financial transparency for community fundraising

---

## 🆚 Existing Solutions & Their Gaps

| Platform | What They Do | What They Miss |
|---|---|---|
| **VolunteerMatch** | Lists volunteer opportunities | No real-time tracking, no AI recruitment |
| **Idealist** | Job/volunteer board | No event management or emergency tools |
| **Galaxy Digital** | Volunteer management | Expensive, not designed for India, no AI |
| **Spreadsheets/WhatsApp** | What most NGOs actually use | No structure, no accountability, no scale |
| **V-Org** ✅ | End-to-end orchestration | **All of the above in one platform + AI + GPS + SOS** |

---

## ✨ What Makes V-Org Unique

1. **AI-Powered Recruitment**: Uses Google Gemini to analyze your event blueprint and auto-generate precise volunteer department breakdowns — no guesswork.
2. **AI Experience Verification**: Volunteer essays are analyzed by AI and scored from 0–100, awarding ranks (Initiate → Activist → Impact Leader) and badges automatically.
3. **Real-Time GPS Geofencing**: Volunteers are tracked live during missions. Organizers can see who is INSIDE/OUTSIDE the operational zone at any moment.
4. **SOS Broadcast System**: One-click emergency alert from volunteer side, broadcasting exact GPS coordinates to the organizer's command dashboard.
5. **Multilingual Onboarding**: Behavioral quiz in English, Hindi, and Tamil — making volunteerism accessible to non-English speakers across India.
6. **Dual Fund System**: Supports both long-term social fundraising and rapid emergency financial mobilization in one platform.
7. **Zero-Manual-Coordination Design**: From recruitment to mission completion, every step is automated, tracked, and transparent.

---

## 📈 Impact Potential

- **Target Users**: NGOs, student volunteer clubs, disaster relief groups, municipal corporations, religious trusts
- **India Addressable Market**: 3.3 million+ registered NGOs, tens of thousands of unregistered community groups
- **Time Saved per Event**: 30+ hours of manual coordination reduced to under 30 minutes
- **Emergency Response Improvement**: Estimated 70%+ reduction in mobilization delay during crisis situations
- **Volunteer Retention**: Gamified ranks and badges drive long-term engagement — studies show recognition increases retention by 65%


---

## 🚀 Quick Start

See [TECH_STACK.md](./TECH_STACK.md) for setup instructions and technical details.

```bash
# Install dependencies
npm install

# Start Organizer demo
npm run dev:org   # → http://localhost:3000?view=organizer

# Start Volunteer demo (new terminal)
npm run dev:vol   # → http://localhost:3001?view=volunteer
```

---

*© 2025 V-Org — Distributed Community Intelligence Network*
