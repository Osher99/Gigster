import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
	onClick: () => void
	children: React.ReactNode
	variant?: 'primary' | 'secondary' | 'danger' | 'success'
	size?: 'sm' | 'md' | 'lg'
	className?: string
	ariaLabel?: string
	title?: string
	type?: 'button' | 'submit' | 'reset'
}

const Button: React.FC<ButtonProps> = ({
	onClick,
	children,
	variant = 'primary',
	size = 'md',
	className = '',
	ariaLabel,
	title,
	type = 'button'
}) => {
	const baseClasses = 'flex items-center justify-center rounded-full transition-colors'
	
	const variantClasses = {
		primary: 'bg-blue-500 hover:bg-blue-600 text-white',
		secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
		danger: 'bg-red-500 hover:bg-red-600 text-white',
		success: 'bg-green-500 hover:bg-green-600 text-white'
	}
	
	const sizeClasses = {
		sm: 'w-8 h-8',
		md: 'w-10 h-10',
		lg: 'w-12 h-12'
	}

	return (
		<motion.button
			onClick={onClick}
			className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} shadow-lg ${className}`}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			type={type}
			aria-label={ariaLabel}
			title={title}
		>
			{children}
		</motion.button>
	)
}

export default Button 