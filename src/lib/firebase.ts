import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAkl9fz6_7RJD0D0MAAFkTYJxDWTsBl-B0",
  authDomain: "proyecto-manhatan-2af0e.firebaseapp.com",
  projectId: "proyecto-manhatan-2af0e",
  storageBucket: "proyecto-manhatan-2af0e.firebasestorage.app",
  messagingSenderId: "4331820483",
  appId: "1:4331820483:web:34116a8f00a4ba1df89976",
  measurementId: "G-4WWMKD11MH",
  databaseURL: "https://proyecto-manhatan-2af0e-default-rtdb.firebaseio.com",
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const rtdb = getDatabase(app);
