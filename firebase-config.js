// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCG4hFaDegneYjJ8_jvAVAEJIu9NwzxVsw",
  authDomain: "book-thingy-app.firebaseapp.com",
  projectId: "book-thingy-app",
  storageBucket: "book-thingy-app.firebasestorage.app",
  messagingSenderId: "284502577988",
  appId: "1:284502577988:web:5c50de859e0870a09efd11",
  measurementId: "G-TZ2VTER0YV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);