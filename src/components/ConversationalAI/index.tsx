import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
	XMarkIcon, 
	PaperAirplaneIcon,
	UserIcon,
	ComputerDesktopIcon,
	PlusIcon,
	DocumentIcon,
	PencilIcon
} from '@heroicons/react/24/outline'
import type { Job } from '../../types/job'
import { useAppSelector, useAppDispatch } from '../../hooks/redux-hooks'
import { JobsService } from '../../services/jobs.service'
import { AIService } from '../../services/ai.service'
import { OnboardingAIService, type OnboardingState } from '../../services/onboarding-ai.service'
import { UserDetectionService } from '../../services/user-detection.service'
import { createOrUpdateProfile } from '../../store/user-slice'
import { auth } from '../../config/firebase'

interface Message {
	id: string
	text: string
	sender: 'user' | 'ai'
	timestamp: Date
}

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

const ConversationalAI: React.FC<ConversationalAIProps> = ({
	job,
	context,
	onClose,
	onApplicationSubmit,
	prefilledData
}) => {
	const dispatch = useAppDispatch()
	const { firebaseProfile, isAuthenticated } = useAppSelector(state => state.user)
	const [messages, setMessages] = useState<Message[]>([])
	const [inputText, setInputText] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	// Check if user is already logged in
	const currentUser = UserDetectionService.getCurrentUser()
	
	const [onboardingState, setOnboardingState] = useState<OnboardingState>({
		step: currentUser ? 'confirming' : 'ask_existing',
		data: {
			firstName: currentUser?.firstName || prefilledData?.firstName || firebaseProfile?.firstName || '',
			lastName: currentUser?.lastName || prefilledData?.lastName || firebaseProfile?.lastName || '',
			email: currentUser?.email || prefilledData?.email || firebaseProfile?.email || '',
			resumeUrl: currentUser?.resumeUrl || prefilledData?.resumeUrl || firebaseProfile?.resumeUrl || ''
		},
		validationErrors: [],
		canProceed: currentUser ? true : false,
		isExistingUser: !!currentUser
	})
	const [showFileUpload, setShowFileUpload] = useState(false)
	
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const isInitialized = useRef(false)

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// Focus input on mount
	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	// Initialize conversation based on context
	useEffect(() => {
		if (isInitialized.current) return // Prevent duplicate initialization
		
		const initializeConversation = async () => {
			if (context === 'job_qa' && job) {
				addAIMessage(`Hi! I'm here to help you learn more about the ${job.title} position at ${job.company}. What would you like to know?`)
			} else if (context === 'onboarding' && job) {
				// Check if user is already logged in
				if (currentUser) {
					addAIMessage(`Hi ${currentUser.firstName}! Ready to apply for the ${job.title} position at ${job.company}? Type 'yes' to submit your application.`)
				} else {
					addAIMessage(`Hi! Are you already registered with Gigster?`)
				}
			}
			isInitialized.current = true
		}
		
		initializeConversation()
	}, [context, job])

	const addAIMessage = (text: string) => {
		const message: Message = {
			id: Date.now().toString(),
			text,
			sender: 'ai',
			timestamp: new Date()
		}
		setMessages(prev => [...prev, message])
	}

	const addUserMessage = (text: string) => {
		const message: Message = {
			id: Date.now().toString(),
			text,
			sender: 'user',
			timestamp: new Date()
		}
		setMessages(prev => [...prev, message])
	}

	const getAIResponse = async (userInput: string): Promise<string> => {
		if (context === 'job_qa' && job) {
			// Use real AI for job-specific questions
			return await AIService.askAboutJob(userInput, job)
		} else {
			// Use general AI response for other contexts
			return await AIService.generalResponse(userInput)
		}
	}

	const handleOnboardingFlow = async (userInput: string) => {
		if (!job) return

		try {
			setIsLoading(true)
			
			// Process user input with AI
			const result = await OnboardingAIService.processOnboardingInput(
				userInput, 
				onboardingState, 
				job
			)
			
			// Update state
			setOnboardingState(result.newState)
			
			// Add AI response
			addAIMessage(result.response)
			
			// Handle special actions
			if (result.action === 'request_file') {
				setShowFileUpload(true)
			} else if (result.action === 'confirm') {
				setOnboardingState((prev: OnboardingState) => ({ ...prev, step: 'confirming' }))
			} else if (result.action === 'send_otp') {
				// OTP sent, waiting for verification
				console.log('OTP sent to user')
			} else if (result.action === 'complete') {
				await handleApplicationSubmission()
			}
			
		} catch (error) {
			console.error('Error in onboarding flow:', error)
			addAIMessage('I apologize, but I encountered an error. Could you please try again?')
		} finally {
			setIsLoading(false)
		}
	}

	const handleApplicationSubmission = async () => {
		if (!job) return
		
		try {
			addAIMessage('🎉 Submitting your application...')
			
			// Prepare user data
			const userData = {
				firstName: onboardingState.data.firstName,
				lastName: onboardingState.data.lastName,
				email: onboardingState.data.email,
				resumeUrl: onboardingState.data.resumeUrl || ''
			}
			
			// Submit to Firebase if user is authenticated and job exists
			if (isAuthenticated && auth.currentUser) {
				await JobsService.submitApplication(auth.currentUser.uid, job, userData)
				
				// Update Firebase profile if needed
				if (firebaseProfile && !firebaseProfile.isComplete) {
					await dispatch(createOrUpdateProfile({
						user: auth.currentUser,
						profileData: {
							firstName: userData.firstName,
							lastName: userData.lastName,
							resumeUrl: userData.resumeUrl,
							isComplete: true
						}
					})).unwrap()
				}
			}
			
			addAIMessage('🎉 Application submitted successfully! Moving to next job...')
			setOnboardingState((prev: OnboardingState) => ({ ...prev, step: 'complete' }))
			onApplicationSubmit?.(userData)
			
			// Close immediately and go to next job
			setTimeout(() => {
				onClose()
			}, 1500)
		} catch (error: any) {
			addAIMessage('Sorry, there was an error submitting your application. Please try again.')
			console.error('Error submitting application:', error)
		}
	}

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			// Validate file type and size
			const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
			const maxSize = 5 * 1024 * 1024 // 5MB
			
			if (!allowedTypes.includes(file.type)) {
				addAIMessage('Please upload a PDF or Word document for your resume.')
				return
			}
			
			if (file.size > maxSize) {
				addAIMessage('File size should be less than 5MB. Please choose a smaller file.')
				return
			}
			
			setOnboardingState((prev: OnboardingState) => ({
				...prev,
				data: { ...prev.data, resumeFile: file, resumeUrl: file.name }
			}))
			
			addAIMessage(`Great! I've received your resume: ${file.name}. Ready to submit your application?`)
			setShowFileUpload(false)
			setOnboardingState((prev: OnboardingState) => ({ ...prev, step: 'confirming' }))
		}
	}

	const handleEditField = (field: 'name' | 'email') => {
		const currentValue = field === 'name' 
			? `${onboardingState.data.firstName} ${onboardingState.data.lastName}`.trim()
			: onboardingState.data.email
			
		addAIMessage(`Current ${field}: ${currentValue}. What would you like to change it to?`)
		
		// Reset validation errors for this field
		setOnboardingState((prev: OnboardingState) => ({
			...prev,
			validationErrors: prev.validationErrors.filter((error: string) => 
				field === 'name' ? error !== 'name' : error !== 'email'
			)
		}))
	}

	const handleSendMessage = async () => {
		if (!inputText.trim()) return

		const userInput = inputText.trim()
		addUserMessage(userInput)
		setInputText('')
		setIsLoading(true)

		// Keep focus on input
		setTimeout(() => {
			inputRef.current?.focus()
		}, 100)

		if (context === 'onboarding') {
			await handleOnboardingFlow(userInput)
		} else {
			try {
				const response = await getAIResponse(userInput)
				addAIMessage(response)
			} catch (error) {
				console.error('Error getting AI response:', error)
				addAIMessage('Sorry, I encountered an error. Let\'s try again.')
			} finally {
				setIsLoading(false)
			}
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	return (
		<motion.div
			initial={{ y: '100%' }}
			animate={{ y: 0 }}
			exit={{ y: '100%' }}
			transition={{ type: 'spring', damping: 25, stiffness: 200 }}
			className="fixed inset-0 bg-white z-50 flex flex-col"
		>
			{/* Header */}
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

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				<AnimatePresence>
					{messages.map((message) => (
						<motion.div
							key={message.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
						>
							<div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
								<div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
									message.sender === 'user' 
										? 'bg-blue-600' 
										: 'bg-gray-100'
								}`}>
									{message.sender === 'user' ? (
										<UserIcon className="w-5 h-5 text-white" />
									) : (
										<ComputerDesktopIcon className="w-5 h-5 text-gray-600" />
									)}
								</div>
								<div className={`px-4 py-2 rounded-2xl ${
									message.sender === 'user'
										? 'bg-blue-600 text-white'
										: 'bg-gray-100 text-gray-900'
								}`}>
									<p className="text-sm">{message.text}</p>
								</div>
							</div>
						</motion.div>
					))}
				</AnimatePresence>
				
				{isLoading && (
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
				)}
				
				<div ref={messagesEndRef} />
			</div>

			{/* Onboarding Data Summary - Only show during onboarding */}
			{context === 'onboarding' && onboardingState.step !== 'complete' && (
				<div className="p-4 border-t border-gray-100 bg-gray-50">
					<h4 className="text-sm font-medium text-gray-700 mb-3">Application Details</h4>
					<div className="space-y-2">
						{/* Name */}
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<span className="text-sm text-gray-600">Name:</span>
								<span className={`text-sm ${onboardingState.data.firstName ? 'text-gray-900' : 'text-gray-400'}`}>
									{onboardingState.data.firstName 
										? `${onboardingState.data.firstName} ${onboardingState.data.lastName || ''}`.trim()
										: 'Not provided'
									}
								</span>
								{onboardingState.validationErrors.includes('name') && (
									<span className="text-xs text-red-500">• Invalid</span>
								)}
							</div>
							{onboardingState.data.firstName && (
								<button
									onClick={() => handleEditField('name')}
									className="text-blue-600 hover:text-blue-700"
								>
									<PencilIcon className="w-4 h-4" />
								</button>
							)}
						</div>

						{/* Email */}
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<span className="text-sm text-gray-600">Email:</span>
								<span className={`text-sm ${onboardingState.data.email ? 'text-gray-900' : 'text-gray-400'}`}>
									{onboardingState.data.email || 'Not provided'}
								</span>
								{onboardingState.validationErrors.includes('email') && (
									<span className="text-xs text-red-500">• Invalid format</span>
								)}
							</div>
							{onboardingState.data.email && (
								<button
									onClick={() => handleEditField('email')}
									className="text-blue-600 hover:text-blue-700"
								>
									<PencilIcon className="w-4 h-4" />
								</button>
							)}
						</div>

						{/* Resume */}
						{job?.isResumeRequired && (
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<span className="text-sm text-gray-600">Resume:</span>
									<span className={`text-sm ${onboardingState.data.resumeUrl ? 'text-gray-900' : 'text-gray-400'}`}>
										{onboardingState.data.resumeUrl || 'Not provided'}
									</span>
								</div>
								{!onboardingState.data.resumeUrl && (
									<button
										onClick={() => fileInputRef.current?.click()}
										className="text-green-600 hover:text-green-700"
									>
										<PlusIcon className="w-4 h-4" />
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			)}

			{/* File Upload Interface */}
			{showFileUpload && (
				<div className="p-4 border-t border-gray-200 bg-blue-50">
					<div className="text-center">
						<DocumentIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
						<p className="text-sm text-gray-700 mb-3">Upload your resume</p>
						<button
							onClick={() => fileInputRef.current?.click()}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
						>
							Choose File
						</button>
						<p className="text-xs text-gray-500 mt-2">PDF or Word document, max 5MB</p>
					</div>
				</div>
			)}

			{/* Hidden File Input */}
			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,.doc,.docx"
				onChange={handleFileUpload}
				className="hidden"
			/>

			{/* Input */}
			<div className="p-4 border-t border-gray-200 bg-white">
				<div className="flex items-center space-x-2">
					<input
						ref={inputRef}
						type="text"
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Type your message..."
						className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						disabled={isLoading || onboardingState.step === 'complete'}
					/>
					{context === 'onboarding' && job?.isResumeRequired && !onboardingState.data.resumeUrl && (
						<button
							onClick={() => fileInputRef.current?.click()}
							className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors"
							title="Upload Resume"
						>
							<PlusIcon className="w-5 h-5" />
						</button>
					)}
					<button
						onClick={handleSendMessage}
						disabled={!inputText.trim() || isLoading || onboardingState.step === 'complete'}
						className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
					>
						<PaperAirplaneIcon className="w-5 h-5" />
					</button>
				</div>
			</div>
		</motion.div>
	)
}

export default ConversationalAI