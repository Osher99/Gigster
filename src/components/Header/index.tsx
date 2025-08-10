import React from 'react'
import { motion } from 'framer-motion'
import { 
	ArrowUturnLeftIcon, 
	ArrowPathIcon, 
	HeartIcon, 
	XMarkIcon 
} from '@heroicons/react/24/outline'

import Button from '../Button'
import { useHeader } from './hooks/useHeader'

interface HeaderProps {
	onSwipeAction?: (action: 'like' | 'dislike') => void
}

const Header: React.FC<HeaderProps> = ({ onSwipeAction }) => {
	const {
		currentJob,
		hasMoreJobs,
		interestedJobs,
		rejectedJobs,
		handleUndo,
		handleReset,
		handleSwipeLeft,
		handleSwipeRight
	} = useHeader(onSwipeAction)

	return (
		<header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex-shrink-0">
			<div className="flex items-center justify-between w-full">
				{/* Logo and Title */}
				<div className="flex items-center space-x-3 flex-shrink-0">
					<motion.div 
						className="w-10 h-10 flex items-center justify-center"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<img 
							src="/gigster-logo.svg" 
							alt="Gigster Logo" 
							className="w-10 h-12 object-contain"
						/>
					</motion.div>
					<div className="min-w-0">
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
							Gigster
						</h1>
						<p className="hidden sm:block text-sm text-gray-500">
							Swipe your way to your dream job
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center space-x-2 flex-shrink-0 overflow-hidden">
					{/* Stats */}
					<div className="hidden sm:flex items-center space-x-4 mr-4">
						<div className="text-center">
							<div className="text-green-600 font-bold text-lg">
								{interestedJobs.length}
							</div>
							<div className="text-xs text-gray-500">Interested</div>
						</div>
						<div className="text-center">
							<div className="text-red-600 font-bold text-lg">
								{rejectedJobs.length}
							</div>
							<div className="text-xs text-gray-500">Passed</div>
						</div>
					</div>

					{/* Mobile Action Buttons */}
					{hasMoreJobs && currentJob && (
						<div className="flex sm:hidden space-x-1">
							<Button
								onClick={handleSwipeLeft}
								variant="danger"
								size="md"
								ariaLabel="Reject job"
							>
								<XMarkIcon className="w-4 h-4" />
							</Button>
							<Button
								onClick={handleSwipeRight}
								variant="success"
								size="md"
								ariaLabel="Show interest in job"
							>
								<HeartIcon className="w-4 h-4" />
							</Button>
						</div>
					)}

					{/* Undo Button */}
					<Button
						onClick={handleUndo}
						variant="secondary"
						size="sm"
						className="sm:w-10 sm:h-10"
						title="Undo last swipe"
						ariaLabel="Undo last swipe"
					>
						<ArrowUturnLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
					</Button>

					{/* Reset Button */}
					<Button
						onClick={handleReset}
						variant="secondary"
						size="sm"
						className="sm:w-10 sm:h-10"
						title="Reset all jobs"
						ariaLabel="Reset all jobs"
					>
						<ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
					</Button>
				</div>
			</div>
		</header>
	)
}

export default Header 