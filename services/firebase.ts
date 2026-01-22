// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_dX5748d3xPWb-eRVJxmllcGrechODPM",
  authDomain: "kingshms-hotel.firebaseapp.com",
  projectId: "kingshms-hotel",
  storageBucket: "kingshms-hotel.firebasestorage.app",
  messagingSenderId: "796908142992",
  appId: "1:796908142992:web:cf6d75fdd4f476acae3315",
  measurementId: "G-PPP4RC300Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
