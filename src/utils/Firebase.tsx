
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-analytics.js";

// Initialize Firebase
const firebaseConfig = {
  // YOUR FIREBASE CONFIG HERE
  apiKey: "AIzaSyC9R6WFGNGD46li-w88MaXxIWOaHiMJXZM",
  authDomain: "webrtc-videochat-6cb1d.firebaseapp.com",
  projectId: "webrtc-videochat-6cb1d",
  storageBucket: "webrtc-videochat-6cb1d.appspot.com",
  messagingSenderId: "902531367441",
  appId: "1:902531367441:web:b908ffe6e0f9cfad01e7b0",
  measurementId: "G-5ZQ2FKP0W7"
};

if ( !firebase.apps.length ) {
  firebase.initializeApp( firebaseConfig );
}
export const firestore = firebase.firestore();
