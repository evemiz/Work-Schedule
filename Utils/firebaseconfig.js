import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE,
  messagingSenderId: import.meta.env.VITE_MESSAGING,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const usersCollection = collection(db, 'users');
export const employeesCollection = collection(db, 'employees');
export const scheduleCollection = collection(db, 'schedule');
export const savedScheduleCollection = collection(db, 'savedSchedule');
export const adminsCollection = collection(db, 'admins');

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
