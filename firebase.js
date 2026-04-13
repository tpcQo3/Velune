
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNkFretT8Y6dHzNsfsA_O3eQuaBugXQPU",
  authDomain: "veluneink-be596.firebaseapp.com",
  projectId: "veluneink-be596",
  storageBucket: "veluneink-be596.firebasestorage.app",
  messagingSenderId: "940814623866",
  appId: "1:940814623866:web:77109c8cacbb4c10e807c3",
  measurementId: "G-6341F3F17T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveLetter(content) {
  const docRef = await addDoc(collection(db, "letters"), {
    text: content,
    createdAt: new Date()
  });

  return docRef.id;
}

export async function getLetter(id) {
  const docSnap = await getDoc(doc(db, "letters", id));

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}