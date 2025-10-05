import { getDatabase, ref, onValue, off } from "firebase/database";

interface ListenToHistoryParams {
  idUser: string;
  idRequest: string;
  onUpdate?: (data: any) => void;
}

export function listenToHistory({
  idUser,
  idRequest,
  onUpdate,
}: ListenToHistoryParams) {
  const db = getDatabase();
  const historyDataRef = ref(db, `${idUser}/${idRequest}`);
  console.log("Listening to history at:", `${idUser}/${idRequest}`);
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
  console.log("Unlistening to history at:", `${idUser}/${idRequest}`);
  const db = getDatabase();
  const historyDataRef = ref(db, `${idUser}/${idRequest}`);
  off(historyDataRef);
}
