import React, { useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { AuthService } from '../../services/auth.service'
import { FirebaseInitService } from '../../services/firebase-init.service'
import { useAppDispatch } from '../../hooks/redux-hooks'
import { setFirebaseProfile, setAuthenticated, setLoading } from '../../store/user-slice'

interface AuthProviderProps {
	children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch()
	const [initializing, setInitializing] = useState(true)

	useEffect(() => {
		// Initialize Firebase on first load
		const initializeApp = async () => {
			try {
				await FirebaseInitService.initialize()
			} catch (error) {
				console.error('Error initializing Firebase:', error)
			}
		}

		initializeApp()

		const unsubscribe = AuthService.onAuthStateChanged(async (user: User | null) => {
			try {
				dispatch(setLoading(true))
				
				if (user) {
					// User is signed in
					const profile = await AuthService.getUserProfile(user.uid)
					if (profile) {
						dispatch(setFirebaseProfile(profile))
					}
					dispatch(setAuthenticated(true))
				} else {
					// User is signed out
					dispatch(setAuthenticated(false))
				}
			} catch (error) {
				console.error('Error in auth state change:', error)
				dispatch(setAuthenticated(false))
			} finally {
				dispatch(setLoading(false))
				if (initializing) {
					setInitializing(false)
				}
			}
		})

		// Check if user is returning from email link
		const handleEmailLink = async () => {
			const url = window.location.href
			if (url.includes('auth/verify')) {
				try {
					dispatch(setLoading(true))
					await AuthService.verifyOTPAndSignIn()
				} catch (error) {
					console.error('Error handling email link:', error)
				} finally {
					dispatch(setLoading(false))
				}
			}
		}

		handleEmailLink()

		// Cleanup subscription on unmount
		return () => unsubscribe()
	}, [dispatch, initializing])

	if (initializing) {
		return (
			<div className="fixed inset-0 bg-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	return <>{children}</>
}

export default AuthProvider