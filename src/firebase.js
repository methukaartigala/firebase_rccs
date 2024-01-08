// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBEYMWU07GFB2dzXOYcEmWKsQfD7thuG9w",
  authDomain: "members-21d24.firebaseapp.com",
  projectId: "members-21d24",
  storageBucket: "members-21d24.appspot.com",
  messagingSenderId: "148287497881",
  appId: "1:148287497881:web:ccd172fdf23d8c4ca3ba08",
  measurementId: "G-PTZYES380S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);