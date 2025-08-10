import React from 'react'
import { motion } from 'framer-motion'
import { ComputerDesktopIcon } from '@heroicons/react/24/outline'

const LoadingIndicator: React.FC = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex justify-start"
		>
			<div className="flex items-start space-x-2 max-w-[80%]">
				<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
					<ComputerDesktopIcon className="w-5 h-5 text-gray-600" />
				</div>
				<div className="px-4 py-2 rounded-2xl bg-gray-100">
					<div className="flex space-x-1">
						<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
						<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
						<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
					</div>
				</div>
			</div>
		</motion.div>
	)
}

export default LoadingIndicator
