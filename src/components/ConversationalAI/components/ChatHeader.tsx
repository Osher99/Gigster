import React from 'react'
import { XMarkIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

interface ChatHeaderProps {
	context: 'job_qa' | 'onboarding'
	onClose: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ context, onClose }) => {
	return (
		<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
			<div className="flex items-center space-x-3">
				<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
					<ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
				</div>
				<div>
					<h3 className="font-semibold text-gray-900">AI Assistant</h3>
					<p className="text-sm text-gray-500">
						{context === 'job_qa' ? 'Ask me about this job' : 'Let\'s get you set up'}
					</p>
				</div>
			</div>
			<button
				onClick={onClose}
				className="p-2 rounded-full hover:bg-gray-100 transition-colors"
			>
				<XMarkIcon className="w-6 h-6 text-gray-600" />
			</button>
		</div>
	)
}

export default ChatHeader
