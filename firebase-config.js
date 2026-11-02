window.firebaseConfig = {
  apiKey: "AIzaSyAuWFS172hf5LKI-Isu9hscDO5vuCuSbgE",
  authDomain: "baddak-store-2026.firebaseapp.com",
  projectId: "baddak-store-2026",
  storageBucket: "baddak-store-2026.firebasestorage.app",
  messagingSenderId: "856819563970",
  appId: "1:856819563970:web:6c12def2b1188ad863aa5b"
};

firebase.initializeApp(window.firebaseConfig);
window.storeDb = firebase.firestore();
window.storeAuth = typeof firebase.auth === 'function' ? firebase.auth() : null;
