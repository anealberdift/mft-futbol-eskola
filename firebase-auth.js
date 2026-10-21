
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
