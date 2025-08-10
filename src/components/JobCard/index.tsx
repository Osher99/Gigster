import React from 'react'
import { motion } from 'framer-motion'
import { 
	XMarkIcon, 
	MapPinIcon, 
	CurrencyDollarIcon,
	BuildingOfficeIcon,
	HomeIcon,
	ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import type { Job } from '../../types/job'
import { useJobCard } from './hooks/useJobCard'
import AIIcon from '../AIIcon'
import { getJobMatchScore } from '../../utils/match-score'

interface JobCardProps {
	job: Job | null
	onSwipeLeft: () => void
	onSwipeRight: () => void
	onTap?: (() => void) | undefined
	onAskQuestion?: () => void
	isTopCard?: boolean
}

const JobCard: React.FC<JobCardProps> = ({ job, onSwipeLeft, onSwipeRight, onTap, onAskQuestion, isTopCard = false }) => {
	const {
		swipeHandlers,
		swipeDistance,
		rotation,
		opacity,
		showLikeIndicator,
		showRejectIndicator,
		handleImageError,
		workLocationIconType,
		workLocationText,
		workLocationColor
	} = useJobCard({ job, onSwipeLeft, onSwipeRight, onTap, isTopCard })

	if (!job) return null

	// Get consistent match score for this job
	const matchScore = getJobMatchScore(job.id)

	// Render work location icon based on type
	const renderWorkLocationIcon = () => {
		switch (workLocationIconType) {
			case 'remote':
				return <HomeIcon className="w-4 h-4" />
			case 'hybrid':
				return <ComputerDesktopIcon className="w-4 h-4" />
			case 'office':
			default:
				return <BuildingOfficeIcon className="w-4 h-4" />
		}
	}

	return (
		<div
			className="absolute inset-0 w-full h-full overflow-hidden bg-transparent"
			style={{
				userSelect: 'none',
				touchAction: 'none'
			}}
		>
			<motion.div
				className="w-full h-full relative overflow-hidden bg-transparent rounded-lg"
				style={{ opacity }}
				animate={{
					x: swipeDistance,
					rotate: rotation,
					scale: isTopCard ? 1 : 0.95
				}}
				onTouchStart={swipeHandlers.onTouchStart}
				onTouchMove={swipeHandlers.onTouchMove}
				onTouchEnd={swipeHandlers.onTouchEnd}
				onMouseDown={swipeHandlers.onMouseDown}
				ref={swipeHandlers.ref}
				transition={{ 
					type: 'spring', 
					stiffness: swipeDistance === 0 ? 300 : 0, 
					damping: swipeDistance === 0 ? 30 : 0,
					duration: swipeDistance === 0 ? 0.3 : 0
				}}
			>
				{/* Background Image - covers entire card */}
				<div className="absolute inset-0 w-full h-full overflow-hidden rounded-lg">
					<img
						src={job.image}
						alt={job.title}
						className="w-full h-full object-cover"
						onError={handleImageError}
					/>
					{/* Enhanced gradient overlay for better text readability */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
				</div>

				{/* Swipe Indicators */}
				{showLikeIndicator && (
					<div className="absolute top-8 right-8 z-30 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl transform rotate-12 shadow-lg">
						<HeartSolidIcon className="w-8 h-8 inline mr-3" />
						INTERESTED
					</div>
				)}
				
				{showRejectIndicator && (
					<div className="absolute top-8 left-8 z-30 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl transform -rotate-12 shadow-lg">
						<XMarkIcon className="w-8 h-8 inline mr-3" />
						NOPE
					</div>
				)}

				{/* Company Logo */}
				<div className="absolute top-8 left-8 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg overflow-hidden">
					{job.companyLogo ? (
						<img
							src={job.companyLogo}
							alt={`${job.company} logo`}
							className="w-full h-full object-cover"
							onError={(e) => {
								const target = e.target as HTMLImageElement
								target.style.display = 'none'
								const parent = target.parentElement
								if (parent) {
									parent.innerHTML = `<img src="/gigster-logo.svg" alt="Gigster Logo" class="w-12 h-14 object-contain" />`
								}
							}}
						/>
					) : (
						<img 
							src="/gigster-logo.svg" 
							alt="Gigster Logo" 
							className="w-12 h-14 object-contain"
						/>
					)}
				</div>

				{/* Badges Row */}
				<div className="absolute top-8 right-8 flex flex-col space-y-2 items-end">
					{/* Match Score Badge */}
					<div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-full flex items-center space-x-2 shadow-lg">
						<span className="text-sm font-bold">{matchScore}% Match</span>
					</div>
					
					{/* Work Location Badge */}
					<div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-full flex items-center space-x-2 shadow-lg">
						<span className={workLocationColor}>
							{renderWorkLocationIcon()}
						</span>
						<span className="text-sm font-medium">{workLocationText}</span>
					</div>
				</div>

				{/* Job Details - Center-bottom positioning */}
				<div className="absolute inset-x-0 bottom-0 flex flex-col justify-end px-6 pb-8 text-white" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
					{/* Title and Company */}
					<div className="mb-4">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight line-clamp-2 drop-shadow-lg">
							{job.title}
						</h1>
						<p className="text-base sm:text-lg lg:text-xl text-white/95 font-medium flex items-center drop-shadow-md">
							<BuildingOfficeIcon className="w-5 h-5 mr-2 flex-shrink-0" />
							<span className="truncate">{job.company}</span>
						</p>
					</div>

					{/* Key info row */}
					<div className="grid grid-cols-2 gap-3 mb-4">
						<div className="flex items-center text-white/95 min-w-0">
							<MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
							<div className="flex flex-col min-w-0">
								<span className="text-sm sm:text-base font-medium truncate drop-shadow-md">{job.location}</span>
								{job.commuteEstimate && (
									<span className="text-xs text-white/80 truncate drop-shadow-md">({job.commuteEstimate})</span>
								)}
							</div>
						</div>
						<div className="flex items-center text-green-400 min-w-0">
							<CurrencyDollarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
							<span className="text-sm sm:text-base font-bold truncate drop-shadow-md">{job.salary}</span>
						</div>
					</div>

					{/* Compelling Highlight */}
					{job.compellingHighlight && (
						<div className="mb-4">
							<div className="bg-blue-500/80 backdrop-blur-sm text-white px-3 py-2 rounded-full inline-block">
								<span className="text-sm font-medium">✨ {job.compellingHighlight}</span>
							</div>
						</div>
					)}

					{/* Description - more visible on larger screens */}
					<p className="hidden sm:block text-white/90 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3 drop-shadow-md">
						{job.description}
					</p>

					{/* Tags - better spacing and visibility */}
					<div className="flex flex-wrap gap-2">
						{job.tags.slice(0, window.innerWidth < 640 ? 2 : 4).map((tag: string, index: number) => (
							<span
								key={index}
								className="inline-block bg-white/25 backdrop-blur-sm text-white text-sm sm:text-base px-3 py-1.5 rounded-full font-medium flex-shrink-0 drop-shadow-md"
							>
								#{tag}
							</span>
						))}
						{job.tags.length > (window.innerWidth < 640 ? 2 : 4) && (
							<span className="inline-block bg-white/25 backdrop-blur-sm text-white text-sm sm:text-base px-3 py-1.5 rounded-full flex-shrink-0 drop-shadow-md">
								+{job.tags.length - (window.innerWidth < 640 ? 2 : 4)}
							</span>
						)}
					</div>

				</div>
			</motion.div>

			{/* AI Button - outside motion.div to avoid swipe interference */}
			{onAskQuestion && (
				<button
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						console.log('AI button clicked') // Debug log
						onAskQuestion()
					}}
					className="absolute bottom-4 right-4 w-14 h-14 bg-white/90 backdrop-blur-md hover:bg-white hover:scale-110 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl border-2 border-white/50 z-30 group"
				>
					<AIIcon className="w-7 h-7 text-blue-600 group-hover:text-blue-700 transition-all duration-200" />
				</button>
			)}
		</div>
	)
}

export default JobCard 