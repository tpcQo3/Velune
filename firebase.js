import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================
// CONFIG
// ======================
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

// ======================
// GENERATE ID (6 CHAR)
// ======================
function generateId(length = 6) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // tránh nhầm

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

// ======================
// CREATE LETTER (SAFE)
// ======================
export async function saveLetter(data) {
  let id;
  let exists = true;

  while (exists) {
    id = generateId();

    const docRef = doc(db, "letters", id);
    const snap = await getDoc(docRef);

    exists = snap.exists();
  }

  await setDoc(doc(db, "letters", id), {
    ...data,
    createdAt: new Date()
  });

  return id;
}

// ======================
// GET LETTER
// ======================
export async function getLetter(id) {
  const docSnap = await getDoc(doc(db, "letters", id));

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}