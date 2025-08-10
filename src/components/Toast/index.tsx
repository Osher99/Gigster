import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

interface ToastProps {
	message: string
	type: 'success' | 'error'
	isVisible: boolean
	onHide: () => void
	duration?: number
}

const Toast: React.FC<ToastProps> = ({ 
	message, 
	type, 
	isVisible, 
	onHide, 
	duration = 2000 
}) => {
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => {
				onHide()
			}, duration)

			return () => clearTimeout(timer)
		}
		return undefined
	}, [isVisible, onHide, duration])

	const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'
	const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: -50, scale: 0.8 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -50, scale: 0.8 }}
					className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3`}
				>
					<Icon className="w-6 h-6" />
					<span className="font-semibold text-lg">{message}</span>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default Toast