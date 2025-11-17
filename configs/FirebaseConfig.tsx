// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDRVcZ1D0Kpj8wzX3kihzmc6oRKSaT019o',
  authDomain: 'frgians.firebaseapp.com',
  projectId: 'frgians',
  storageBucket: 'frgians.firebasestorage.app',
  messagingSenderId: '556000508893',
  appId: '1:556000508893:web:770e3ecf068b7e9c9b9434',
  measurementId: 'G-MMWPCQZR4N',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// const analytics = getAnalytics(app);

// Administrators of the FRGians application
export const orginAdmins = [
  'mahmoud.gamal@frg-eg.com',
  'tamer.rashed@frg-eg.com',
  'marwan.mostafa@frg-eg.com',
];
