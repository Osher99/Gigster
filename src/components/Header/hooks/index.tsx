import { useAppSelector, useAppDispatch } from '../../../hooks/redux-hooks'
import { swipeLeft, swipeRight, undoLastSwipe, resetJobs } from '../../../store/job-slice'

export const useHeader = () => {
	const dispatch = useAppDispatch()
	const { jobs, currentJobIndex, interestedJobs, rejectedJobs } = useAppSelector(state => state.jobs)
	
	const currentJob = jobs[currentJobIndex] || null
	const hasMoreJobs = currentJobIndex < jobs.length

	const handleUndo = () => {
		dispatch(undoLastSwipe())
	}

	const handleReset = () => {
		dispatch(resetJobs())
	}

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

	return {
		currentJob,
		hasMoreJobs,
		interestedJobs,
		rejectedJobs,
		handleUndo,
		handleReset,
		handleSwipeLeft,
		handleSwipeRight,
	}
}