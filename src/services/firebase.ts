import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-zBR8EWgHvvA8KdOC-A9qeM9Oz1XaOIg",
  authDomain: "login-firebase-70e2c.firebaseapp.com",
  databaseURL: "https://login-firebase-70e2c-default-rtdb.firebaseio.com",
  projectId: "login-firebase-70e2c",
  storageBucket: "login-firebase-70e2c.firebasestorage.app",
  messagingSenderId: "190606723992",
  appId: "1:190606723992:web:8ed92e68cf87f54d51f9ed",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export {
  ref,
  push,
  set,
  get,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  update,
  remove,
};
