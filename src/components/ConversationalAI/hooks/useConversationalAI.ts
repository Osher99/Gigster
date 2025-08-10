import { useState, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../../hooks/redux-hooks'
import type { Job } from '../../../types/job'
import { JobsService } from '../../../services/jobs.service'
import { AIService } from '../../../services/ai.service'
import { OnboardingAIService, type OnboardingState } from '../../../services/onboarding-ai.service'
import { UserDetectionService } from '../../../services/user-detection.service'
import { createOrUpdateProfile } from '../../../store/user-slice'
import { auth } from '../../../config/firebase'

export interface Message {
	id: string
	text: string
	sender: 'user' | 'ai'
	timestamp: Date
}

interface UseConversationalAIProps {
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

export const useConversationalAI = ({
	job,
	context,
	onClose,
	onApplicationSubmit,
	prefilledData
}: UseConversationalAIProps) => {
	const dispatch = useAppDispatch()
	const { firebaseProfile, isAuthenticated } = useAppSelector(state => state.user)
	const [messages, setMessages] = useState<Message[]>([])
	const [inputText, setInputText] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [showFileUpload, setShowFileUpload] = useState(false)
	
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

	// Handle mobile viewport issues
	useEffect(() => {
		// Set initial viewport height
		const setViewportHeight = () => {
			const vh = window.innerHeight * 0.01
			document.documentElement.style.setProperty('--vh', `${vh}px`)
		}
		
		setViewportHeight()
		
		// Prevent viewport resize on input focus for mobile
		const handleFocus = (e: FocusEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				// On mobile, prevent the keyboard from pushing the viewport
				if (window.innerWidth <= 768) {
					// Maintain scroll position
					const scrollY = window.scrollY
					setTimeout(() => {
						window.scrollTo(0, scrollY)
					}, 0)
				}
			}
		}
		
		// Add event listeners
		window.addEventListener('resize', setViewportHeight)
		document.addEventListener('focusin', handleFocus, { passive: false })
		
		return () => {
			window.removeEventListener('resize', setViewportHeight)
			document.removeEventListener('focusin', handleFocus)
		}
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

	return {
		// State
		messages,
		inputText,
		isLoading,
		onboardingState,
		showFileUpload,
		
		// Refs
		messagesEndRef,
		inputRef,
		fileInputRef,
		
		// Handlers
		setInputText,
		handleSendMessage,
		handleKeyPress,
		handleFileUpload,
		handleEditField,
		setShowFileUpload,
		
		// Context
		context,
		job
	}
}
