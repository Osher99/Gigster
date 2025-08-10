import React, { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import { store } from './store'
import { useAppSelector, useAppDispatch } from './hooks/redux-hooks'
import { navigateToJobCards, navigateToJobDetails, navigateToAI } from './store/navigation-slice'
import { swipeRight, fetchJobsFromFirebase } from './store/job-slice'
import { UserDetectionService } from './services/user-detection.service'
import AuthProvider from './components/AuthProvider'
import LoginScreen from './components/LoginScreen'
import SwipePage from './pages/swipe-page'
import JobDetailsScreen from './components/JobDetailsScreen'
import ConversationalAI from './components/ConversationalAI'
import FacebookAdPage from './components/FacebookAdPage'
import Toast from './components/Toast'
// import './App.css' // מבוטל - משתמשים ב-Tailwind במקום

const AppContent: React.FC = () => {
	const dispatch = useAppDispatch()
	const { currentScreen, selectedJobId, aiContext } = useAppSelector(state => state.navigation)
	const { isAuthenticated, isLoading: authLoading } = useAppSelector(state => state.user)
	const { jobs, isLoading: jobsLoading } = useAppSelector(state => state.jobs)
	const [showLogin, setShowLogin] = useState(false)
	const [showFacebookAd, setShowFacebookAd] = useState(true)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
		message: '',
		type: 'success',
		visible: false
	})
	const selectedJob = selectedJobId ? jobs.find(job => job.id === selectedJobId) : null
	const firstJob = jobs.length > 0 ? jobs[0] : null

	const showToast = (message: string, type: 'success' | 'error') => {
		setToast({ message, type, visible: true })
	}

	const hideToast = () => {
		setToast(prev => ({ ...prev, visible: false }))
	}

	// Clear localStorage and fetch jobs from Firebase on mount
	useEffect(() => {
		// Clear localStorage to reset user data on app start
		UserDetectionService.clearAllData()
		
		dispatch(fetchJobsFromFirebase())
	}, [dispatch])

	// Show login when starting application flow for non-authenticated users
	const shouldShowLogin = showLogin && !isAuthenticated

	if (authLoading || jobsLoading) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center">
				<div className="text-center">
					<div className="mb-8">
						<img 
							src="/gigster-logo.svg" 
							alt="Gigster Logo" 
							className="w-32 h-40 mx-auto object-contain"
						/>
					</div>
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
					<p className="text-white text-lg">Loading amazing jobs...</p>
				</div>
			</div>
		)
	}

	// Show Facebook ad page first
	if (showFacebookAd && firstJob) {
		return (
			<FacebookAdPage 
				job={firstJob}
				onStartGigster={() => setShowFacebookAd(false)}
			/>
		)
	}

	if (shouldShowLogin) {
		return (
			<LoginScreen 
				onSkip={() => setShowLogin(false)}
			/>
		)
	}

	return (
		<div className="app-container">
			<AnimatePresence mode="wait">
				{currentScreen === 'job_cards' && (
					<SwipePage 
						key="job_cards" 
						onSwipeAction={(action: 'like' | 'dislike') => {
							if (action === 'like') {
								showToast('Application Submitted!', 'success')
							} else {
								showToast('Rejected', 'error')
							}
						}}
					/>
				)}
				
				{currentScreen === 'job_details' && selectedJob && (
					<JobDetailsScreen
						key={`job_details_${selectedJob.id}`}
						job={selectedJob}
						onApplyToast={showToast}
						onShowLogin={() => setShowLogin(true)}
					/>
				)}
				
				{currentScreen === 'conversational_ai' && aiContext && (
					<ConversationalAI
						key={`conversational_ai_${aiContext}_${selectedJobId || 'no_job'}`}
						job={selectedJob || undefined}
						context={aiContext}
						onClose={() => {
							if (aiContext === 'job_qa' && selectedJob) {
								// Go back to job details
								dispatch(navigateToJobDetails(selectedJob.id))
							} else {
								// Go back to job cards
								dispatch(navigateToJobCards())
							}
						}}
						onApplicationSubmit={(userData) => {
							// Handle successful application - mark as swiped right and go back
							if (selectedJob) {
								dispatch(swipeRight(selectedJob.id))
							}
							dispatch(navigateToJobCards())
							showToast('Application Submitted!', 'success')
							console.log('Application submitted:', { userData, job: selectedJob })
						}}
					/>
				)}
			</AnimatePresence>
			
			{/* Toast Component */}
			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.visible}
				onHide={hideToast}
			/>
		</div>
	)
}

const App: React.FC = () => {
	return (
		<Provider store={store}>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</Provider>
	)
} 

export default App 