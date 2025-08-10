import React from 'react'
import { motion } from 'framer-motion'
import { 
	HeartIcon, 
	ChatBubbleOvalLeftEllipsisIcon, 
	ShareIcon,
	EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import type { Job } from '../../types/job'

interface FacebookAdPageProps {
	job: Job
	onStartGigster: () => void
}

const FacebookAdPage: React.FC<FacebookAdPageProps> = ({ job, onStartGigster }) => {
	const [liked, setLiked] = React.useState(false)

	return (
		<div className="fixed inset-0 bg-gray-100 flex flex-col overflow-hidden">
			{/* Facebook Header */}
			<div className="bg-blue-600 text-white p-4 flex-shrink-0">
				<div className="w-full px-0">
					<h1 className="text-xl font-bold">facebook</h1>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				<div className="w-full bg-white">
				{/* Post Header */}
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 flex items-center justify-center">
								<img 
									src="/gigster-logo.svg" 
									alt="Gigster Logo" 
									className="w-10 h-12 object-contain"
								/>
							</div>
							<div>
								<p className="font-semibold text-gray-900">Gigster</p>
								<p className="text-sm text-gray-500">Sponsored • 2h</p>
							</div>
						</div>
						<button className="p-2">
							<EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
						</button>
					</div>
				</div>

				{/* Post Content */}
				<div className="p-4">
					<p className="text-gray-900 mb-4">
						🚀 <strong>Find Your Dream Job!</strong> 
						<br />
						Swipe through thousands of amazing opportunities. 
						Your next career move is just a swipe away!
					</p>
				</div>

				{/* Job Card Preview */}
				<motion.div
					className="mx-4 mb-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 overflow-hidden cursor-pointer"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={onStartGigster}
				>
					{/* Job Header */}
					<div className="p-4 bg-white bg-opacity-60">
						<div className="flex items-center space-x-3">
							{job.companyLogo ? (
								<img 
									src={job.companyLogo} 
									alt={job.company}
									className="w-12 h-12 rounded-lg object-cover"
								/>
							) : (
								<div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold">
										{job.company.charAt(0)}
									</span>
								</div>
							)}
							<div className="flex-1">
								<h3 className="font-bold text-gray-900 text-lg">
									{job.title}
								</h3>
								<p className="text-blue-600 font-medium">
									{job.company}
								</p>
								<p className="text-sm text-gray-600">
									{job.location} • {job.salary}
								</p>
							</div>
						</div>
					</div>

					{/* Job Details Preview */}
					<div className="p-4 bg-white bg-opacity-40">
						<div className="flex items-center space-x-2 mb-2">
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${
								job.workLocation === 'remote' 
									? 'bg-green-100 text-green-700'
									: job.workLocation === 'hybrid'
									? 'bg-blue-100 text-blue-700'
									: 'bg-gray-100 text-gray-700'
							}`}>
								{job.workLocation}
							</span>
							{job.compellingHighlight && (
								<span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
									✨ {job.compellingHighlight}
								</span>
							)}
						</div>
						
						<p className="text-sm text-gray-700 mb-3">
							{job.requirements?.slice(0, 2).join(' • ') || 'Great opportunity'}
						</p>

						<div className="bg-blue-600 text-white text-center py-3 rounded-lg font-semibold">
							Tap to Start Swiping Jobs! 👆
						</div>
					</div>
				</motion.div>

				{/* Facebook Interaction Buttons */}
				<div className="px-4 py-2 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<button 
							onClick={() => setLiked(!liked)}
							className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
								liked 
									? 'text-blue-600 bg-blue-50' 
									: 'text-gray-600 hover:bg-gray-50'
							}`}
						>
							{liked ? (
								<HeartSolidIcon className="w-5 h-5" />
							) : (
								<HeartIcon className="w-5 h-5" />
							)}
							<span className="text-sm font-medium">
								{liked ? 'Liked' : 'Like'}
							</span>
						</button>

						<button className="flex items-center space-x-2 py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
							<ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
							<span className="text-sm font-medium">Comment</span>
						</button>

						<button className="flex items-center space-x-2 py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
							<ShareIcon className="w-5 h-5" />
							<span className="text-sm font-medium">Share</span>
						</button>
					</div>
				</div>

				{/* Fake Comments */}
				<div className="px-4 py-2 border-t border-gray-100">
					<div className="flex items-center space-x-2 mb-2">
						<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
							<span className="text-white text-xs font-bold">S</span>
						</div>
						<p className="text-sm">
							<span className="font-semibold">Sarah M.</span> 
							<span className="text-gray-600"> Got hired through this! Amazing app 🎉</span>
						</p>
					</div>
					<div className="flex items-center space-x-2 mb-2">
						<div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
							<span className="text-white text-xs font-bold">D</span>
						</div>
						<p className="text-sm">
							<span className="font-semibold">Danny L.</span> 
							<span className="text-gray-600"> Found my dream job in 2 days! 💼</span>
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
							<span className="text-white text-xs font-bold">M</span>
						</div>
						<p className="text-sm">
							<span className="font-semibold">Michelle G.</span> 
							<span className="text-gray-600"> Easier than Tinder but for jobs! Highly recommend 🔥</span>
						</p>
					</div>
				</div>
				</div>
			</div>
		</div>
	)
}

export default FacebookAdPage