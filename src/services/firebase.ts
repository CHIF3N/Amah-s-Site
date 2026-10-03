import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the provisioned database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate connection on boot as mandated by the Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or verifying configuration.');
    }
  }
}
testConnection();

export interface FirebaseLoveScroll {
  id: string;
  sender: string;
  senderRole: 'chif3n' | 'leslye' | 'demigod';
  text: string;
  timestamp: number;
}

/**
 * Real-time subscription to the couple's live love scrolls.
 * Updates instantaneously on any connected phone or laptop anywhere in the world.
 */
export function subscribeToLoveScrolls(onUpdate: (messages: FirebaseLoveScroll[]) => void): () => void {
  try {
    const q = query(collection(db, 'loveScrolls'), orderBy('timestamp', 'asc'), limit(150));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: FirebaseLoveScroll[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FirebaseLoveScroll;
          if (data && data.text) {
            msgs.push({
              id: data.id || docSnap.id,
              sender: data.sender || 'Sanctuary Keeper 🌿',
              senderRole: data.senderRole || 'demigod',
              text: data.text,
              timestamp: data.timestamp || Date.now()
            });
          }
        });
        onUpdate(msgs);
      },
      (error) => {
        console.warn('[Firestore] loveScrolls subscription warning:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error initializing loveScrolls listener:', err);
    return () => {};
  }
}

/**
 * Save a new love scroll to Cloud Firestore.
 * Transmits across the world in <100ms.
 */
export async function pushLoveScrollToCloud(scroll: FirebaseLoveScroll): Promise<boolean> {
  try {
    const docRef = doc(db, 'loveScrolls', scroll.id);
    await setDoc(docRef, {
      id: scroll.id,
      sender: scroll.sender,
      senderRole: scroll.senderRole,
      text: scroll.text,
      timestamp: scroll.timestamp
    });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to save love scroll:', err);
    return false;
  }
}

/**
 * Real-time subscription to Imperial Couple Arcade games state.
 * Syncs Tic-Tac-Toe, Gomoku, Trivia, and Alchemy card flips across both devices.
 */
export function subscribeToArcadeCloud(onUpdate: (arcadeState: any) => void): () => void {
  try {
    const docRef = doc(db, 'coupleArcade', 'imperial_state');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.boardGame) {
            onUpdate(data);
          }
        }
      },
      (error) => {
        console.warn('[Firestore] coupleArcade subscription warning:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error initializing coupleArcade listener:', err);
    return () => {};
  }
}

/**
 * Sync Imperial Arcade moves to Cloud Firestore.
 */
export async function syncArcadeToCloud(arcadeState: any): Promise<boolean> {
  try {
    const docRef = doc(db, 'coupleArcade', 'imperial_state');
    await setDoc(docRef, {
      ...arcadeState,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to sync arcade state:', err);
    return false;
  }
}
