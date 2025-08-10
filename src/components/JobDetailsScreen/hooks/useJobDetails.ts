import { useAppSelector, useAppDispatch } from '../../../hooks/redux-hooks'
import { swipeLeft, swipeRight } from '../../../store/job-slice'
import { navigateToAI, navigateToJobCards } from '../../../store/navigation-slice'
import { UserDetectionService } from '../../../services/user-detection.service'
import { JobsService } from '../../../services/jobs.service'
import { auth } from '../../../config/firebase'
import type { Job } from '../../../types/job'

interface UseJobDetailsProps {
	job: Job
	onApplyToast?: (message: string, type: 'success' | 'error') => void
	onShowLogin?: () => void
}

export const useJobDetails = ({ job, onApplyToast, onShowLogin }: UseJobDetailsProps) => {
	const dispatch = useAppDispatch()
	const { isAuthenticated } = useAppSelector(state => state.user)
	
	const handleApply = async () => {
		// Check if user is authenticated, if not show login
		if (!isAuthenticated) {
			onShowLogin?.()
			return
		}
		
		// Record like interaction (same as JobStack/Header)
		if (auth.currentUser) {
			await JobsService.recordJobInteraction(auth.currentUser.uid, job.id, 'like')
				.catch(() => console.log('Skipping like recording - check Firebase permissions'))
		}
		
		// Check if user has already completed onboarding
		const currentUser = UserDetectionService.getCurrentUser()
		const hasCompletedOnboarding = currentUser !== null

		if (hasCompletedOnboarding) {
			// User already completed onboarding, just swipe right and continue
			dispatch(swipeRight(job.id))
			dispatch(navigateToJobCards())
			onApplyToast?.('Application Submitted!', 'success')
		} else {
			// Navigate to AI for application process for first-time users
			dispatch(navigateToAI({ context: 'onboarding', jobId: job.id }))
		}
	}
	
	const handlePass = async () => {
		// Record dislike interaction (same as JobStack/Header)
		if (isAuthenticated && auth.currentUser) {
			await JobsService.recordJobInteraction(auth.currentUser.uid, job.id, 'dislike')
				.catch(() => console.log('Skipping dislike recording - check Firebase permissions'))
		}
		
		// Handle job rejection and go back
		dispatch(swipeLeft(job.id))
		dispatch(navigateToJobCards())
		onApplyToast?.('Rejected', 'error')
	}
	
	const handleBack = () => {
		dispatch(navigateToJobCards())
	}
	
	const handleAskQuestion = () => {
		// Navigate to AI with job Q&A context
		dispatch(navigateToAI({ context: 'job_qa', jobId: job.id }))
	}
	
	return {
		handleApply,
		handlePass,
		handleBack,
		handleAskQuestion,
		isAuthenticated
	}
}
