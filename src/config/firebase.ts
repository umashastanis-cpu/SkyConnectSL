import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOj9SFVND1l7iB-RbSe1VUnm4rypdcZDY",
  authDomain: "skyconnectsl-13e92.firebaseapp.com",
  projectId: "skyconnectsl-13e92",
  storageBucket: "skyconnectsl-13e92.firebasestorage.app",
  messagingSenderId: "1013873420532",
  appId: "1:1013873420532:web:89973b4e1ac0f1b94c56a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth (Firebase v9+ handles React Native persistence automatically with AsyncStorage)
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
