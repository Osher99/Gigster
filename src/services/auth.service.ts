import { 
	sendSignInLinkToEmail,
	isSignInWithEmailLink,
	signInWithEmailLink,
	signOut,
	onAuthStateChanged,
	User,
	updateProfile
} from 'firebase/auth'
import { 
	doc, 
	setDoc, 
	getDoc, 
	updateDoc, 
	serverTimestamp,
	collection,
	addDoc,
	query,
	where,
	orderBy,
	limit,
	getDocs
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import type { FirebaseUserProfile } from '../types/firebase'

export class AuthService {
	// Email OTP Authentication
	static async sendOTPToEmail(email: string): Promise<void> {
		try {
			// Check if user recently requested OTP (rate limiting)
			const otpRef = collection(db, 'otpRequests')
			const recentQuery = query(
				otpRef,
				where('email', '==', email),
				where('timestamp', '>', new Date(Date.now() - 60000)), // Last minute
				orderBy('timestamp', 'desc'),
				limit(1)
			)
			
			const recentDocs = await getDocs(recentQuery)
			if (!recentDocs.empty) {
				throw new Error('OTP was recently sent. Please try again in a minute.')
			}

			const actionCodeSettings = {
				url: window.location.origin + '/auth/verify',
				handleCodeInApp: true,
			}

			await sendSignInLinkToEmail(auth, email, actionCodeSettings)
			
			// Store OTP request
			await addDoc(otpRef, {
				email,
				timestamp: serverTimestamp(),
				attempts: 1,
				used: false,
				expiresAt: new Date(Date.now() + 15 * 60000) // 15 minutes
			} as any)

			// Store email in localStorage for the verification
			window.localStorage.setItem('emailForSignIn', email)
			
		} catch (error: any) {
			console.error('Error sending OTP:', error)
			throw new Error(error.message || 'Error sending verification code')
		}
	}

	// Verify OTP and sign in
	static async verifyOTPAndSignIn(email?: string): Promise<User> {
		try {
			const currentUrl = window.location.href
			const emailToVerify = email || window.localStorage.getItem('emailForSignIn')
			
			if (!emailToVerify) {
				throw new Error('Email address not found')
			}

			if (!isSignInWithEmailLink(auth, currentUrl)) {
				throw new Error('Invalid verification link')
			}

			const result = await signInWithEmailLink(auth, emailToVerify, currentUrl)
			
			// Clear the email from storage
			window.localStorage.removeItem('emailForSignIn')
			
			// Mark OTP as used
			const otpRef = collection(db, 'otpRequests')
			const usedQuery = query(
				otpRef,
				where('email', '==', emailToVerify),
				where('used', '==', false),
				orderBy('timestamp', 'desc'),
				limit(1)
			)
			
			const usedDocs = await getDocs(usedQuery)
			if (!usedDocs.empty && usedDocs.docs[0]) {
				await updateDoc(usedDocs.docs[0].ref, { used: true })
			}

			return result.user
		} catch (error: any) {
			console.error('Error verifying OTP:', error)
			throw new Error(error.message || 'Error verifying code')
		}
	}

	// Create or update user profile
	static async createOrUpdateUserProfile(
		user: User, 
		profileData: Partial<FirebaseUserProfile>
	): Promise<FirebaseUserProfile> {
		try {
			const userRef = doc(db, 'users', user.uid)
			const userDoc = await getDoc(userRef)

			const baseProfile: Partial<FirebaseUserProfile> = {
				uid: user.uid,
				email: user.email || '',
				updatedAt: serverTimestamp() as any
			}

			if (userDoc.exists()) {
				// Update existing profile
				const updateData = { ...baseProfile, ...profileData }
				await updateDoc(userRef, updateData)
				
				const updatedDoc = await getDoc(userRef)
				return updatedDoc.data() as FirebaseUserProfile
			} else {
				// Create new profile
				const newProfile: Partial<FirebaseUserProfile> = {
					...baseProfile,
					...profileData,
					isComplete: false,
					createdAt: serverTimestamp() as any
				}

				await setDoc(userRef, newProfile)
				return newProfile as FirebaseUserProfile
			}
		} catch (error: any) {
			console.error('Error creating/updating profile:', error)
			throw new Error('Error updating user profile')
		}
	}

	// Get user profile
	static async getUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
		try {
			const userRef = doc(db, 'users', uid)
			const userDoc = await getDoc(userRef)
			
			if (userDoc.exists()) {
				return userDoc.data() as FirebaseUserProfile
			}
			return null
		} catch (error: any) {
			console.error('Error getting user profile:', error)
			throw new Error('Error loading user profile')
		}
	}

	// Sign out
	static async signOut(): Promise<void> {
		try {
			await signOut(auth)
		} catch (error: any) {
			console.error('Error signing out:', error)
			throw new Error('Error signing out')
		}
	}

	// Auth state listener
	static onAuthStateChanged(callback: (user: User | null) => void) {
		return onAuthStateChanged(auth, callback)
	}

	// Update user display name and photo
	static async updateUserDisplayInfo(
		user: User, 
		displayName?: string, 
		photoURL?: string
	): Promise<void> {
		try {
			await updateProfile(user, {
				displayName: displayName || user.displayName,
				photoURL: photoURL || user.photoURL
			})
		} catch (error: any) {
			console.error('Error updating display info:', error)
			throw new Error('Error updating display info')
		}
	}
}