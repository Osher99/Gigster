import React from 'react'

interface AIIconProps {
	className?: string
}

const AIIcon: React.FC<AIIconProps> = ({ className = "w-5 h-5" }) => {
	return (
		<svg 
			className={className}
			viewBox="0 0 24 24" 
			fill="none" 
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{stopColor: '#8B5CF6', stopOpacity: 1}} />
					<stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
				</linearGradient>
			</defs>
			
			{/* Main stars */}
			<path 
				d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" 
				fill="url(#aiGradient)"
			/>
			
			{/* Small decorative stars */}
			<path 
				d="M6 4L6.5 5.5L8 6L6.5 6.5L6 8L5.5 6.5L4 6L5.5 5.5L6 4Z" 
				fill="url(#aiGradient)"
				opacity="0.7"
			/>
			
			<path 
				d="M18 16L18.5 17.5L20 18L18.5 18.5L18 20L17.5 18.5L16 18L17.5 17.5L18 16Z" 
				fill="url(#aiGradient)"
				opacity="0.7"
			/>
			
			<path 
				d="M20 4L20.3 4.7L21 5L20.3 5.3L20 6L19.7 5.3L19 5L19.7 4.7L20 4Z" 
				fill="url(#aiGradient)"
				opacity="0.5"
			/>
		</svg>
	)
}

export default AIIcon