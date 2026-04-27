// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3-uerX5Q8zQ0USgPdrhTFqXNYjcxfOQY",
  authDomain: "cursor-trial-project.firebaseapp.com",
  projectId: "cursor-trial-project",
  storageBucket: "cursor-trial-project.firebasestorage.app",
  messagingSenderId: "202757074241",
  appId: "1:202757074241:web:3e092d1caff320266145c0",
  measurementId: "G-H7HYX874D4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// Setup the Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add the Calendar Scope
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');