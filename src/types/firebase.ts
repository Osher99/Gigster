import { User } from 'firebase/auth'
import { DocumentData } from 'firebase/firestore'

export interface FirebaseUser extends User {
	uid: string
	email: string | null
	displayName: string | null
	photoURL: string | null
}

export interface FirebaseUserProfile extends DocumentData {
	uid: string
	email: string
	displayName?: string
	photoURL?: string
	isResumeComplete?: boolean
	skills?: string[]
	experience?: string
	preferredLocation?: string
	salaryExpectation?: string
	resumeUrl?: string
	createdAt?: Date
	updatedAt?: Date
}

export interface FirebaseJobDocument extends DocumentData {
	id: string
	title: string
	company: string
	companyLogo?: string
	location: string
	salary: string
	description: string
	tags: string[]
	image: string
	workLocation?: 'remote' | 'hybrid' | 'office'
	compellingHighlight?: string
	commuteEstimate?: string
	datePosted?: string
	experienceLevel?: string
	jobType?: 'full-time' | 'part-time' | 'contract' | 'internship'
	benefits?: string[]
	requirements?: string[]
	aboutCompany?: string
	isResumeRequired?: boolean
	sourceUrl?: string
	applicationUrl?: string
	createdAt?: Date
	updatedAt?: Date
}

export interface FirebaseSwipeRecord extends DocumentData {
	userId: string
	jobId: string
	decision: 'interested' | 'not-interested'
	timestamp: Date
}

export interface FirebaseApplication extends DocumentData {
	userId: string
	jobId: string
	status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'offer'
	appliedAt: Date
	userData?: any
}

export interface FirebaseJobApplication extends DocumentData {
	id: string
	userId: string
	jobId: string
	status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'offer'
	appliedAt: Date
	userData?: any
}

export interface JobInteraction extends DocumentData {
	userId: string
	jobId: string
	type: 'view' | 'swipe_left' | 'swipe_right' | 'apply'
	timestamp: Date
}

export interface UserSession extends DocumentData {
	userId: string
	sessionId: string
	startTime: Date
	endTime?: Date
	jobsViewed: string[]
	jobsApplied: string[]
}

export interface UserAnalytics extends DocumentData {
	userId: string
	totalJobsViewed: number
	totalApplications: number
	preferredCategories: string[]
	averageSessionTime: number
	lastActivity: Date
}