import { initializeApp } from 'firebase/app';
import type { FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore, setLogLevel, disableNetwork } from 'firebase/firestore';

// Silence verbose internal Firebase SDK warning logs during temporary quota exhaustion
setLogLevel('silent');


function readCloudConfig(): (FirebaseOptions & { firestoreDatabaseId?: string }) | undefined {
  try {
    const raw = import.meta.env.VITE_DK_FIREBASE_CONFIG;
    if (!raw) return;
    const config = JSON.parse(raw);
    if (['apiKey', 'appId', 'authDomain', 'projectId'].every(key => typeof config?.[key] === 'string' && config[key].trim())) return config;
  } catch {
    console.warn('Firebase test yapılandırması geçersiz. Yerel mod etkin.');
  }
}

const cloudConfig = readCloudConfig();
export const cloudEnabled = !!cloudConfig;
const app = initializeApp(cloudConfig || {
  apiKey: 'dijital-kutuphanem-local-only',
  appId: '1:1:web:local-only',
  projectId: 'demo-dijital-kutuphanem',
}, cloudEnabled ? 'dk-configured-cloud' : 'dk-local-only');
export const db = cloudConfig?.firestoreDatabaseId ? getFirestore(app, cloudConfig.firestoreDatabaseId) : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function handleQuotaExhaustion() {
  disableNetwork(db).catch(() => {});
}



export async function loginWithGoogle() {
  if (!cloudEnabled) throw new Error('Bu sürüm yerel modda. Google ile giriş için ayrı bir Firebase projesi yapılandırılmalı.');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Validation function as requested by Firebase Integration Skill
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connected successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline. Local cache mode enabled.");
    }
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  if (errMessage.includes('resource-exhausted') || errMessage.includes('Quota limit exceeded')) {
    handleQuotaExhaustion();
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice:', errInfo.error);
}


