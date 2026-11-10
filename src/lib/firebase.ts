import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { TerrainType, calculateVDOT, formatTime } from './calculator';
import { StravaAnalysisSummary } from './strava';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain
);

const app = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export interface CloudUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  timeSeconds: number;
  vdot: number;
  terrain: TerrainType;
  inputMethod: 'manual' | 'strava';
  stravaSummary?: StravaAnalysisSummary | null;
  updatedAt: number;
}

export interface ProgressSnapshot {
  id: string;
  uid: string;
  date: string;
  label: string;
  timeSeconds: number;
  vdot: number;
  weeklyKmAvg: number;
  longestRunKm: number;
  createdAt: number;
}

/**
 * Strips undefined fields and caps recentActivities so the document stays compact (<150 KB) in Firestore
 */
function sanitizeSummaryForFirestore(
  summary: StravaAnalysisSummary | null | undefined
): StravaAnalysisSummary | null {
  if (!summary) return null;
  const compact: StravaAnalysisSummary = {
    ...summary,
    recentActivities: (summary.recentActivities || []).slice(0, 250),
    strengthActivities: (summary.strengthActivities || []).slice(0, 120),
    crossActivities: (summary.crossActivities || []).slice(0, 80),
  };
  return JSON.parse(JSON.stringify(compact));
}

export async function signInWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error('Faltan configurar las variables NEXT_PUBLIC_FIREBASE_* en el entorno.');
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function saveUserProfileToCloud(
  user: User,
  data: {
    timeSeconds: number;
    terrain: TerrainType;
    inputMethod: 'manual' | 'strava';
    stravaSummary?: StravaAnalysisSummary | null;
  }
): Promise<void> {
  if (!db) return;
  const vdot = calculateVDOT(data.timeSeconds);
  const cleanSummary = sanitizeSummaryForFirestore(data.stravaSummary);

  const payload: CloudUserProfile = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    timeSeconds: Math.round(data.timeSeconds),
    vdot,
    terrain: data.terrain,
    inputMethod: data.inputMethod,
    stravaSummary: cleanSummary,
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
}

export async function loadUserProfileFromCloud(uid: string): Promise<CloudUserProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as CloudUserProfile;
}

export async function saveProgressSnapshotToCloud(
  user: User,
  data: {
    timeSeconds: number;
    label?: string;
    stravaSummary?: StravaAnalysisSummary | null;
  }
): Promise<ProgressSnapshot> {
  if (!db) {
    throw new Error('Firebase no está configurado.');
  }
  const now = Date.now();
  const id = `snap-${now}`;
  const vdot = calculateVDOT(data.timeSeconds);
  const dateStr = new Date(now).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const snapshotData = {
    uid: user.uid,
    date: dateStr,
    label: data.label || `5K en ${formatTime(data.timeSeconds)}`,
    timeSeconds: Math.round(data.timeSeconds),
    vdot,
    weeklyKmAvg: data.stravaSummary?.weeklyKmAvg || 0,
    longestRunKm: data.stravaSummary?.longestRunKm || 0,
    createdAt: now,
  };

  await setDoc(doc(db, 'users', user.uid, 'snapshots', id), snapshotData);
  return { id, ...snapshotData };
}

export async function loadProgressSnapshotsFromCloud(uid: string): Promise<ProgressSnapshot[]> {
  if (!db) return [];
  const querySnap = await getDocs(collection(db, 'users', uid, 'snapshots'));
  const items: ProgressSnapshot[] = [];
  querySnap.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ProgressSnapshot, 'id'>),
    });
  });
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteProgressSnapshotFromCloud(
  uid: string,
  snapshotId: string
): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'users', uid, 'snapshots', snapshotId));
}
