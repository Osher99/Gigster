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

	return (
		<motion.div
			initial={{ y: '100%' }}
			animate={{ y: 0 }}
			exit={{ y: '100%' }}
			transition={{ type: 'spring', damping: 25, stiffness: 200 }}
			className="fixed inset-0 bg-white z-50 flex flex-col"
			style={{ height: 'calc(var(--vh, 1vh) * 100)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
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
	)
}

export default ConversationalAI