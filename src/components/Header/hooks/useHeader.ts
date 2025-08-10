import { useAppSelector, useAppDispatch } from '../../../hooks/redux-hooks'
import { selectCurrentJob, swipeLeft, swipeRight, resetJobs, undoLastSwipe } from '../../../store/job-slice'
import { navigateToAI } from '../../../store/navigation-slice'
import { UserDetectionService } from '../../../services/user-detection.service'
import { JobsService } from '../../../services/jobs.service'
import { auth } from '../../../config/firebase'

export const useHeader = (onSwipeAction?: (action: 'like' | 'dislike') => void) => {
	const dispatch = useAppDispatch()
	const { interestedJobs, rejectedJobs, currentJobIndex, hasMoreJobs } = useAppSelector(state => state.jobs)
	const { isAuthenticated } = useAppSelector(state => state.user)
	const currentJob = useAppSelector(selectCurrentJob)
	
	const acceptedCount = interestedJobs.length
	const rejectedCount = rejectedJobs.length
	const totalCount = acceptedCount + rejectedCount
	
	const handleUndo = () => {
		dispatch(undoLastSwipe())
	}
	
	const handleReset = () => {
		dispatch(resetJobs())
	}
	
	const handleSwipeLeft = async () => {
		if (currentJob) {
			// Record dislike interaction (same as JobStack)
			if (isAuthenticated && auth.currentUser) {
				await JobsService.recordJobInteraction(auth.currentUser.uid, currentJob.id, 'dislike')
					.catch(() => console.log('Skipping dislike recording - check Firebase permissions'))
			}
			dispatch(swipeLeft(currentJob.id))
			onSwipeAction?.('dislike')
		}
	}
	
	const handleSwipeRight = async () => {
		if (currentJob) {
			// Record like interaction (same as JobStack)
			if (isAuthenticated && auth.currentUser) {
				await JobsService.recordJobInteraction(auth.currentUser.uid, currentJob.id, 'like')
					.catch(() => console.log('Skipping like recording - check Firebase permissions'))
			}
			
			// Check if user has already completed onboarding (same as JobStack)
			const currentUser = UserDetectionService.getCurrentUser()
			const hasCompletedOnboarding = currentUser !== null

			if (hasCompletedOnboarding) {
				// User already completed onboarding, just swipe right and continue
				dispatch(swipeRight(currentJob.id))
				onSwipeAction?.('like')
			} else {
				// Navigate to AI for application process for first-time users
				dispatch(navigateToAI({ context: 'onboarding', jobId: currentJob.id }))
			}
		}
	}
	
	return {
		acceptedCount,
		rejectedCount,
		totalCount,
		currentIndex: currentJobIndex,
		currentJob,
		hasMoreJobs,
		interestedJobs,
		rejectedJobs,
		handleUndo,
		handleReset,
		handleSwipeLeft,
		handleSwipeRight
	}
}