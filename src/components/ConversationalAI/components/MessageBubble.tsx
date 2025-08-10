import React from 'react'
import { motion } from 'framer-motion'
import { UserIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import type { Message } from '../hooks/useConversationalAI'

interface MessageBubbleProps {
	message: Message
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
	const isUser = message.sender === 'user'
	
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
		>
			<div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
				<div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
					isUser ? 'bg-blue-600' : 'bg-gray-100'
				}`}>
					{isUser ? (
						<UserIcon className="w-5 h-5 text-white" />
					) : (
						<ComputerDesktopIcon className="w-5 h-5 text-gray-600" />
					)}
				</div>
				<div className={`px-4 py-2 rounded-2xl ${
					isUser
						? 'bg-blue-600 text-white'
						: 'bg-gray-100 text-gray-900'
				}`}>
					<p className="text-sm">{message.text}</p>
				</div>
			</div>
		</motion.div>
	)
}

export default MessageBubble
