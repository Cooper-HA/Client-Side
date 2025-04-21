// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, update, remove, get } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCK58aeUtjlLq919pxe2wTZnhJqjEO_7kk",
  authDomain: "quizdb-ad0a2.firebaseapp.com",
  databaseURL: "https://quizdb-ad0a2-default-rtdb.firebaseio.com",
  projectId: "quizdb-ad0a2",
  storageBucket: "quizdb-ad0a2.firebasestorage.app",
  messagingSenderId: "595917417664",
  appId: "1:595917417664:web:f284273d498e384cdf5125",
  measurementId: "G-YC37Q9XL2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, push, update, remove, get };
