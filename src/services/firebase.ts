import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  arrayUnion,
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
  readBy?: string[];
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
              timestamp: data.timestamp || Date.now(),
              readBy: Array.isArray(data.readBy) ? data.readBy : [data.senderRole || 'demigod']
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
      timestamp: scroll.timestamp,
      readBy: scroll.readBy || [scroll.senderRole]
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
 * Mark messages in Cloud Firestore as read by a specific partner role (Sir Chif3n or Lady Leslye).
 */
export async function markLoveScrollsAsRead(
  userRole: 'chif3n' | 'leslye',
  messagesToMark: FirebaseLoveScroll[]
): Promise<void> {
  if (!messagesToMark || messagesToMark.length === 0) return;

  const unreadMessages = messagesToMark.filter((m) => {
    // Only mark messages sent by the other partner that haven't been marked yet
    return m.senderRole !== userRole && (!m.readBy || !m.readBy.includes(userRole));
  });

  if (unreadMessages.length === 0) return;

  try {
    const updatePromises = unreadMessages.map(async (msg) => {
      const docRef = doc(db, 'loveScrolls', msg.id);
      await updateDoc(docRef, {
        readBy: arrayUnion(userRole)
      });
    });

    await Promise.all(updatePromises);
  } catch (err) {
    console.warn('[Firestore] Error marking messages as read:', err);
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
 * Real-time listener for the globalSharedSession document in Firestore
 */
export function subscribeToActiveArcadeSession(onUpdate: (state: ArcadeCloudState) => void): () => void {
  try {
    const docRef = doc(db, 'coupleArcade', 'globalSharedSession');
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
        console.warn('[Firestore] globalSharedSession subscription warning:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error initializing globalSharedSession listener:', err);
    return () => {};
  }
}

/**
 * Update the shared globalSharedSession document in Firestore
 */
export async function updateActiveArcadeSession(state: Partial<ArcadeCloudState>): Promise<boolean> {
  try {
    const docRef = doc(db, 'coupleArcade', 'globalSharedSession');
    await setDoc(docRef, {
      ...state,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to update globalSharedSession:', err);
    return false;
  }
}

// -------------------------------------------------------------
// WATCH PARTY & REAL-TIME VIDEO PLAYHEAD SYNCHRONIZATION
// -------------------------------------------------------------
export interface DanmakuReaction {
  id: string;
  sender: string;
  icon: string;
  text?: string;
  color: string;
  timestamp: number;
}

export interface WatchPartySession {
  animeMalId: number;
  animeTitle: string;
  episode: number;
  currentTime: number;
  isPlaying: boolean;
  lastUpdated: number;
  updatedBy: 'chif3n' | 'leslye';
  danmaku?: DanmakuReaction[];
}

export function subscribeToWatchPartySession(onUpdate: (session: WatchPartySession) => void): () => void {
  try {
    const docRef = doc(db, 'watchParty', 'globalSession');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as WatchPartySession;
          if (data && data.animeMalId) {
            onUpdate(data);
          }
        }
      },
      (error) => {
        console.warn('[Firestore] watchParty subscription warning:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error initializing watchParty listener:', err);
    return () => {};
  }
}

export async function updateWatchPartySession(patch: Partial<WatchPartySession>): Promise<boolean> {
  try {
    const docRef = doc(db, 'watchParty', 'globalSession');
    await setDoc(docRef, {
      ...patch,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to update watchParty session:', err);
    return false;
  }
}

export async function broadcastDanmaku(danmakuItem: DanmakuReaction): Promise<boolean> {
  try {
    const docRef = doc(db, 'watchParty', 'globalSession');
    await setDoc(docRef, {
      lastDanmaku: danmakuItem,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to broadcast danmaku:', err);
    return false;
  }
}

// -------------------------------------------------------------
// IMPERIAL MOOD HERB STATUS
// -------------------------------------------------------------
export interface MoodHerbStatus {
  moodId: string;
  emoji: string;
  label: string;
  note?: string;
  updatedBy: 'chif3n' | 'leslye';
  lastUpdated: number;
}

export function subscribeToMoodHerbStatus(onUpdate: (status: MoodHerbStatus) => void): () => void {
  try {
    const docRef = doc(db, 'coupleStatus', 'moodPill');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as MoodHerbStatus;
          if (data && data.moodId) {
            onUpdate(data);
          }
        }
      },
      (error) => {
        console.warn('[Firestore] moodPill subscription warning:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error initializing moodPill listener:', err);
    return () => {};
  }
}

export async function updateMoodHerbStatus(status: MoodHerbStatus): Promise<boolean> {
  try {
    const docRef = doc(db, 'coupleStatus', 'moodPill');
    await setDoc(docRef, {
      ...status,
      lastUpdated: Date.now()
    });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to update mood status:', err);
    return false;
  }
}

// -------------------------------------------------------------
// TIME-LOCKED IMPERIAL VOICE & LOVE CAPSULES
// -------------------------------------------------------------
export interface TimeLockedCapsule {
  id: string;
  authorRole: 'chif3n' | 'leslye';
  authorName: string;
  title: string;
  unlockTimestamp: number;
  createdTimestamp: number;
  messageType: 'text' | 'voice' | 'image';
  content: string; // text decree, base64 voice note data url, or image data url
  sealDesign: string; // 'imperial-gold' | 'jade-apothecary' | 'rose-demigod'
  isOpened?: boolean;
}

export function subscribeToTimeLockedCapsules(onUpdate: (capsules: TimeLockedCapsule[]) => void): () => void {
  try {
    const q = query(collection(db, 'timeCapsules'), orderBy('createdTimestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: TimeLockedCapsule[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TimeLockedCapsule;
          if (data && data.id) {
            list.push(data);
          }
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('[Firestore] timeCapsules subscription warning:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error initializing timeCapsules listener:', err);
    return () => {};
  }
}

export async function saveTimeLockedCapsule(capsule: TimeLockedCapsule): Promise<boolean> {
  try {
    const docRef = doc(db, 'timeCapsules', capsule.id);
    await setDoc(docRef, capsule);
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to save time capsule:', err);
    return false;
  }
}

// =========================================================================
// IMPERIAL VOICE & VIDEO CALL SIGNALING ENGINE (Real-Time WebRTC Link)
// =========================================================================

export interface CoupleCallSession {
  callId: string;
  callerRole: 'chif3n' | 'leslye';
  callerName: string;
  receiverRole: 'chif3n' | 'leslye';
  type: 'audio' | 'video';
  status: 'calling' | 'connected' | 'ended' | 'declined';
  timestamp: number;
  offer?: any;
  answer?: any;
  callerCandidates?: any[];
  receiverCandidates?: any[];
}

/**
 * Real-time listener for incoming & ongoing calls between Sir Chif3n and Lady Leslye.
 */
export function subscribeToCallSession(onUpdate: (session: CoupleCallSession | null) => void): () => void {
  try {
    const docRef = doc(db, 'coupleCall', 'current_session');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CoupleCallSession;
          onUpdate(data);
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        console.warn('[Firestore] call session listener warning:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error subscribing to call session:', err);
    return () => {};
  }
}

/**
 * Initiate an Imperial Voice or Video Call
 */
export async function startCallSession(session: Omit<CoupleCallSession, 'timestamp'>): Promise<boolean> {
  try {
    const docRef = doc(db, 'coupleCall', 'current_session');
    await setDoc(docRef, {
      ...session,
      timestamp: Date.now()
    });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to start call session:', err);
    return false;
  }
}

/**
 * Answer an incoming call with SDP Answer and status 'connected'
 */
export async function answerCallSession(answerPayload: { answer?: any; status: 'connected' | 'declined' }): Promise<boolean> {
  try {
    const docRef = doc(db, 'coupleCall', 'current_session');
    await setDoc(docRef, answerPayload, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to answer call session:', err);
    return false;
  }
}

/**
 * Add an ICE candidate during WebRTC peer negotiation
 */
export async function addCallIceCandidate(role: 'caller' | 'receiver', candidate: any): Promise<void> {
  try {
    const docRef = doc(db, 'coupleCall', 'current_session');
    const field = role === 'caller' ? 'callerCandidates' : 'receiverCandidates';
    await updateDoc(docRef, {
      [field]: arrayUnion(JSON.stringify(candidate))
    });
  } catch (err) {
    console.warn('[Firestore] Could not push ICE candidate:', err);
  }
}

/**
 * End or terminate the active call session
 */
export async function endCallSession(): Promise<boolean> {
  try {
    const docRef = doc(db, 'coupleCall', 'current_session');
    await setDoc(docRef, { status: 'ended', endedAt: Date.now() }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to end call session:', err);
    return false;
  }
}


