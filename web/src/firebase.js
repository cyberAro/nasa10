import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBl9RsADsggBqNZPdGXWNEsebh_xNH6_nY",
  authDomain: "nasa10.firebaseapp.com",
  projectId: "nasa10",
  storageBucket: "nasa10.firebasestorage.app",
  messagingSenderId: "258935693785",
  appId: "1:258935693785:web:1cd91df929423666fe79c8",
  measurementId: "G-NYRC4R2SF7"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
