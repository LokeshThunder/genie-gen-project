import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCYU7VGZBPd5LR74_ppiyrsTW_yxviXfPw",
  authDomain: "job-genie-5e3ea.firebaseapp.com",
  projectId: "job-genie-5e3ea",
  storageBucket: "job-genie-5e3ea.firebasestorage.app",
  messagingSenderId: "572324646585",
  appId: "1:572324646585:web:5cba8907468e84ba529568",
  measurementId: "G-0Q4TV3SPVN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
