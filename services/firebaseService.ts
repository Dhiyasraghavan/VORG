
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    getDocs,
    onSnapshot,
    Timestamp,
    getDoc,
    setDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    User
} from "firebase/auth";
import { db, auth } from "./firebase";
import { Organization, UserProfile, EventDetails, FundDetails, AppliedEvent, Application, FirebaseEvent } from "../types";

// --- Authentication Service ---

export const signUpUser = async (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
};

export const loginUser = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = () => signOut(auth);

export const subscribeToAuth = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// --- Profile Management ---

export const saveOrganizationProfile = async (uid: string, data: Organization) => {
    await setDoc(doc(db, "organizations", uid), {
        ...data,
        updatedAt: Timestamp.now()
    });
};

export const getOrganizationProfile = async (uid: string): Promise<Organization | null> => {
    const docRef = doc(db, "organizations", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Organization : null;
};

export const saveVolunteerProfile = async (uid: string, data: UserProfile) => {
    await setDoc(doc(db, "volunteers", uid), {
        ...data,
        updatedAt: Timestamp.now()
    });
};

export const getVolunteerProfile = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, "volunteers", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
};

// --- Missions & Events ---

export const hostNewEvent = async (orgId: string, event: EventDetails) => {
    return addDoc(collection(db, "events"), {
        ...event,
        orgId,
        status: 'active',
        volunteerCount: 0,
        acceptedVolunteers: [],
        createdAt: Timestamp.now()
    });
};

export const getOrgEvents = (orgId: string, callback: (events: FirebaseEvent[]) => void) => {
    // Zero-filter query to guarantee index-free operation
    const q = query(collection(db, "events"));
    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() as any } as FirebaseEvent))
            .filter(event => event.orgId === orgId)
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        callback(events);
    });
};

export const getAllActiveMissions = (callback: (missions: FirebaseEvent[]) => void) => {
    const q = query(collection(db, "events"));
    return onSnapshot(q, (snapshot) => {
        const missions = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() as any } as FirebaseEvent))
            .filter(m => m.status === 'active')
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        callback(missions);
    });
};

// --- Funding Service ---

export const createFundRequest = async (orgId: string, fund: FundDetails) => {
    return addDoc(collection(db, "funds"), {
        ...fund,
        orgId,
        raised: 0,
        createdAt: Timestamp.now()
    });
};

export const getGlobalFunds = (callback: (funds: any[]) => void) => {
    const q = query(collection(db, "funds"));
    return onSnapshot(q, (snapshot) => {
        const funds = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() as any }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        callback(funds);
    });
};

// --- Application & Real-time Integration ---

export const applyToEvent = async (volunteerId: string, eventId: string, role: string) => {
    const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return addDoc(collection(db, "applications"), {
        volunteerId,
        eventId,
        role,
        passcode,
        status: 'pending',
        createdAt: Timestamp.now()
    });
};

export const getEventApplications = (eventId: string, callback: (apps: Application[]) => void) => {
    const q = query(collection(db, "applications"));
    return onSnapshot(q, (snapshot) => {
        const apps = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() as any } as Application))
            .filter(app => app.eventId === eventId && app.status === 'pending');
        callback(apps);
    });
};

export const acceptVolunteer = async (applicationId: string, eventId: string) => {
    const appRef = doc(db, "applications", applicationId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) throw new Error("Application not found");
    const appData = appSnap.data() as Application;

    await updateDoc(appRef, { status: 'accepted' });

    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
        acceptedVolunteers: arrayUnion(appData.volunteerId),
    });

    // Update count based on actual unique volunteers
    const updatedEventSnap = await getDoc(eventRef);
    if (updatedEventSnap.exists()) {
        const accepted = updatedEventSnap.data().acceptedVolunteers || [];
        await updateDoc(eventRef, {
            volunteerCount: accepted.length
        });
    }
};

export const getAllVolunteers = (callback: (volunteers: (UserProfile & { id: string })[]) => void) => {
    const q = query(collection(db, "volunteers"));
    return onSnapshot(q, (snapshot) => {
        const volunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as UserProfile & { id: string }));
        callback(volunteers);
    });
};

export const deleteVolunteer = async (volunteerId: string) => {
    // 1. Delete the volunteer profile
    await deleteDoc(doc(db, "volunteers", volunteerId));

    // 2. Remove from all events
    const eventsSnap = await getDocs(collection(db, "events"));
    for (const eventDoc of eventsSnap.docs) {
        const eventData = eventDoc.data();
        if (eventData.acceptedVolunteers?.includes(volunteerId)) {
            const eventRef = doc(db, "events", eventDoc.id);
            const newAccepted = (eventData.acceptedVolunteers as string[]).filter(id => id !== volunteerId);
            await updateDoc(eventRef, {
                acceptedVolunteers: arrayRemove(volunteerId),
                volunteerCount: newAccepted.length
            });
        }
    }

    // 3. Remove pending applications (Optional but good for data health)
    const appsSnap = await getDocs(query(collection(db, "applications"), where("volunteerId", "==", volunteerId)));
    for (const appDoc of appsSnap.docs) {
        await deleteDoc(doc(db, "applications", appDoc.id));
    }
};

export const updateVolunteerLocation = async (volunteerId: string, eventId: string, location: { latitude: number, longitude: number }) => {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
        [`liveLocations.${volunteerId}`]: {
            ...location,
            lastUpdate: Timestamp.now()
        }
    });
};

export const broadcastSOS = async (volunteerId: string, eventId: string, location: { latitude: number, longitude: number }, fullName: string) => {
    await addDoc(collection(db, "alerts"), {
        volunteerId,
        eventId,
        location,
        fullName,
        type: 'SOS',
        timestamp: Timestamp.now(),
        status: 'active'
    });
};
