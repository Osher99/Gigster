export interface ExistingUser {
	email: string
	firstName: string
	lastName: string
	resumeUrl?: string
	lastLogin: string
}

export class UserDetectionService {
	private static readonly USERS_KEY = 'gigster_users'
	private static readonly CURRENT_USER_KEY = 'gigster_current_user'
	private static readonly OTP_KEY = 'gigster_otp'

	/**
	 * Check if user exists in localStorage
	 */
	static checkExistingUser(email: string): ExistingUser | null {
		try {
			const users = this.getStoredUsers()
			return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null
		} catch (error) {
			console.error('Error checking existing user:', error)
			return null
		}
	}

	/**
	 * Get all stored users
	 */
	private static getStoredUsers(): ExistingUser[] {
		try {
			const stored = localStorage.getItem(this.USERS_KEY)
			return stored ? JSON.parse(stored) : []
		} catch (error) {
			console.error('Error getting stored users:', error)
			return []
		}
	}

	/**
	 * Save user to localStorage
	 */
	static saveUser(userData: Omit<ExistingUser, 'lastLogin'>): void {
		try {
			const users = this.getStoredUsers()
			const existingIndex = users.findIndex(
				user => user.email.toLowerCase() === userData.email.toLowerCase()
			)

			const userWithLogin = {
				...userData,
				lastLogin: new Date().toISOString()
			}

			if (existingIndex >= 0) {
				users[existingIndex] = userWithLogin
			} else {
				users.push(userWithLogin)
			}

			localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
		} catch (error) {
			console.error('Error saving user:', error)
		}
	}

	/**
	 * Set current logged-in user
	 */
	static setCurrentUser(user: ExistingUser): void {
		try {
			localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
		} catch (error) {
			console.error('Error setting current user:', error)
		}
	}

	/**
	 * Get current logged-in user
	 */
	static getCurrentUser(): ExistingUser | null {
		try {
			const stored = localStorage.getItem(this.CURRENT_USER_KEY)
			return stored ? JSON.parse(stored) : null
		} catch (error) {
			console.error('Error getting current user:', error)
			return null
		}
	}

	/**
	 * Clear current user session
	 */
	static clearCurrentUser(): void {
		try {
			localStorage.removeItem(this.CURRENT_USER_KEY)
		} catch (error) {
			console.error('Error clearing current user:', error)
		}
	}

	/**
	 * Check if user is currently logged in
	 */
	static isUserLoggedIn(): boolean {
		return this.getCurrentUser() !== null
	}

	/**
	 * Generate random OTP code
	 */
	static generateOTP(): string {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	/**
	 * Store OTP temporarily (in real app, this would be server-side)
	 */
	static storeOTP(email: string, otp: string): void {
		try {
			const otpData = {
				email,
				otp,
				timestamp: Date.now(),
				expires: Date.now() + (5 * 60 * 1000) // 5 minutes
			}
			localStorage.setItem(`otp_${email}`, JSON.stringify(otpData))
		} catch (error) {
			console.error('Error storing OTP:', error)
		}
	}

	/**
	 * Verify OTP code
	 */
	static verifyOTP(email: string, inputOTP: string): boolean {
		try {
			const stored = localStorage.getItem(`otp_${email}`)
			if (!stored) return false

			const otpData = JSON.parse(stored)
			
			// Check if OTP expired
			if (Date.now() > otpData.expires) {
				localStorage.removeItem(`otp_${email}`)
				return false
			}

			// Verify OTP
			if (otpData.otp === inputOTP) {
				localStorage.removeItem(`otp_${email}`)
				return true
			}

			return false
		} catch (error) {
			console.error('Error verifying OTP:', error)
			return false
		}
	}

	/**
	 * Simulate sending OTP to email
	 */
	static async sendOTP(email: string): Promise<string> {
		const otp = this.generateOTP()
		this.storeOTP(email, otp)
		
		// In real app, send email here
		console.log(`📧 OTP sent to ${email}: ${otp}`)
		
		return otp // For demo purposes, return the OTP
	}

	/**
	 * Clear all user data from localStorage
	 */
	static clearAllData(): void {
		try {
			localStorage.removeItem(this.USERS_KEY)
			localStorage.removeItem(this.CURRENT_USER_KEY)
			localStorage.removeItem(this.OTP_KEY)
		} catch (error) {
			console.error('Error clearing localStorage:', error)
		}
	}
}