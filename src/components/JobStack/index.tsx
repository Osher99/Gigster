import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JobCard from '../JobCard'
import { useJobActions } from '../../hooks/useJobActions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks'
import { navigateToJobDetails, navigateToAI } from '../../store/navigation-slice'
import { JobsService } from '../../services/jobs.service'
import { UserDetectionService } from '../../services/user-detection.service'
import { auth } from '../../config/firebase'

interface JobStackProps {
	onSwipeAction?: (action: 'like' | 'dislike') => void
}

const JobStack: React.FC<JobStackProps> = ({ onSwipeAction }) => {
	const dispatch = useAppDispatch()
	const { isAuthenticated } = useAppSelector(state => state.user)
	const { 
		currentJob, 
		hasMoreJobs, 
		handleSwipeLeft,
		handleSwipeRight 
	} = useJobActions()

	// Record job interaction when job is viewed
	useEffect(() => {
		if (currentJob && isAuthenticated && auth.currentUser) {
			JobsService.recordJobInteraction(auth.currentUser.uid, currentJob.id, 'view')
				.catch(() => {
					// Silently fail for now if permissions issue
					console.log('Skipping view recording - check Firebase permissions')
				})
		}
	}, [currentJob, isAuthenticated])

	const handleJobTap = () => {
		if (currentJob) {
			console.log('handleJobTap called for job:', currentJob.id) // Debug log
			dispatch(navigateToJobDetails(currentJob.id))
		}
	}

	const handleAskQuestion = () => {
		if (currentJob) {
			console.log('handleAskQuestion called for job:', currentJob.id) // Debug log
			dispatch(navigateToAI({ context: 'job_qa', jobId: currentJob.id }))
		}
	}

	const handleSwipeRightWithApplication = async () => {
		if (currentJob) {
			// Record like interaction
			if (isAuthenticated && auth.currentUser) {
				await JobsService.recordJobInteraction(auth.currentUser.uid, currentJob.id, 'like')
					.catch(() => console.log('Skipping like recording - check Firebase permissions'))
			}
			
			// Check if user has already completed onboarding
			const currentUser = UserDetectionService.getCurrentUser()
			const hasCompletedOnboarding = currentUser !== null

			if (hasCompletedOnboarding) {
				// User already completed onboarding, just swipe right and continue
				handleSwipeRight()
				onSwipeAction?.('like')
			} else {
				// Navigate to AI for application process for first-time users
				dispatch(navigateToAI({ context: 'onboarding', jobId: currentJob.id }))
			}
		}
	}

	const handleSwipeLeftWithDislike = async () => {
		if (currentJob) {
			// Record dislike interaction
			if (isAuthenticated && auth.currentUser) {
				await JobsService.recordJobInteraction(auth.currentUser.uid, currentJob.id, 'dislike')
					.catch(() => console.log('Skipping dislike recording - check Firebase permissions'))
			}
		}
		handleSwipeLeft()
		onSwipeAction?.('dislike')
	}

	const handleRestart = (): void => {
		window.location.reload()
	}

	if (!hasMoreJobs) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-8">
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					className="max-w-md"
				>
					<div className="text-6xl mb-4">🎉</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						No More Jobs!
					</h2>
					<p className="text-gray-600 mb-6">
						You've gone through all available jobs. Check back later for new opportunities!
					</p>
					<button
						onClick={handleRestart}
						className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
						type="button"
					>
						Start Over
					</button>
				</motion.div>
			</div>
		)
	}

	return (
		<div className="relative w-full h-full overflow-hidden">
			<AnimatePresence mode="wait">
				{currentJob && (
					<motion.div
						key={currentJob.id}
						initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
						animate={{ scale: 1, opacity: 1, rotateY: 0 }}
						exit={{ 
							scale: 0.8, 
							opacity: 0, 
							rotateY: 90,
							transition: { duration: 0.3 }
						}}
						transition={{
							type: 'spring',
							stiffness: 300,
							damping: 30
						}}
						className="absolute inset-0 overflow-hidden"
					>
						<JobCard
							job={currentJob}
							onSwipeLeft={handleSwipeLeftWithDislike}
							onSwipeRight={handleSwipeRightWithApplication}
							onTap={handleJobTap}
							onAskQuestion={handleAskQuestion}
							isTopCard={true}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default JobStack 