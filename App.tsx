import React, { useState } from "react";
import {
  AppView,
  Organization,
  UserProfile,
  Language,
  EventDetails,
  VolunteerDepartment,
  ExperienceData,
  AppliedEvent,
} from "./types";
import {
  subscribeToAuth,
  getOrganizationProfile,
  getVolunteerProfile,
  loginUser,
  signUpUser,
  saveOrganizationProfile,
  saveVolunteerProfile,
  applyToEvent,
} from "./services/firebaseService";
import { auth } from "./services/firebase";
import Home from "./components/Home";
import OrgLogin from "./components/OrgLogin";
import OrgDashboard from "./components/OrgDashboard";
import HostEvent from "./components/HostEvent";
import RecruitmentSummary from "./components/RecruitmentSummary";
import EmergencyCrisis from "./components/EmergencyCrisis";
import FundRaise from "./components/FundRaise";
import VolunteerLogin from "./components/VolunteerLogin";
import VolunteerRegistration from "./components/VolunteerRegistration";
import LanguageSelect from "./components/LanguageSelect";
import BehavioralQuiz from "./components/BehavioralQuiz";
import ExperienceVerification from "./components/ExperienceVerification";
import VolunteerDashboard from "./components/VolunteerDashboard";
import VolunteerProfile from "./components/VolunteerProfile";
import { ToastProvider, useToast } from "./context/ToastContext";
import Snowfall from "react-snowfall";
import { motion } from "framer-motion";
import { analyzeVolunteerExperience } from "./services/geminiService";
import { getFirebaseErrorMessage, logError } from "./services/errorHandler";
import { validateEnvironment } from "./services/config";

// Validate environment on load
validateEnvironment();

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [org, setOrg] = useState<Organization | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedLang, setSelectedLang] = useState<Language>("english");
  const [stars, setStars] = useState(1);
  const [currentEvent, setCurrentEvent] = useState<EventDetails | null>(null);
  const [suggestions, setSuggestions] = useState<VolunteerDepartment[]>([]);
  const { showToast } = useToast();

  // --- Real-time Firebase Auth Sync ---
  React.useEffect(() => {
    // Check for demo view override in URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewOverride = urlParams.get("view");

    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        // Try to fetch as Org first
        const orgData = await getOrganizationProfile(firebaseUser.uid);
        if (orgData) {
          setOrg(orgData);
          if (viewOverride === "volunteer") {
            // If we're an org but forced to volunteer view, it might be a demo conflict.
            // Usually, we just follow the override if it's provided and we are logged in.
            // But for safety, we prioritze the logged in role unless the override is explicitly for that role.
          }
          setCurrentView(AppView.ORG_DASHBOARD);
          return;
        }
        // Then try as Volunteer
        const volData = await getVolunteerProfile(firebaseUser.uid);
        if (volData) {
          setUser(volData);
          setCurrentView(AppView.VOL_DASHBOARD);
          return;
        }
      } else {
        setOrg(null);
        setUser(null);

        // Demo Mode: Direct to login if view override is present even if not logged in
        if (viewOverride === "organizer") {
          setCurrentView(AppView.ORG_LOGIN);
        } else if (viewOverride === "volunteer") {
          setCurrentView(AppView.VOL_LOGIN);
        } else {
          setCurrentView(AppView.HOME);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const navigate = (view: AppView) => setCurrentView(view);

  const handleOrgLogin = async (data: Organization, password: string) => {
    try {
      const cred = await loginUser(data.email, password);

      // Ensure profile exists in Firestore for this auth user
      let orgData = await getOrganizationProfile(cred.user.uid);
      if (!orgData) {
        await saveOrganizationProfile(cred.user.uid, data);
        orgData = data;
      }

      setOrg(orgData);
      showToast(`Welcome back, ${data.name}!`, "success");
      navigate(AppView.ORG_DASHBOARD);
    } catch (error: any) {
      logError("Organization Login", error);

      // Modern Firebase uses 'auth/invalid-credential' for both 'user-not-found' and 'wrong-password'
      // for security reasons. For this demo, we treat it as an Invitation to Register.
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        try {
          const cred = await signUpUser(data.email, password);
          await saveOrganizationProfile(cred.user.uid, data);
          setOrg(data);
          showToast(`Neural Link Created: ${data.name}`, "success");
          navigate(AppView.ORG_DASHBOARD);
        } catch (regError: any) {
          logError("Organization Registration", regError);
          showToast(getFirebaseErrorMessage(regError, "Registration"), "error");
        }
      } else {
        showToast(getFirebaseErrorMessage(error, "Login"), "error");
      }
    }
  };

  const handleVolLoginSuccess = async (email: string, pass: string) => {
    try {
      const cred = await loginUser(email, pass);
      const profile = await getVolunteerProfile(cred.user.uid);
      if (profile) {
        setUser(profile);
        showToast("Access Granted. Neural link stable.", "success");
        // Check if user has already completed quiz
        if (profile.quizCompleted) {
          navigate(AppView.VOL_DASHBOARD);
        } else {
          // Direct to language selection if not completed
          navigate(AppView.VOL_LANG_SELECT);
        }
      } else {
        showToast("Profile not found. Please complete registration.", "error");
      }
    } catch (error: any) {
      logError("Volunteer Login", error);
      // If login fails, give clear error message
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        showToast(
          "Neural ID not found. Please check your credentials or sign up.",
          "error",
        );
      } else {
        showToast(getFirebaseErrorMessage(error, "Login"), "error");
      }
    }
  };

  const handleVolSignupSubmit = async (
    data: Partial<UserProfile>,
    password: string,
  ) => {
    try {
      const email = data.email || `vol_${Date.now()}@vorg.io`;
      let cred;

      try {
        cred = await signUpUser(email, password);
      } catch (signupError: any) {
        if (signupError.code === "auth/email-already-in-use") {
          // If already exists, just login
          cred = await loginUser(email, password);
        } else {
          throw signupError;
        }
      }

      const newUser: UserProfile = {
        fullName: data.fullName || "New Agent",
        email: email,
        phoneNumber: data.phoneNumber || "",
        location: data.location || "",
        profileImages: data.profileImages || [],
        rank: "Initiate",
        badges: [
          {
            id: "verified",
            name: "Bio Verified",
            icon: "🛡️",
            description: "Completed identity check.",
          },
        ],
        completedEvents: [],
        appliedEvents: [],
        joinedDate: new Date().toLocaleDateString(),
      };

      // Safety check for document size
      if (import.meta.env.DEV) {
        const dataSize = JSON.stringify(newUser).length;
        console.log(`Document Sync Size: ${(dataSize / 1024).toFixed(2)} KB`);
      }

      await saveVolunteerProfile(cred.user.uid, newUser);
      setUser(newUser);
      showToast("Neural link established. Profile synchronized.", "success");
      navigate(AppView.VOL_LANG_SELECT);
    } catch (error: any) {
      logError("Volunteer Signup", error);
      showToast(getFirebaseErrorMessage(error, "Signup"), "error");
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
    if (user && auth.currentUser) {
      const updated = { ...user, preferredLanguage: lang };
      saveVolunteerProfile(auth.currentUser.uid, updated);
      setUser(updated);
    }
    navigate(AppView.VOL_QUIZ);
  };

  const handleQuizComplete = async (score: number) => {
    const newStars = Math.max(1, Math.round((score / 100) * 3));
    setStars(newStars);
    if (user && auth.currentUser) {
      const updatedUser = { ...user, quizCompleted: true };
      const hasBadge = updatedUser.badges.some((b) => b.id === "behavioral");
      if (!hasBadge) {
        updatedUser.badges.push({
          id: "behavioral",
          name: "Behavioral Pass",
          icon: "🧠",
          description: "Passed behavioral audit.",
        });
      }
      await saveVolunteerProfile(auth.currentUser.uid, updatedUser);
      setUser(updatedUser);
    }
    navigate(AppView.VOL_EXP_VERIFY);
  };

  const handleExpVerifySubmit = async (data: ExperienceData) => {
    const aiScore = await analyzeVolunteerExperience(data.essay);
    const addedStars = Math.round((aiScore / 100) * 2);
    setStars((prev) => Math.min(prev + addedStars, 5));

    if (user) {
      const updatedUser = { ...user };
      if (aiScore > 50) {
        updatedUser.rank = "Activist";
        const hasBadge = updatedUser.badges.some(
          (b) => b.id === "exp_verified",
        );
        if (!hasBadge) {
          updatedUser.badges.push({
            id: "exp_verified",
            name: "Field Veteran",
            icon: "🎖️",
            description: "Experience verified by AI.",
          });
        }
      }
      setUser(updatedUser);
    }
    navigate(AppView.VOL_DASHBOARD);
    showToast("Onboarding Protocols Complete. Welcome Agent.", "success");
  };

  const handleApplyToEvent = async (eventId: string, role: string) => {
    if (!auth.currentUser) {
      showToast("Identity link required for deployment.", "error");
      return;
    }

    try {
      await applyToEvent(auth.currentUser.uid, eventId, role);
      showToast("Application transmitted to HQ.", "success");

      // Update local state if needed (optional since we have real-time listeners for profile too)
      if (user) {
        const updated = {
          ...user,
          appliedEvents: [
            ...user.appliedEvents,
            { eventId, role, passcode: "..." },
          ],
        };
        await saveVolunteerProfile(auth.currentUser.uid, updated);
        setUser(updated);
      }

      navigate(AppView.VOL_DASHBOARD);
    } catch (error) {
      showToast("Application Transmission Error.", "error");
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Home onNavigate={navigate} />;
      case AppView.ORG_LOGIN:
        return (
          <OrgLogin
            onSubmit={handleOrgLogin}
            onBack={() => navigate(AppView.HOME)}
          />
        );
      case AppView.VOL_LOGIN:
        return (
          <VolunteerLogin
            onSuccess={handleVolLoginSuccess}
            onBack={() => navigate(AppView.HOME)}
            onGoToSignup={() => navigate(AppView.VOL_SIGNUP)}
          />
        );
      case AppView.VOL_SIGNUP:
        return (
          <VolunteerRegistration
            onSubmit={handleVolSignupSubmit}
            onBack={() => navigate(AppView.VOL_LOGIN)}
          />
        );
      case AppView.VOL_LANG_SELECT:
        return <LanguageSelect onSelect={handleLanguageSelect} />;
      case AppView.VOL_QUIZ:
        return (
          <BehavioralQuiz
            language={selectedLang}
            onComplete={handleQuizComplete}
          />
        );
      case AppView.VOL_EXP_VERIFY:
        return (
          <ExperienceVerification
            profileImages={user?.profileImages || []}
            onSubmit={handleExpVerifySubmit}
            onSkip={() => navigate(AppView.VOL_DASHBOARD)}
          />
        );
      case AppView.VOL_DASHBOARD:
        return user ? (
          <VolunteerDashboard
            user={user}
            stars={stars}
            onApplyToEvent={handleApplyToEvent}
            onViewProfile={() => navigate(AppView.VOL_PROFILE)}
          />
        ) : (
          <Home onNavigate={navigate} />
        );
      case AppView.VOL_PROFILE:
        return user ? (
          <VolunteerProfile
            user={user}
            stars={stars}
            onBack={() => navigate(AppView.VOL_DASHBOARD)}
          />
        ) : (
          <Home onNavigate={navigate} />
        );
      case AppView.ORG_DASHBOARD:
        return <OrgDashboard org={org} onNavigate={navigate} />;
      case AppView.HOST_EVENT:
        return (
          <HostEvent
            onRecruit={(event, suggestions) => {
              setCurrentEvent(event);
              setSuggestions(suggestions);
              navigate(AppView.RECRUITMENT_SUMMARY);
            }}
            onNavigate={navigate}
            onBack={() => navigate(AppView.ORG_DASHBOARD)}
            showToast={showToast}
          />
        );
      case AppView.RECRUITMENT_SUMMARY:
        return currentEvent ? (
          <RecruitmentSummary
            event={currentEvent}
            suggestions={suggestions}
            onConfirm={() => {
              showToast("Event Successfully Registered!", "success");
              navigate(AppView.ORG_DASHBOARD);
            }}
            onBack={() => navigate(AppView.HOST_EVENT)}
          />
        ) : (
          <div className="max-w-xl mx-auto py-20 text-center">
            <p className="text-textLight/40 mb-4 uppercase tracking-widest text-xs">
              Uplink Lost / Cache Purged
            </p>
            <button
              onClick={() => navigate(AppView.ORG_DASHBOARD)}
              className="text-primary font-bold hover:underline"
            >
              Return to Command Dashboard &rarr;
            </button>
          </div>
        );
      case AppView.EMERGENCY_CRISIS:
        return (
          <EmergencyCrisis
            onCallVolunteers={(details) => {
              showToast("Emergency Alert Broadcasted!", "success");
              navigate(AppView.ORG_DASHBOARD);
            }}
            onBack={() => navigate(AppView.ORG_DASHBOARD)}
            onNavigate={navigate}
            showToast={showToast}
          />
        );
      case AppView.FUND_RAISE:
        return (
          <FundRaise
            onSubmitSocial={() => {
              showToast("Social Fund Submitted!", "success");
              navigate(AppView.ORG_DASHBOARD);
            }}
            onSubmitEmergency={() => {
              showToast("Emergency Fund Alert Sent!", "success");
              navigate(AppView.ORG_DASHBOARD);
            }}
            onBack={() => navigate(AppView.ORG_DASHBOARD)}
          />
        );
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-primary selection:text-white overflow-hidden flex flex-col">
      {/* Futuristic global background */}
      <div className="bg-grid" />
      <div className="bg-radial-spot spot-1" />
      <div className="bg-radial-spot spot-2" />
      <div className="floating-orbit w-[420px] h-[420px] -left-40 top-40" />
      <div className="floating-orbit floating-orbit--slow w-[520px] h-[520px] -right-40 bottom-10" />

      {/* Snowfall effect */}
      <div className="pointer-events-none fixed inset-0 z-0 mix-blend-screen">
        <Snowfall
          snowflakeCount={80}
          color="#a0b48e"
          style={{ position: "fixed", width: "100vw", height: "100vh" }}
        />
      </div>

      <motion.nav
        className="relative border-b border-white/5 bg-background/70 sticky top-0 z-40 px-6 py-4 flex justify-between items-center backdrop-blur-xl"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div
          onClick={() => navigate(AppView.HOME)}
          className="group inline-flex items-center gap-2 cursor-pointer"
        >
          <span className="relative text-3xl font-black text-primary tracking-tighter">
            V-Org-
            <span className="absolute -bottom-1 left-0 h-[2px] w-4 bg-primary/80 group-hover:w-full transition-all duration-300" />
          </span>
          <span className="hidden md:inline text-[11px] uppercase tracking-[0.3em] text-textLight/70">
            Volunteer Orchestration Grid
          </span>
        </div>

        {(org || user) && currentView !== AppView.HOME && (
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-textLight/40 uppercase tracking-widest">
                {org ? "Org Entity" : "Volunteer Node"}
              </span>
              <span className="text-sm text-white font-black uppercase tracking-tight">
                {org?.name || user?.fullName}
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("vorg_user_email");
                localStorage.removeItem("vorg_org_data");
                localStorage.removeItem("vorg_user_data");
                localStorage.removeItem("vorg_user_stars");
                localStorage.removeItem("vorg_user_lang");
                setOrg(null);
                setUser(null);
                navigate(AppView.HOME);
                showToast("Connection Terminated", "info");
              }}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition-all text-textLight hover:text-red-500"
              title="Logout"
            >
              ⏻
            </button>
          </div>
        )}
      </motion.nav>
      <main className="relative max-w-7xl mx-auto px-4 py-8 z-10 flex-1 w-full">
        {renderView()}
      </main>
      <footer className="relative mt-auto py-12 px-6 border-t border-white/5 text-center text-textLight/50 text-[10px] font-bold uppercase tracking-[0.5em] z-10">
        &copy; {new Date().getFullYear()} vorg-ops // distributed community
        intelligence network
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
