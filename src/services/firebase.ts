import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
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

// Error handling types and helper matching the Firebase integration skill
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

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
  reactions?: Record<string, string[]>;
  readBy?: string[];
  timestamp: number;
}

export interface FirebaseWhisperNote {
  id: string;
  text: string;
  sender?: string;
  date: string;
  timestamp: number;
}

export interface FirebaseDateNightItem {
  id: string;
  malId: number;
  title: string;
  image: string;
  addedAt: number;
  watched: boolean;
  ourRating?: number;
  coupleComment?: string;
}

/**
 * Real-time subscription to the couple's live love scrolls.
 * Supports text decrees, browser voice notes, compressed photos, and reactions.
 */
export function subscribeToLoveScrolls(onUpdate: (messages: FirebaseLoveScroll[]) => void): () => void {
  const collectionPath = 'loveScrolls';
  try {
    const q = query(collection(db, collectionPath), orderBy('timestamp', 'asc'), limit(250));
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
              reactions: data.reactions || {},
              readBy: Array.isArray(data.readBy) ? data.readBy : [],
              timestamp: data.timestamp || Date.now()
            });
          }
        });
        onUpdate(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, collectionPath);
    return () => {};
  }
}

/**
 * Save a new love scroll or multimedia note to Cloud Firestore.
 */
export async function pushLoveScrollToCloud(scroll: FirebaseLoveScroll): Promise<boolean> {
  const docPath = `loveScrolls/${scroll.id}`;
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
    if (scroll.reactions) payload.reactions = scroll.reactions;
    if (scroll.readBy) payload.readBy = scroll.readBy;

    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
    return false;
  }
}

/**
 * Update the Firestore message document with the current user's role in the readBy array field.
 */
export async function markLoveScrollReadInCloud(id: string, readerRole: string): Promise<boolean> {
  const docPath = `loveScrolls/${id}`;
  try {
    const docRef = doc(db, 'loveScrolls', id);
    await updateDoc(docRef, {
      readBy: arrayUnion(readerRole)
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
    return false;
  }
}

/**
 * Batch update multiple Firestore message documents with the current user's role in the readBy array field upon vault opening.
 */
export async function markAllLoveScrollsReadInCloud(ids: string[], readerRole: string): Promise<void> {
  if (!ids || ids.length === 0) return;
  await Promise.allSettled(ids.map((id) => markLoveScrollReadInCloud(id, readerRole)));
}

/**
 * Delete a love scroll from Cloud Firestore.
 */
export async function deleteLoveScrollFromCloud(id: string): Promise<boolean> {
  const docPath = `loveScrolls/${id}`;
  try {
    const docRef = doc(db, 'loveScrolls', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
    return false;
  }
}

/**
 * React to a love scroll in Cloud Firestore.
 */
export async function reactToLoveScrollInCloud(id: string, emoji: string, user: string): Promise<boolean> {
  const docPath = `loveScrolls/${id}`;
  try {
    const docRef = doc(db, 'loveScrolls', id);
    // Fetch or merge reaction
    await setDoc(docRef, {
      reactions: {
        [emoji]: [user]
      }
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
    return false;
  }
}

/**
 * Real-time subscription to Lady Leslye's Herbal Diary & Whispers.
 */
export function subscribeToWhisperNotes(onUpdate: (notes: FirebaseWhisperNote[]) => void): () => void {
  const collectionPath = 'whisperNotes';
  try {
    const q = query(collection(db, collectionPath), orderBy('timestamp', 'desc'), limit(150));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notes: FirebaseWhisperNote[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FirebaseWhisperNote;
          if (data && data.text) {
            notes.push({
              id: data.id || docSnap.id,
              text: data.text,
              sender: data.sender || 'Lady Leslye 🌿',
              date: data.date || 'Today',
              timestamp: data.timestamp || Date.now()
            });
          }
        });
        onUpdate(notes);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, collectionPath);
    return () => {};
  }
}

/**
 * Push a new whisper note to Cloud Firestore.
 */
export async function pushWhisperNoteToCloud(note: FirebaseWhisperNote): Promise<boolean> {
  const docPath = `whisperNotes/${note.id}`;
  try {
    const docRef = doc(db, 'whisperNotes', note.id);
    await setDoc(docRef, {
      id: note.id,
      text: note.text,
      sender: note.sender || 'Lady Leslye 🌿',
      date: note.date,
      timestamp: note.timestamp || Date.now()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
    return false;
  }
}

/**
 * Delete a whisper note from Cloud Firestore.
 */
export async function deleteWhisperNoteFromCloud(id: string): Promise<boolean> {
  const docPath = `whisperNotes/${id}`;
  try {
    const docRef = doc(db, 'whisperNotes', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
    return false;
  }
}

/**
 * Real-time subscription to Date Night Queue items.
 */
export function subscribeToDateNightQueue(onUpdate: (items: FirebaseDateNightItem[]) => void): () => void {
  const collectionPath = 'dateNightQueue';
  try {
    const q = query(collection(db, collectionPath), orderBy('addedAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: FirebaseDateNightItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FirebaseDateNightItem;
          if (data && data.malId && data.title) {
            items.push({
              id: data.id || docSnap.id,
              malId: data.malId,
              title: data.title,
              image: data.image || '',
              addedAt: data.addedAt || Date.now(),
              watched: !!data.watched,
              ourRating: typeof data.ourRating === 'number' ? data.ourRating : 5,
              coupleComment: data.coupleComment || ''
            });
          }
        });
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, collectionPath);
    return () => {};
  }
}

/**
 * Sync a Date Night item to Cloud Firestore.
 */
export async function syncDateNightItemToCloud(item: FirebaseDateNightItem): Promise<boolean> {
  const docId = item.id || `dn-${item.malId}`;
  const docPath = `dateNightQueue/${docId}`;
  try {
    const docRef = doc(db, 'dateNightQueue', docId);
    await setDoc(docRef, {
      id: docId,
      malId: item.malId,
      title: item.title,
      image: item.image || '',
      addedAt: item.addedAt || Date.now(),
      watched: !!item.watched,
      ourRating: item.ourRating !== undefined ? item.ourRating : 5,
      coupleComment: item.coupleComment || ''
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
    return false;
  }
}

/**
 * Remove a Date Night item from Cloud Firestore.
 */
export async function removeDateNightItemFromCloud(idOrMalId: string | number): Promise<boolean> {
  const docId = typeof idOrMalId === 'number' ? `dn-${idOrMalId}` : (idOrMalId.startsWith('dn-') ? idOrMalId : `dn-${idOrMalId}`);
  const docPath = `dateNightQueue/${docId}`;
  try {
    const docRef = doc(db, 'dateNightQueue', docId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
    return false;
  }
}

/**
 * Real-time subscription to Imperial Couple Arcade games state.
 * Syncs Tic-Tac-Toe, Gomoku, Trivia, and Alchemy card flips across both devices.
 */
export function subscribeToArcadeCloud(onUpdate: (arcadeState: any) => void): () => void {
  const path = 'coupleArcade/imperial_state';
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
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

/**
 * Sync Imperial Arcade moves to Cloud Firestore.
 */
export async function syncArcadeToCloud(arcadeState: any): Promise<boolean> {
  const path = 'coupleArcade/imperial_state';
  try {
    const docRef = doc(db, 'coupleArcade', 'imperial_state');
    await setDoc(docRef, {
      ...arcadeState,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
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
  const path = 'coupleArcade/globalSharedSession';
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
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

/**
 * Update the shared globalSharedSession document in Firestore
 */
export async function updateActiveArcadeSession(state: Partial<ArcadeCloudState>): Promise<boolean> {
  const path = 'coupleArcade/globalSharedSession';
  try {
    const docRef = doc(db, 'coupleArcade', 'globalSharedSession');
    await setDoc(docRef, {
      ...state,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Persist Web Push subscription to Firestore for multi-device background delivery
 */
export async function savePushSubscriptionToCloud(
  role: 'chif3n' | 'leslye',
  subscription: any
): Promise<boolean> {
  const docId = `sub_${role}_${btoa(subscription.endpoint || '').slice(-16).replace(/[/+=]/g, '')}`;
  const path = `pushSubscriptions/${docId}`;
  try {
    const docRef = doc(db, 'pushSubscriptions', docId);
    await setDoc(docRef, {
      id: docId,
      role,
      subscription,
      updatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

