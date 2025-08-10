import React from 'react'
import { useSwipe } from '../../../hooks/useSwipe'
import type { Job } from '../../../types/job'

interface UseJobCardProps {
	job: Job | null
	onSwipeLeft: () => void
	onSwipeRight: () => void
	onTap?: () => void
	isTopCard?: boolean
}

export const useJobCard = ({ job, onSwipeLeft, onSwipeRight, onTap, isTopCard = false }: UseJobCardProps) => {
	const { swipeHandlers, swipeDistance } = useSwipe({
		onSwipeLeft,
		onSwipeRight,
		onTap,
		threshold: 100,
		preventDefaultTouchmoveEvent: true
	})

	// Calculate rotation and opacity based on swipe distance
	const rotation = swipeDistance * 0.05
	const opacity = Math.max(0.1, 1 - Math.abs(swipeDistance) / 400)

	// Show swipe indicators with larger threshold
	const showLikeIndicator = swipeDistance > 30
	const showRejectIndicator = swipeDistance < -30

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
		const target = e.target as HTMLImageElement
		target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
	}

	// Work location indicator functions - return config instead of JSX
	const getWorkLocationIconType = () => {
		if (!job) return 'office'
		
		switch (job.workLocation) {
			case 'remote':
				return 'remote'
			case 'hybrid':
				return 'hybrid'
			case 'office':
				return 'office'
			default:
				return 'office'
		}
	}

	const getWorkLocationText = () => {
		if (!job) return 'Office'
		
		switch (job.workLocation) {
			case 'remote':
				return 'Remote'
			case 'hybrid':
				return 'Hybrid'
			case 'office':
				return 'Office Only'
			default:
				return 'Office'
		}
	}

	const getWorkLocationColor = () => {
		if (!job) return 'text-gray-300'
		
		switch (job.workLocation) {
			case 'remote':
				return 'text-blue-400'
			case 'hybrid':
				return 'text-purple-400'
			case 'office':
				return 'text-gray-300'
			default:
				return 'text-gray-300'
		}
	}

	return {
		// Swipe related
		swipeHandlers,
		swipeDistance,
		rotation,
		opacity: isTopCard ? opacity : 0.8,
		
		// Indicators
		showLikeIndicator,
		showRejectIndicator,
		
		// Handlers
		handleImageError,
		
		// Work location
		workLocationIconType: getWorkLocationIconType(),
		workLocationText: getWorkLocationText(),
		workLocationColor: getWorkLocationColor()
	}
} 