import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-fake-key", // I'll need to read the real one from firebaseConfig.js
  projectId: "jobgenie-gen",
};

// ... actually I should just read the real config from the file
