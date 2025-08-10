import { UserDetectionService } from './user-detection.service'
import type { Job } from '../types/job'

export interface OnboardingData {
	firstName: string
	lastName: string
	email: string
	resumeUrl?: string
}

export interface OnboardingState {
	step: 'ask_existing' | 'collecting' | 'confirming' | 'complete'
	data: OnboardingData
	validationErrors: string[]
	canProceed: boolean
	isExistingUser: boolean
}

export class OnboardingAIService {
	/**
	 * Validate email format
	 */
	static validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	/**
	 * Validate onboarding data
	 */
	static validateOnboardingState(data: OnboardingData): { isValid: boolean; errors: string[] } {
		const errors: string[] = []

		if (!data.firstName || data.firstName.trim().length < 2) {
			errors.push('First name is required (at least 2 characters)')
		}

		if (!data.lastName || data.lastName.trim().length < 2) {
			errors.push('Last name is required (at least 2 characters)')
		}

		if (!data.email || !this.validateEmail(data.email)) {
			errors.push('Valid email address is required')
		}

		return {
			isValid: errors.length === 0,
			errors
		}
	}

	/**
	 * Process user input and update onboarding state
	 */
	static async processOnboardingInput(
		userInput: string,
		currentState: OnboardingState,
		job: Job
	): Promise<{
		newState: OnboardingState
		response: string
		action?: 'proceed' | 'request_file' | 'confirm' | 'complete' | 'send_otp'
	}> {
		const input = userInput.toLowerCase().trim()
		const newState = { ...currentState }
		let response = ''
		let action: 'proceed' | 'request_file' | 'confirm' | 'complete' | 'send_otp' | undefined

		switch (currentState.step) {
			case 'ask_existing':
				if (input.includes('yes')) {
					response = "Please enter your email address:"
					newState.step = 'collecting'
				} else {
					response = "Let's get you registered! What's your email address?"
					newState.step = 'collecting'
				}
				break

			case 'collecting':
				// Simple data extraction
				if (input.includes('@')) {
					newState.data.email = userInput.trim()
					response = "Great! What's your first name?"
				} else if (newState.data.email && !newState.data.firstName) {
					newState.data.firstName = userInput.trim()
					response = "And your last name?"
				} else if (newState.data.firstName && !newState.data.lastName) {
					newState.data.lastName = userInput.trim()
					
					const validation = this.validateOnboardingState(newState.data)
					if (validation.isValid) {
						response = "Perfect! Ready to apply? Type 'yes' to submit."
						newState.step = 'confirming'
						action = 'confirm'
					} else {
						response = "Please provide all required information."
					}
				}
				break

			case 'confirming':
				if (input.includes('yes') || input.includes('apply') || input.includes('submit')) {
					// Save user data
					UserDetectionService.saveUser({
						email: newState.data.email,
						firstName: newState.data.firstName,
						lastName: newState.data.lastName,
						resumeUrl: newState.data.resumeUrl
					})
					UserDetectionService.setCurrentUser({
						email: newState.data.email,
						firstName: newState.data.firstName,
						lastName: newState.data.lastName,
						resumeUrl: newState.data.resumeUrl || '',
						lastLogin: new Date().toISOString()
					})
					
					response = "🎉 Application submitted! Moving to next job..."
					newState.step = 'complete'
					action = 'complete'
				} else {
					response = "No problem! Let me know when you're ready to apply."
				}
				break

			default:
				response = "I'm not sure how to help with that. Let's start over."
				newState.step = 'ask_existing'
		}

		return { newState, response, action }
	}
}
