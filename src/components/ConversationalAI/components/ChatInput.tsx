import React from 'react'
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { Job } from '../../../types/job'
import type { OnboardingState } from '../../../services/onboarding-ai.service'

interface ChatInputProps {
	inputText: string
	setInputText: (text: string) => void
	handleSendMessage: () => void
	handleKeyPress: (e: React.KeyboardEvent) => void
	isLoading: boolean
	onboardingState: OnboardingState
	context: 'job_qa' | 'onboarding'
	job?: Job
	inputRef: React.RefObject<HTMLInputElement | null>
	onUploadClick: () => void
}

const ChatInput: React.FC<ChatInputProps> = ({
	inputText,
	setInputText,
	handleSendMessage,
	handleKeyPress,
	isLoading,
	onboardingState,
	context,
	job,
	inputRef,
	onUploadClick
}) => {
	const isDisabled = isLoading || onboardingState.step === 'complete'
	const showResumeButton = context === 'onboarding' && job?.isResumeRequired && !onboardingState.data.resumeUrl

	return (
		<div 
			className="p-4 border-t border-gray-200 bg-white" 
			style={{ 
				paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
				position: 'relative',
				zIndex: 10,
				backgroundColor: 'white',
				flexShrink: 0
			}}
		>
			<div className="flex items-center space-x-2">
				<input
					ref={inputRef}
					type="text"
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Type your message..."
					className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
					style={{ fontSize: '16px' }}
					disabled={isDisabled}
				/>
				{showResumeButton && (
					<button
						onClick={onUploadClick}
						className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors"
						title="Upload Resume"
					>
						<PlusIcon className="w-5 h-5" />
					</button>
				)}
				<button
					onClick={handleSendMessage}
					disabled={!inputText.trim() || isDisabled}
					className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
				>
					<PaperAirplaneIcon className="w-5 h-5" />
				</button>
			</div>
		</div>
	)
}

export default ChatInput
