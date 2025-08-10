import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthService } from '../services/auth.service'

export interface UserProfile {
	uid: string
	email: string
	displayName?: string
	firstName?: string
	lastName?: string
	photoURL?: string
	isResumeComplete?: boolean
	isComplete?: boolean
	skills?: string[]
	experience?: string
	preferredLocation?: string
	salaryExpectation?: string
	resumeUrl?: string
}

export interface UserState {
	firebaseProfile: UserProfile | null
	isAuthenticated: boolean
	isLoading: boolean
	authError: string | null
	emailForOTP: string | null
}

const initialState: UserState = {
	firebaseProfile: null,
	isAuthenticated: false,
	isLoading: false,
	authError: null,
	emailForOTP: null,
}

// Async thunks
export const sendOTPToEmail = createAsyncThunk(
	'user/sendOTPToEmail',
	async (email: string, { rejectWithValue }) => {
		try {
			await AuthService.sendOTPToEmail(email)
			return email
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to send OTP')
		}
	}
)

export const createOrUpdateProfile = createAsyncThunk(
	'user/createOrUpdateProfile',
	async ({ user, profileData }: { user: any, profileData: Partial<UserProfile> }, { rejectWithValue }) => {
		try {
			const updatedProfile = await AuthService.createOrUpdateUserProfile(user, profileData)
			return updatedProfile
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to update profile')
		}
	}
)

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setFirebaseProfile: (state, action: PayloadAction<UserProfile>) => {
			state.firebaseProfile = action.payload
		},
		setAuthenticated: (state, action: PayloadAction<boolean>) => {
			state.isAuthenticated = action.payload
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload
		},
		clearAuthError: (state) => {
			state.authError = null
		},
		signOut: (state) => {
			state.firebaseProfile = null
			state.isAuthenticated = false
			state.emailForOTP = null
			state.authError = null
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(sendOTPToEmail.pending, (state) => {
				state.isLoading = true
				state.authError = null
			})
			.addCase(sendOTPToEmail.fulfilled, (state, action) => {
				state.isLoading = false
				state.emailForOTP = action.payload
			})
			.addCase(sendOTPToEmail.rejected, (state, action) => {
				state.isLoading = false
				state.authError = action.payload as string
			})
			.addCase(createOrUpdateProfile.pending, (state) => {
				state.isLoading = true
			})
			.addCase(createOrUpdateProfile.fulfilled, (state, action) => {
				state.isLoading = false
				state.firebaseProfile = action.payload
			})
			.addCase(createOrUpdateProfile.rejected, (state, action) => {
				state.isLoading = false
				state.authError = action.payload as string
			})
	},
})

export const {
	setFirebaseProfile,
	setAuthenticated,
	setLoading,
	clearAuthError,
	signOut,
} = userSlice.actions

export default userSlice.reducer 