import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if we have an API key
// Initialize Firebase only if we have a valid-looking API key
const rawKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const isValidKey = rawKey && rawKey !== "undefined" && rawKey !== "null" && rawKey.length > 5;

console.log("[Firebase] API Key Debug:", {
    exists: !!rawKey,
    length: rawKey?.length || 0,
    isValid: isValidKey,
    valueHead: rawKey ? rawKey.substring(0, 5) + "..." : "none"
});

let app;
if (isValidKey) {
    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        console.log("[Firebase] App initialized successfully");
    } catch (e) {
        console.error("[Firebase] Initialization failed:", e);
    }
} else {
    console.log("[Firebase] Skipping initialization - API Key is missing or invalid placeholder");
}

const auth = app ? getAuth(app) : null as any;
const db = app ? getFirestore(app) : null as any;

if (!firebaseConfig.apiKey && typeof window !== "undefined") {
    console.warn("Firebase API key is missing. Authentication and Firestore will not work.");
}

export { auth, db };
