import { getDatabase, ref, onValue, off } from "firebase/database";

interface ListenToHistoryParams {
  idUser: string;
  idRequest: string;
  onUpdate?: (data: any) => void;
}

// Set to track currently listening paths
const activeListeners = new Set<string>();

export function listenToHistory({
  idUser,
  idRequest,
  onUpdate,
}: ListenToHistoryParams) {
  const path = `${idUser}/${idRequest}`;
  
  // If already listening, do nothing
  if (activeListeners.has(path)) {
    console.log("Already listening to history at:", path);
    return;
  }

  const db = getDatabase();
  const historyDataRef = ref(db, path);
  console.log("Listening to history at:", path);
  
  // Register to the Set before adding the listener
  activeListeners.add(path);
  
  onValue(historyDataRef, (snapshot) => {
    const data = snapshot.val();
    onUpdate?.(data);
  });
}

export function unListenToHistory({
  idUser,
  idRequest,
}: {
  idUser: string;
  idRequest: string;
}) {
  const path = `${idUser}/${idRequest}`;
  console.log("Unlistening to history at:", path);
  
  const db = getDatabase();
  const historyDataRef = ref(db, path);
  off(historyDataRef);
  
  // Also remove from the Set
  activeListeners.delete(path);
}

// Function to check if a specific path is currently being listened to
export function isListeningToHistory({
  idUser,
  idRequest,
}: {
  idUser: string;
  idRequest: string;
}): boolean {
  const path = `${idUser}/${idRequest}`;
  return activeListeners.has(path);
}
