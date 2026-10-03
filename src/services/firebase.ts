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
  type?: 'text' | 'audio' | 'image';
  text?: string;
  audioUrl?: string;
  duration?: number;
  imageUrl?: string;
  caption?: string;
  timestamp: number;
}

/**
 * Real-time subscription to the couple's live love scrolls.
 * Supports text decrees, browser voice notes, and compressed photos.
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
          if (data && (data.text || data.audioUrl || data.imageUrl)) {
            msgs.push({
              id: data.id || docSnap.id,
              sender: data.sender || 'Sanctuary Keeper 🌿',
              senderRole: data.senderRole || 'demigod',
              type: data.type || (data.audioUrl ? 'audio' : data.imageUrl ? 'image' : 'text'),
              text: data.text || '',
              audioUrl: data.audioUrl,
              duration: data.duration,
              imageUrl: data.imageUrl,
              caption: data.caption,
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
 * Save a new love scroll or multimedia note to Cloud Firestore.
 */
export async function pushLoveScrollToCloud(scroll: FirebaseLoveScroll): Promise<boolean> {
  try {
    const docRef = doc(db, 'loveScrolls', scroll.id);
    const payload: Record<string, any> = {
      id: scroll.id,
      sender: scroll.sender,
      senderRole: scroll.senderRole,
      type: scroll.type || 'text',
      timestamp: scroll.timestamp
    };
    if (scroll.text !== undefined) payload.text = scroll.text;
    if (scroll.audioUrl) payload.audioUrl = scroll.audioUrl;
    if (scroll.duration) payload.duration = scroll.duration;
    if (scroll.imageUrl) payload.imageUrl = scroll.imageUrl;
    if (scroll.caption) payload.caption = scroll.caption;

    await setDoc(docRef, payload);
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

export interface ArcadeCloudState {
  gameId: string; // 'tic-tac-toe' | 'gomoku' | 'trivia' | 'alchemy' | 'couples-telepathy' | 'potion-craft' | 'silhouette-duel';
  turn: 'Chif3n' | 'Leslye';
  boardState: any;
  scores: { Chif3n: number; Leslye: number };
  lastMove: { player: string; action: string; timestamp: number };
  winner: string | null;
}

/**
 * Real-time listener for the activeSession document in Firestore
 */
export function subscribeToActiveArcadeSession(onUpdate: (state: ArcadeCloudState) => void): () => void {
  try {
    const docRef = doc(db, 'coupleArcade', 'activeSession');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as ArcadeCloudState;
          if (data && data.gameId) {
            onUpdate(data);
          }
        }
      },
      (error) => {
        console.warn('[Firestore] activeSession subscription warning:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error initializing activeSession listener:', err);
    return () => {};
  }
}

/**
 * Update the shared activeSession document in Firestore
 */
export async function updateActiveArcadeSession(state: Partial<ArcadeCloudState>): Promise<boolean> {
  try {
    const docRef = doc(db, 'coupleArcade', 'activeSession');
    await setDoc(docRef, {
      ...state,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to update activeSession:', err);
    return false;
  }
}
