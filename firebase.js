// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWz1PK77F0lcT2BLGR8eFBevkD1v0kkdk",
  authDomain: "inventory-app-39322.firebaseapp.com",
  projectId: "inventory-app-39322",
  storageBucket: "inventory-app-39322.appspot.com",
  messagingSenderId: "79482899872",
  appId: "1:79482899872:web:22cd53017c9ab405a068c5",
  measurementId: "G-6W30H2BFGZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };
