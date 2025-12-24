
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Masukkan konfigurasi Firebase Anda di sini.
// Salin dari Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  // GANTI BAGIAN INI DENGAN CONFIG DARI FIREBASE CONSOLE ANDA
  apiKey: "AIzaSyAlIl0X3ZhsqlEmtdWnVZPxV8cB0qAMLUA)",
  authDomain: "supervisi-smpn3.firebaseapp.com",
  projectId: "supervisi-smpn3",
  storageBucket: "supervisi-smpn3.firebasestorage.app",
  messagingSenderId: "1:517743643750:web:78b81ab5acc9454ee231a7",
  appId: "..."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
