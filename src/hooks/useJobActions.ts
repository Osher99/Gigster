import { useSelector, useDispatch } from 'react-redux'
import { swipeLeft, swipeRight, undoLastSwipe, resetJobs, selectCurrentJob, selectHasMoreJobs, selectInterestedJobs, selectRejectedJobs } from '../store/job-slice'

export const useJobActions = () => {
	const dispatch = useDispatch()
	
	const currentJob = useSelector(selectCurrentJob)
	const hasMoreJobs = useSelector(selectHasMoreJobs)
	const interestedJobs = useSelector(selectInterestedJobs)
	const rejectedJobs = useSelector(selectRejectedJobs)

	const handleSwipeLeft = () => {
		if (currentJob) {
			dispatch(swipeLeft(currentJob.id))
		}
	}

	const handleSwipeRight = () => {
		if (currentJob) {
			dispatch(swipeRight(currentJob.id))
		}
	}

	const handleUndo = () => {
		dispatch(undoLastSwipe())
	}

	const handleReset = () => {
		dispatch(resetJobs())
	}

	return {
		currentJob,
		hasMoreJobs,
		interestedJobs,
		rejectedJobs,
		handleSwipeLeft,
		handleSwipeRight,
		handleUndo,
		handleReset
	}
} 