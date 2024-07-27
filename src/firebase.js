import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClp5f8RzVlIg-CAlnOxyYXZ7SV5hfoLAQ",
  authDomain: "mybank-85ffe.firebaseapp.com",
  projectId: "mybank-85ffe",
  storageBucket: "mybank-85ffe.appspot.com",
  messagingSenderId: "260648539534",
  appId: "1:260648539534:web:b2bebb3ea12a3fb88c40df",
  measurementId: "G-DRZ3PQX767"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configure session persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error configuring session persistence:', error);
  });

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  doc,
  setDoc,
  getDoc
};
