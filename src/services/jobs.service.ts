import { 
	collection, 
	addDoc, 
	updateDoc, 
	doc, 
	getDocs, 
	query, 
	where, 
	orderBy, 
	limit,
	serverTimestamp,
	getDoc,
	setDoc
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { 
	FirebaseJobApplication, 
	JobInteraction, 
	UserSession,
	UserAnalytics 
} from '../types/firebase'
import type { Job } from '../types/job'

export class JobsService {
	// Submit job application
	static async submitApplication(
		userId: string,
		job: Job,
		userData: {
			firstName: string
			lastName: string
			email: string
			phoneNumber?: string
			resumeUrl?: string
		}
	): Promise<string> {
		try {
			const applicationData: Partial<FirebaseJobApplication> = {
				userId,
				jobId: job.id,
				status: 'pending',
				appliedAt: serverTimestamp() as any,
				userData,
				jobData: {
					title: job.title,
					company: job.company,
					location: job.location,
					salary: job.salary
				},
				updatedAt: serverTimestamp() as any
			}

			const docRef = await addDoc(collection(db, 'applications'), applicationData)
			
			// Record the interaction
			await this.recordJobInteraction(userId, job.id, 'apply')
			
			// Update user analytics
			await this.updateUserAnalytics(userId, 'application')

			return docRef.id
		} catch (error: any) {
			console.error('Error submitting application:', error)
			throw new Error('Error submitting job application')
		}
	}

	// Record job interaction (like, dislike, view)
	static async recordJobInteraction(
		userId: string,
		jobId: string,
		action: 'like' | 'dislike' | 'view' | 'apply',
		sessionId?: string
	): Promise<void> {
		try {
					const interactionData: Partial<JobInteraction> = {
			userId,
			jobId,
			action,
			timestamp: serverTimestamp() as any,
			...(sessionId && { sessionId })
		}

			await addDoc(collection(db, 'interactions'), interactionData)
			
			// Update user analytics
			await this.updateUserAnalytics(userId, 'interaction')
		} catch (error: any) {
			console.error('Error recording interaction:', error)
			// Don't throw here to avoid breaking user experience
		}
	}

	// Get user applications
	static async getUserApplications(userId: string): Promise<FirebaseJobApplication[]> {
		try {
			const q = query(
				collection(db, 'applications'),
				where('userId', '==', userId),
				orderBy('appliedAt', 'desc')
			)
			
			const querySnapshot = await getDocs(q)
			return querySnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			})) as FirebaseJobApplication[]
		} catch (error: any) {
			console.error('Error getting applications:', error)
			throw new Error('Error loading job applications')
		}
	}

	// Get user interactions
	static async getUserInteractions(
		userId: string, 
		actionType?: 'like' | 'dislike' | 'view' | 'apply'
	): Promise<JobInteraction[]> {
		try {
			let q = query(
				collection(db, 'interactions'),
				where('userId', '==', userId),
				orderBy('timestamp', 'desc'),
				limit(100)
			)

			if (actionType) {
				q = query(
					collection(db, 'interactions'),
					where('userId', '==', userId),
					where('action', '==', actionType),
					orderBy('timestamp', 'desc'),
					limit(100)
				)
			}
			
			const querySnapshot = await getDocs(q)
			return querySnapshot.docs.map(doc => ({
				id: doc.id,
				userId: doc.data().userId || '',
				jobId: doc.data().jobId || '',
				type: doc.data().type || 'view',
				timestamp: doc.data().timestamp || new Date(),
				...doc.data()
			})) as JobInteraction[]
		} catch (error: any) {
			console.error('Error getting interactions:', error)
			throw new Error('Error loading interactions')
		}
	}

	// Update application status
	static async updateApplicationStatus(
		applicationId: string,
		status: FirebaseJobApplication['status'],
		notes?: string
	): Promise<void> {
		try {
			const applicationRef = doc(db, 'applications', applicationId)
			const updateData: any = {
				status,
				updatedAt: serverTimestamp()
			}
			
			if (notes) {
				updateData.notes = notes
			}

			await updateDoc(applicationRef, updateData)
		} catch (error: any) {
			console.error('Error updating application status:', error)
			throw new Error('Error updating application status')
		}
	}

	// Start user session
	static async startUserSession(
		userId: string,
		deviceInfo?: any,
		location?: any
	): Promise<string> {
		try {
			const sessionData: Partial<UserSession> = {
				userId,
				deviceInfo,
				location,
				startTime: serverTimestamp() as any,
				interactionsCount: 0,
				applicationsCount: 0
			}

			const docRef = await addDoc(collection(db, 'sessions'), sessionData)
			return docRef.id
		} catch (error: any) {
			console.error('Error starting session:', error)
			return ''
		}
	}

	// End user session
	static async endUserSession(sessionId: string): Promise<void> {
		try {
			if (!sessionId) return
			
			const sessionRef = doc(db, 'sessions', sessionId)
			await updateDoc(sessionRef, {
				endTime: serverTimestamp()
			})
		} catch (error: any) {
			console.error('Error ending session:', error)
		}
	}

	// Update user analytics
	private static async updateUserAnalytics(
		userId: string,
		eventType: 'interaction' | 'application' | 'session'
	): Promise<void> {
		try {
			const analyticsRef = doc(db, 'analytics', userId)
			const analyticsDoc = await getDoc(analyticsRef)

			if (analyticsDoc.exists()) {
				const current = analyticsDoc.data() as UserAnalytics
				const updates: any = {
					lastActiveAt: serverTimestamp()
				}

				switch (eventType) {
					case 'interaction':
						updates.totalInteractions = (current.totalInteractions || 0) + 1
						break
					case 'application':
						updates.totalApplications = (current.totalApplications || 0) + 1
						break
					case 'session':
						updates.totalSessions = (current.totalSessions || 0) + 1
						break
				}

				await updateDoc(analyticsRef, updates)
			} else {
				// Create new analytics document
				const newAnalytics: Partial<UserAnalytics> = {
					userId,
					totalSessions: eventType === 'session' ? 1 : 0,
					totalInteractions: eventType === 'interaction' ? 1 : 0,
					totalApplications: eventType === 'application' ? 1 : 0,
					averageSessionDuration: 0,
					lastActiveAt: serverTimestamp() as any,
					topJobCategories: [],
					conversionRate: 0
				}

				await setDoc(analyticsRef, newAnalytics)
			}
		} catch (error: any) {
			console.error('Error updating analytics:', error)
		}
	}

	// Get job recommendations based on user interactions
	static async getJobRecommendations(userId: string): Promise<string[]> {
		try {
			// Get user's liked jobs
			const likedJobs = await this.getUserInteractions(userId, 'like')
			
			// Simple recommendation based on liked job categories
			// In a real app, this would be more sophisticated
			const jobIds = likedJobs.slice(0, 10).map(interaction => interaction.jobId)
			
			return jobIds
		} catch (error: any) {
			console.error('Error getting recommendations:', error)
			return []
		}
	}

	// Get user analytics
	static async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
		try {
			const analyticsRef = doc(db, 'analytics', userId)
			const analyticsDoc = await getDoc(analyticsRef)
			
			if (analyticsDoc.exists()) {
				return analyticsDoc.data() as UserAnalytics
			}
			return null
		} catch (error: any) {
			console.error('Error getting analytics:', error)
			return null
		}
	}
}