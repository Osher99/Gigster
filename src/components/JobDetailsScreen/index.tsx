import React from 'react'
import { motion } from 'framer-motion'
import { 
	XMarkIcon, 
	MapPinIcon, 
	CurrencyDollarIcon,
	BuildingOfficeIcon,
	HomeIcon,
	ComputerDesktopIcon,
	ChatBubbleLeftRightIcon,
	ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import AIIcon from '../AIIcon'
import type { Job } from '../../types/job'
import { getJobMatchScore } from '../../utils/match-score'
import { useJobDetails } from './hooks/useJobDetails'

interface JobDetailsScreenProps {
	job: Job
	onBack?: () => void
	onApply?: () => void
	onPass?: () => void
	onAskQuestion?: () => void
	onApplyToast?: (message: string, type: 'success' | 'error') => void
	onShowLogin?: () => void
}

const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({
	job,
	onBack: onBackProp,
	onApply: onApplyProp,
	onPass: onPassProp,
	onAskQuestion: onAskQuestionProp,
	onApplyToast,
	onShowLogin
}) => {
	// Get consistent match score for this job
	const matchScore = getJobMatchScore(job.id)
	
	// Use the hook for handling actions
	const {
		handleApply,
		handlePass,
		handleBack,
		handleAskQuestion
	} = useJobDetails({ job, onApplyToast, onShowLogin })
	
	// Use prop callbacks if provided, otherwise use hook handlers
	const onBack = onBackProp || handleBack
	const onApply = onApplyProp || handleApply
	const onPass = onPassProp || handlePass
	const onAskQuestion = onAskQuestionProp || handleAskQuestion

	// Render work location icon based on type
	const renderWorkLocationIcon = () => {
		switch (job.workLocation) {
			case 'remote':
				return <HomeIcon className="w-4 h-4" />
			case 'hybrid':
				return <ComputerDesktopIcon className="w-4 h-4" />
			case 'office':
			default:
				return <BuildingOfficeIcon className="w-4 h-4" />
		}
	}

	const getWorkLocationColor = () => {
		switch (job.workLocation) {
			case 'remote':
				return 'text-green-600'
			case 'hybrid':
				return 'text-blue-600'
			case 'office':
			default:
				return 'text-gray-600'
		}
	}

	// Generate AI summary bullet points
	const aiSummary = [
		'Develop and maintain high-quality web applications',
		'Collaborate with cross-functional teams on innovative projects',
		'Work with modern technologies and best practices'
	]

	return (
		<motion.div
			initial={{ x: '100%' }}
			animate={{ x: 0 }}
			exit={{ x: '100%' }}
			transition={{ type: 'spring', damping: 25, stiffness: 200 }}
			className="fixed inset-0 bg-white z-50 flex flex-col"
		>
			{/* Header */}
			<div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
				<button
					onClick={onBack}
					className="p-2 rounded-full hover:bg-gray-100 transition-colors"
				>
					<ArrowLeftIcon className="w-6 h-6 text-gray-600" />
				</button>
				<h1 className="text-lg font-semibold text-gray-900 flex-1 text-center mr-10">
					Job Details
				</h1>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto pb-44">
				{/* Company Header */}
				<div className="px-6 py-6 bg-gray-50">
					<div className="flex items-center space-x-4 mb-4">
						<div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
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
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-gray-900 mb-1">
								{job.title}
							</h2>
							<p className="text-lg text-gray-700 font-medium">
								{job.company}
							</p>
							{/* Match Score */}
							<div className="flex items-center mt-2">
								<div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
									<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
									<span className="text-sm font-semibold text-green-700">
										{matchScore}% Match
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Key Details */}
					<div className="space-y-3">
						{/* Location & Commute */}
						<div className="flex items-center text-gray-600">
							<MapPinIcon className="w-5 h-5 mr-2" />
							<span className="text-sm">
								{job.location}
								{job.commuteEstimate && (
									<span className="text-gray-500 ml-2">
										({job.commuteEstimate})
									</span>
								)}
							</span>
						</div>

						{/* Salary */}
						<div className="flex items-center text-gray-600">
							<CurrencyDollarIcon className="w-5 h-5 mr-2" />
							<span className="text-sm font-medium">{job.salary}</span>
						</div>

						{/* Work Location */}
						<div className={`flex items-center ${getWorkLocationColor()}`}>
							{renderWorkLocationIcon()}
							<span className="text-sm font-medium ml-2 capitalize">
								{job.workLocation}
							</span>
						</div>

						{/* Compelling Highlight */}
						{job.compellingHighlight && (
							<div className="bg-blue-100 px-3 py-2 rounded-lg inline-block">
								<span className="text-blue-800 font-medium text-sm">
									✨ {job.compellingHighlight}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* AI Summary */}
				<div className="px-6 py-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">
						Role Summary
					</h3>
					<ul className="space-y-2">
						{aiSummary.map((point, index) => (
							<li key={index} className="flex items-start">
								<span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
								<span className="text-gray-700">{point}</span>
							</li>
						))}
					</ul>
				</div>

				{/* About Company */}
				{job.aboutCompany && (
					<div className="px-6 py-6 border-t border-gray-100">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">
							About the Company
						</h3>
						<p className="text-gray-700 leading-relaxed">
							{job.aboutCompany}
						</p>
					</div>
				)}

				{/* Requirements */}
				<div className="px-6 py-6 border-t border-gray-100">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">
						Your Qualifications
					</h3>
					<ul className="space-y-2">
						{job.requirements?.map((requirement, index) => (
							<li key={index} className="flex items-start">
								<span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
								<span className="text-gray-700">{requirement}</span>
							</li>
						))}
					</ul>
				</div>

				{/* Benefits */}
				{job.benefits && job.benefits.length > 0 && (
					<div className="px-6 py-6 border-t border-gray-100">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">
							Benefits & Perks
						</h3>
						<div className="grid grid-cols-1 gap-2">
							{job.benefits.map((benefit, index) => (
								<div key={index} className="flex items-center">
									<span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
									<span className="text-gray-700">{benefit}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Fixed Bottom Actions */}
			<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
				<div className="flex items-center space-x-3">
					{/* Pass Button - Direct swipe left action */}
					<button
						onClick={onPass}
						className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
					>
						<XMarkIcon className="w-5 h-5 mr-2" />
						Pass
					</button>

					{/* Apply Button - Direct onboarding action */}
					<button
						onClick={onApply}
						className="flex-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
					>
						<HeartSolidIcon className="w-5 h-5 mr-2" />
						Apply Now
					</button>
				</div>

				{/* Ask Question Button */}
				<button
					onClick={onAskQuestion}
					className="w-full mt-3 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center"
				>
					<AIIcon className="w-5 h-5 mr-2" />
					Ask A.I
				</button>
			</div>
		</motion.div>
	)
}

export default JobDetailsScreen