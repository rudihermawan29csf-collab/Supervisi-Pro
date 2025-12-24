
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Service untuk menyimpan dan memuat data dari Firebase Firestore.
 * Data disimpan dalam satu dokumen 'main' di dalam koleksi 'appData'.
 * Ini meniru struktur 'monolith' yang sebelumnya digunakan pada Spreadsheet.
 */

// Nama koleksi dan ID dokumen di Firestore
const COLLECTION_NAME = "supervisi_data";
const DOC_ID = "sekolah_data";

export const syncDataToCloud = async (allData: any) => {
  try {
    // Menyimpan data ke Firestore (akan menimpa data lama dengan data baru)
    await setDoc(doc(db, COLLECTION_NAME, DOC_ID), allData);
    console.log("Data successfully synced to Firebase!");
    return true;
  } catch (error) {
    console.error("Firebase Sync Error (Save):", error);
    return false;
  }
};

export const fetchDataFromCloud = async () => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Data fetched from Firebase!");
      return docSnap.data();
    } else {
      // Doc.data() will be undefined in this case
      console.warn("No such document in Firebase!");
      return null;
    }
  } catch (error) {
    console.error("Firebase Fetch Error (Load):", error);
    return null;
  }
};
