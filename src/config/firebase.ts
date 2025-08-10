import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Try to use environment variables, fallback to hardcoded values
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCNipo5NtiH5gjsBjEiKRRbuoYtwMGnN4E",
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jobswipe-odror.firebaseapp.com", 
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jobswipe-odror",
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jobswipe-odror.firebasestorage.app",
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "403992368262",
	appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:403992368262:web:20cd53d4a65296919dad07"
}

// Log for debugging
console.log('Firebase Configuration:', {
	projectId: firebaseConfig.projectId,
	authDomain: firebaseConfig.authDomain,
	hasApiKey: !!firebaseConfig.apiKey,
	fullConfig: firebaseConfig
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)

export default app