import React from 'react'
import { AnimatePresence } from 'framer-motion'
import MessageBubble from './MessageBubble'
import LoadingIndicator from './LoadingIndicator'
import type { Message } from '../hooks/useConversationalAI'

interface MessageListProps {
	messages: Message[]
	isLoading: boolean
	messagesEndRef: React.RefObject<HTMLDivElement | null>
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, messagesEndRef }) => {
	return (
		<div 
			className="overflow-y-auto p-4 space-y-4" 
			style={{ 
				WebkitOverflowScrolling: 'touch', 
				overscrollBehavior: 'contain',
				position: 'relative',
				willChange: 'transform',
				touchAction: 'pan-y',
				msOverflowStyle: 'none',
				height: '100%',
				maxHeight: '100%'
			} as React.CSSProperties}
		>
			<AnimatePresence>
				{messages.map((message) => (
					<MessageBubble key={message.id} message={message} />
				))}
			</AnimatePresence>
			
			{isLoading && <LoadingIndicator />}
			
			<div ref={messagesEndRef} />
		</div>
	)
}

export default MessageList
