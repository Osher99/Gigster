import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { FirebaseInitService } from '../services/firebase-init.service'
import type { Job } from '../types/job'
import type { RootState } from './index'

interface JobsState {
	jobs: Job[]
	currentJobIndex: number
	swipedJobs: { id: string; action: 'interested' | 'rejected' }[]
	interestedJobs: Job[]
	rejectedJobs: Job[]
	isLoading: boolean
	hasMoreJobs: boolean
	error: string | null
}

const initialState: JobsState = {
	jobs: [],
	currentJobIndex: 0,
	swipedJobs: [],
	interestedJobs: [],
	rejectedJobs: [],
	isLoading: true,
	hasMoreJobs: true,
	error: null
}

// Async thunk to fetch jobs from Firebase
export const fetchJobsFromFirebase = createAsyncThunk(
	'jobs/fetchFromFirebase',
	async () => {
		return await FirebaseInitService.getFirebaseJobs()
	}
)

export const jobSlice = createSlice({
	name: 'jobs',
	initialState,
	reducers: {
		swipeRight: (state, action: PayloadAction<string>) => {
			const jobId = action.payload
			const currentJob = state.jobs.find((job): job is Job => job.id === jobId)
			
			if (currentJob) {
				state.interestedJobs.push(currentJob)
				state.swipedJobs.push({ id: jobId, action: 'interested' })
				state.currentJobIndex += 1
				
				if (state.currentJobIndex >= state.jobs.length) {
					state.hasMoreJobs = false
				}
			}
		},
		swipeLeft: (state, action: PayloadAction<string>) => {
			const jobId = action.payload
			const currentJob = state.jobs.find((job): job is Job => job.id === jobId)
			
			if (currentJob) {
				state.rejectedJobs.push(currentJob)
				state.swipedJobs.push({ id: jobId, action: 'rejected' })
				state.currentJobIndex += 1
				
				if (state.currentJobIndex >= state.jobs.length) {
					state.hasMoreJobs = false
				}
			}
		},
		resetJobs: (state) => {
			state.currentJobIndex = 0
			state.swipedJobs = []
			state.interestedJobs = []
			state.rejectedJobs = []
			state.hasMoreJobs = true
		},
		undoLastSwipe: (state) => {
			if (state.swipedJobs.length > 0) {
				const lastSwipe = state.swipedJobs.pop()
				
				if (lastSwipe) {
					if (lastSwipe.action === 'interested') {
						state.interestedJobs = state.interestedJobs.filter(job => job.id !== lastSwipe.id)
					} else {
						state.rejectedJobs = state.rejectedJobs.filter(job => job.id !== lastSwipe.id)
					}
					
					state.currentJobIndex = Math.max(0, state.currentJobIndex - 1)
					state.hasMoreJobs = true
				}
			}
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchJobsFromFirebase.pending, (state) => {
				state.isLoading = true
				state.error = null
			})
			.addCase(fetchJobsFromFirebase.fulfilled, (state, action) => {
				state.isLoading = false
				state.jobs = action.payload
				state.hasMoreJobs = action.payload.length > 0
				state.error = null
			})
			.addCase(fetchJobsFromFirebase.rejected, (state, action) => {
				state.isLoading = false
				state.error = action.error.message || 'Failed to fetch jobs'
				// Fallback to empty array if Firebase fails
				state.jobs = []
				state.hasMoreJobs = false
			})
	}
})

export const { 
	swipeRight, 
	swipeLeft, 
	resetJobs, 
	undoLastSwipe, 
	setLoading 
} = jobSlice.actions

// Typed selectors with proper RootState
export const selectCurrentJob = (state: RootState): Job | null => {
	const { jobs, currentJobIndex } = state.jobs
	if (currentJobIndex < jobs.length && jobs[currentJobIndex]) {
		return jobs[currentJobIndex] || null
	}
	return null
}

export const selectHasMoreJobs = (state: RootState): boolean => 
	state.jobs.hasMoreJobs

export const selectInterestedJobs = (state: RootState): Job[] => 
	state.jobs.interestedJobs

export const selectRejectedJobs = (state: RootState): Job[] => 
	state.jobs.rejectedJobs

export default jobSlice.reducer 