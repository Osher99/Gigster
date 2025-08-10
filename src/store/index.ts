import { configureStore } from '@reduxjs/toolkit'
import jobsReducer from './job-slice'
import userReducer from './user-slice'
import navigationReducer from './navigation-slice'

export const store = configureStore({
	reducer: {
		jobs: jobsReducer,
		user: userReducer,
		navigation: navigationReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ['persist/PERSIST'],
			},
		}),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store 