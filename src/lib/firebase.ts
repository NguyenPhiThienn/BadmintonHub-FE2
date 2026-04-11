import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA546hAU267gtuA3APRgkFNQES_3Gn2wFY",
  authDomain: "eascompany-5a308.firebaseapp.com",
  projectId: "eascompany-5a308",
  storageBucket: "eascompany-5a308.firebasestorage.app",
  messagingSenderId: "1017392990528",
  appId: "1:1017392990528:web:aa3b6f2003d654a51012a5",
  measurementId: "G-BB6E0BTES5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'vi';
