// src/firebase.js

import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBfU5o0rgjIXHnneG1-VdGT9iE-Kmcegfg",
  authDomain: "dealx-5f4fb.firebaseapp.com",
  databaseURL: "https://dealx-5f4fb-default-rtdb.firebaseio.com",
  projectId: "dealx-5f4fb",
  storageBucket: "dealx-5f4fb.appspot.com",
  messagingSenderId: "47578681635",
  appId: "1:47578681635:web:a302c00e5ed0d74d79fc96",
  measurementId: "G-9XWJ8YSVGZ",
};

// Singleton: Only initialize once!
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const database = getDatabase(app);

export { database };
