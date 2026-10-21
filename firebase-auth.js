
'use strict';

import { initializeApp } from
  'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';

import { getAuth } from
  'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';

import { getFirestore } from
  'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDdIYdhjZqM8mVtMBIIN11ARqeIio5vPVs",
  authDomain: "mft-futbol-eskola.firebaseapp.com",
  projectId: "mft-futbol-eskola",
  storageBucket: "mft-futbol-eskola.firebasestorage.app",
  messagingSenderId: "570245861141",
  appId: "1:570245861141:web:d50312a7b3e3666ced631c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';

import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';

// Firebase bidez saioa hasi
export async function saioaHasi(email, pasahitza) {
  const emaitza = await signInWithEmailAndPassword(
    auth,
    email,
    pasahitza
  );

  // Erabiltzailearen kategoria Firestore-tik irakurri
  const erreferentzia = doc(
    db,
    'erabiltzaileak',
    emaitza.user.uid
  );

  const dokumentua = await getDoc(erreferentzia);

  if (!dokumentua.exists()) {
    await signOut(auth);
    throw new Error('Erabiltzaileak ez du kategoriarik esleituta.');
  }

  const kategoria = dokumentua.data().kategoria;

  if (!['KOORD', 'BEN1', 'BEN2', 'ALE'].includes(kategoria)) {
    await signOut(auth);
    throw new Error('Kategoria ez da baliozkoa.');
  }

  return kategoria;
}

// Saioa amaitu
export async function saioaItxi() {
  await signOut(auth);
}

// Saioaren egoera behatu
export function saioaBehatu(callback) {
  return onAuthStateChanged(auth, callback);
}
