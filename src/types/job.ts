export interface Job {
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
	postedAt?: string | Date // Alternative property name
	experienceLevel?: string
	experience?: string // Alternative property name for experience level
	jobType?: 'full-time' | 'part-time' | 'contract' | 'internship'
	type?: 'full-time' | 'part-time' | 'contract' | 'internship' // Alternative property name
	benefits?: string[]
	requirements?: string[]
	aboutCompany?: string
	isResumeRequired?: boolean
	sourceUrl?: string
	applicationUrl?: string
	isBookmarked?: boolean
	swipeDecision?: 'interested' | 'not-interested' | null
	swipeTimestamp?: Date
}

export interface JobSwipeState {
	currentJobs: Job[]
	swipedJobs: Job[]
	interestedJobs: Job[]
	rejectedJobs: Job[]
	currentIndex: number
	isLoading: boolean
	error: string | null
}

// Swipe hook types
export interface UseSwipeOptions {
	onSwipeLeft: () => void
	onSwipeRight: () => void
	onTap?: () => void
	threshold?: number
	preventDefaultTouchmoveEvent?: boolean
	delta?: number
}

export interface UseSwipeReturn {
	swipeHandlers: {
		onTouchStart: (e: React.TouchEvent) => void
		onTouchMove: (e: React.TouchEvent) => void
		onTouchEnd: () => void
		onMouseDown: (e: React.MouseEvent) => void
		ref: (el: HTMLElement | null) => void
	}
	swipeDistance: number
	rotation?: number
	opacity?: number
	showLikeIndicator?: boolean
	showRejectIndicator?: boolean
	isSwiping?: boolean
}

// Navigation types
export type AppScreen = 'job_cards' | 'job_details' | 'conversational_ai'

export interface NavigationState {
	currentScreen: AppScreen
	selectedJobId: string | null
	aiContext: 'onboarding' | 'job_qa' | null
}