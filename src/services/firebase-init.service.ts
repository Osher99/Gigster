import { 
	collection, 
	doc, 
	setDoc, 
	getDoc,
	serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { mockJobs } from '../data/mock-jobs'
import type { Job } from '../types/job'

interface FirebaseJob extends Job {
	createdAt?: any
	updatedAt?: any
	active: boolean
}

export class FirebaseInitService {
	private static readonly INIT_FLAG_DOC = 'system/initialization'
	
	// Check if Firebase has been initialized with jobs
	static async isInitialized(): Promise<boolean> {
		try {
			const initDoc = await getDoc(doc(db, this.INIT_FLAG_DOC))
			return initDoc.exists() && initDoc.data()?.jobsUploaded === true
		} catch (error: any) {
			// If permission denied, assume not initialized
			if (error.code === 'permission-denied') {
				console.log('Permission denied - assuming not initialized')
				return false
			}
			console.error('Error checking initialization:', error)
			return false
		}
	}

	// Upload all mock jobs to Firebase
	static async uploadMockJobs(): Promise<void> {
		try {
			console.log('Starting job upload to Firebase...')
			
			// Check if already initialized
			const initialized = await this.isInitialized()
			if (initialized) {
				console.log('Jobs already uploaded to Firebase')
				return
			}

			// Upload each job
			const jobsRef = collection(db, 'jobs')
			let uploadedCount = 0

			for (const job of mockJobs) {
				try {
					const firebaseJob: FirebaseJob = {
						...job,
						createdAt: serverTimestamp(),
						updatedAt: serverTimestamp(),
						active: true
					}

					// Use job ID as document ID
					await setDoc(doc(jobsRef, job.id), firebaseJob)
					uploadedCount++
					console.log(`Uploaded job ${uploadedCount}/${mockJobs.length}: ${job.title}`)
				} catch (error) {
					console.error(`Error uploading job ${job.id}:`, error)
				}
			}

			// Mark as initialized
			await setDoc(doc(db, this.INIT_FLAG_DOC), {
				jobsUploaded: true,
				uploadedAt: serverTimestamp(),
				totalJobs: uploadedCount,
				version: '1.0.0'
			})

			console.log(`Successfully uploaded ${uploadedCount} jobs to Firebase!`)
		} catch (error) {
			console.error('Error uploading jobs to Firebase:', error)
			throw error
		}
	}

	// Initialize Firebase with all required data
	static async initialize(): Promise<void> {
		try {
			console.log('Initializing Firebase...')
			console.log('Database object:', db)
			console.log('Project ID from config:', db.app.options.projectId)
			
			// Upload jobs if not already done
			await this.uploadMockJobs()
			
			// Add any other initialization tasks here
			// e.g., create indexes, default settings, etc.
			
			console.log('Firebase initialization complete!')
		} catch (error) {
			console.error('Firebase initialization failed:', error)
			console.error('Error details:', error)
			throw error
		}
	}

	// Get all jobs from Firebase
	static async getFirebaseJobs(): Promise<Job[]> {
		try {
			console.log('🔍 Attempting to fetch jobs from Firebase...')
			const jobsRef = collection(db, 'jobs')
			const { getDocs, query, where } = await import('firebase/firestore')
			const q = query(jobsRef, where('active', '==', true))
			
			console.log('📡 Querying Firestore for active jobs...')
			const snapshot = await getDocs(q)
			console.log('📊 Firestore query result:', {
				empty: snapshot.empty,
				size: snapshot.size,
				docs: snapshot.docs.length
			})
			
			const jobs: Job[] = []
			snapshot.forEach((doc) => {
				const data = doc.data()
				console.log('📄 Job document:', doc.id, data)
				
				// Convert Timestamp fields to serializable values
				const jobData = {
					id: doc.id,
					...data
				}
				
				// Convert createdAt and updatedAt Timestamps to ISO strings
				if (data.createdAt && data.createdAt.toDate) {
					jobData.createdAt = data.createdAt.toDate().toISOString()
				}
				if (data.updatedAt && data.updatedAt.toDate) {
					jobData.updatedAt = data.updatedAt.toDate().toISOString()
				}
				
				jobs.push(jobData as Job)
			})

			console.log('✅ Successfully fetched', jobs.length, 'jobs from Firebase')
			console.log('🎯 JOBS SOURCE: FIREBASE (NOT MOCK!)')
			console.log('📋 Sample job titles from Firebase:', jobs.slice(0, 3).map(j => j.title))
			return jobs
		} catch (error) {
			console.error('❌ Error fetching jobs from Firebase:', error)
			console.error('🔄 Falling back to mock data')
			console.warn('⚠️ JOBS SOURCE: MOCK DATA (FALLBACK!)')
			// Fallback to mock data
			return mockJobs
		}
	}

	// Clean up Firebase (for development)
	static async cleanUp(): Promise<void> {
		try {
			console.log('Cleaning up Firebase...')
			
			// Delete initialization flag
			await setDoc(doc(db, this.INIT_FLAG_DOC), {
				jobsUploaded: false,
				cleanedAt: serverTimestamp()
			})
			
			console.log('Cleanup complete. Run initialize() to re-upload jobs.')
		} catch (error) {
			console.error('Error during cleanup:', error)
		}
	}
}