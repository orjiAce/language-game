// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmacT6houMqQNL4RATUQQOqpeUT3wvDSw",
    authDomain: "language-game-c9748.firebaseapp.com",
    projectId: "language-game-c9748",
    storageBucket: "language-game-c9748.appspot.com",
    messagingSenderId: "333889899337",
    appId: "1:333889899337:web:cfe72e8302e11a5a3ba898"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
