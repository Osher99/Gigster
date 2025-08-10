import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { NavigationState, AppScreen } from '../types/job'

const initialState: NavigationState = {
	currentScreen: 'job_cards',
	selectedJobId: null,
	aiContext: null
}

const navigationSlice = createSlice({
	name: 'navigation',
	initialState,
	reducers: {
		navigateToJobDetails: (state, action: PayloadAction<string>) => {
			state.currentScreen = 'job_details'
			state.selectedJobId = action.payload
		},
		navigateToJobCards: (state) => {
			state.currentScreen = 'job_cards'
			state.selectedJobId = null
			state.aiContext = null
		},
		navigateToAI: (state, action: PayloadAction<{
			context: 'job_qa' | 'onboarding'
			jobId?: string
		}>) => {
			state.currentScreen = 'conversational_ai'
			state.aiContext = action.payload.context
			if (action.payload.jobId) {
				state.selectedJobId = action.payload.jobId
			}
		},
		setScreen: (state, action: PayloadAction<AppScreen>) => {
			state.currentScreen = action.payload
		},
		clearSelection: (state) => {
			state.selectedJobId = null
			state.aiContext = null
		}
	}
})

export const {
	navigateToJobDetails,
	navigateToJobCards,
	navigateToAI,
	setScreen,
	clearSelection
} = navigationSlice.actions

export default navigationSlice.reducer