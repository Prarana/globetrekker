import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyD7lN0p2tcJdt1GUNOnfgkuVq2QOYt86wo",
  authDomain: "globetrekker-prarana.firebaseapp.com",
  projectId: "globetrekker-prarana",
  storageBucket: "globetrekker-prarana.firebasestorage.app",
  messagingSenderId: "720462364136",
  appId: "1:720462364136:web:8cb0a86380c7d76c49385d",
  measurementId: "G-D19C1QJVRW"
  };
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
