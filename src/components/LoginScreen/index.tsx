import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
	EnvelopeIcon, 
	PaperAirplaneIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks'
import { sendOTPToEmail, clearAuthError } from '../../store/user-slice'

interface LoginScreenProps {
	onSkip?: () => void
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSkip }) => {
	const dispatch = useAppDispatch()
	const { isLoading, authError } = useAppSelector(state => state.user)
	const [email, setEmail] = useState('')
	const [emailSent, setEmailSent] = useState(false)
	const [emailError, setEmailError] = useState('')

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	const handleSendOTP = async () => {
		if (!email.trim()) {
			setEmailError('Please enter an email address')
			return
		}

		if (!validateEmail(email.trim())) {
			setEmailError('Please enter a valid email address')
			return
		}

		setEmailError('')
		dispatch(clearAuthError())

		try {
			await dispatch(sendOTPToEmail(email.trim())).unwrap()
			setEmailSent(true)
		} catch (error) {
			// Error is handled by Redux
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSendOTP()
		}
	}

	if (emailSent) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4"
			>
				<div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: 'spring' }}
					>
						<CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
					</motion.div>

					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Code Sent!
					</h1>

					<p className="text-gray-600 mb-6 leading-relaxed">
						We've sent a sign-in link to:
						<br />
						<span className="font-semibold text-blue-600">{email}</span>
					</p>

					<div className="bg-blue-50 p-4 rounded-lg mb-6">
						<p className="text-sm text-blue-800">
							💡 Check your email and click the link to sign in
						</p>
					</div>

					<button
						onClick={() => {
							setEmailSent(false)
							setEmail('')
						}}
						className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
					>
						← Back to send again
					</button>
				</div>
			</motion.div>
		)
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4"
		>
			<div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
				{/* Logo/Header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center mx-auto mb-4">
						<img 
							src="/gigster-logo.svg" 
							alt="Gigster Logo" 
							className="w-20 h-24 object-contain"
						/>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Gigster
					</h1>
					<p className="text-gray-600">
						Sign in to start swiping amazing jobs
					</p>
				</div>

				{/* Email Input */}
				<div className="space-y-4">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
							Email Address
						</label>
						<div className="relative">
							<EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value)
									setEmailError('')
									dispatch(clearAuthError())
								}}
								onKeyPress={handleKeyPress}
								placeholder="your.email@example.com"
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
								disabled={isLoading}
								dir="ltr"
							/>
						</div>
						{(emailError || authError) && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								className="mt-2 flex items-center text-red-600 text-sm"
							>
								<ExclamationTriangleIcon className="w-4 h-4 ml-1" />
								{emailError || authError}
							</motion.div>
						)}
					</div>

					{/* Send OTP Button */}
					<button
						onClick={handleSendOTP}
						disabled={isLoading || !email.trim()}
						className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
					>
						{isLoading ? (
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
						) : (
							<>
								<PaperAirplaneIcon className="w-5 h-5 mr-2" />
								Send Sign-in Link
							</>
						)}
					</button>

					{/* Info */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<p className="text-sm text-gray-600 text-center">
							We'll send you a one-time sign-in link via email
						</p>
					</div>

					{/* Skip Option */}
					{onSkip && (
						<button
							onClick={onSkip}
							className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
						>
							Continue without signing in
						</button>
					)}
				</div>
			</div>
		</motion.div>
	)
}

export default LoginScreen