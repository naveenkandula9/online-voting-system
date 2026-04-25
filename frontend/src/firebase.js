// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDm4mJONtrWwUwtMfvp7lXfwn_v8x1cHro",
  authDomain: "online-voting-system-a4e46.firebaseapp.com",
  projectId: "online-voting-system-a4e46",
  storageBucket: "online-voting-system-a4e46.firebasestorage.app",
  messagingSenderId: "772964939864",
  appId: "1:772964939864:web:999b5480a4c6b06662f22d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
