import React from 'react'
import { motion } from 'framer-motion'
import type { Job } from '../../types/job'
import { useConversationalAI } from './hooks/useConversationalAI'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import OnboardingSummary from './components/OnboardingSummary'
import FileUploadSection from './components/FileUploadSection'
import ChatInput from './components/ChatInput'

interface ConversationalAIProps {
	job?: Job | undefined
	context: 'job_qa' | 'onboarding'
	onClose: () => void
	onApplicationSubmit?: (userData: any) => void
	prefilledData?: {
		firstName?: string
		lastName?: string
		email?: string
		resumeUrl?: string
	}
}

const ConversationalAI: React.FC<ConversationalAIProps> = (props) => {
	const {
		messages,
		inputText,
		isLoading,
		onboardingState,
		showFileUpload,
		messagesEndRef,
		inputRef,
		fileInputRef,
		setInputText,
		handleSendMessage,
		handleKeyPress,
		handleFileUpload,
		handleEditField,
		setShowFileUpload,
		context,
		job
	} = useConversationalAI(props)
	
	// Swipe down to close
	const [dragY, setDragY] = React.useState(0)
	const handleDragEnd = (event: any, info: any) => {
		if (info.offset.y > 100) {
			props.onClose()
		} else {
			setDragY(0)
		}
	}

	return (
		<div 
			className="fixed inset-0 z-50"
			style={{ 
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				touchAction: 'none'
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					props.onClose()
				}
			}}
		>
			<div 
				className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl conversational-ai-container"
				style={{ 
					height: '85vh',
					maxHeight: '600px',
					zIndex: 9999,
					position: 'absolute'
				}}
			>
				<motion.div
					initial={{ y: '100%' }}
					animate={{ y: dragY }}
					exit={{ y: '100%' }}
					transition={{ type: 'spring', damping: 25, stiffness: 200 }}
					drag="y"
					dragConstraints={{ top: 0, bottom: 0 }}
					dragElastic={0.2}
					onDragEnd={handleDragEnd}
					className="h-full flex flex-col"
					style={{ 
						willChange: 'transform',
						transform: 'translateZ(0)' // Force hardware acceleration
					}}
				>
				<ChatHeader context={context} onClose={props.onClose} />
				
				<MessageList 
					messages={messages} 
					isLoading={isLoading} 
					messagesEndRef={messagesEndRef} 
				/>

				{context === 'onboarding' && (
					<OnboardingSummary
						onboardingState={onboardingState}
						job={job}
						onEditField={handleEditField}
						onUploadClick={() => fileInputRef.current?.click()}
					/>
				)}

				{showFileUpload && (
					<FileUploadSection onUploadClick={() => fileInputRef.current?.click()} />
				)}

				{/* Hidden File Input */}
				<input
					ref={fileInputRef}
					type="file"
					accept=".pdf,.doc,.docx"
					onChange={handleFileUpload}
					className="hidden"
				/>

				<ChatInput
					inputText={inputText}
					setInputText={setInputText}
					handleSendMessage={handleSendMessage}
					handleKeyPress={handleKeyPress}
					isLoading={isLoading}
					onboardingState={onboardingState}
					context={context}
					job={job}
					inputRef={inputRef}
					onUploadClick={() => fileInputRef.current?.click()}
				/>
				</motion.div>
			</div>
		</div>
	)
}

export default ConversationalAI