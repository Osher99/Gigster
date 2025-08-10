import { useState, useRef, useCallback, useEffect } from 'react'
import type { UseSwipeOptions, UseSwipeReturn } from '../types/job'

export const useSwipe = ({
	onSwipeLeft,
	onSwipeRight,
	onTap,
	threshold = 100,
	preventDefaultTouchmoveEvent = false,
	delta = 10
}: UseSwipeOptions): UseSwipeReturn => {
	const [isSwiping, setIsSwiping] = useState<boolean>(false)
	const [swipeDistance, setSwipeDistance] = useState<number>(0)
	const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const currentPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const isDragging = useRef<boolean>(false)
	const elementRef = useRef<HTMLElement | null>(null)

	const handleTouchStart = useCallback((e: React.TouchEvent): void => {
		const touch = e.touches[0]
		if (!touch) return
		
		startPos.current = { x: touch.clientX, y: touch.clientY }
		currentPos.current = { x: touch.clientX, y: touch.clientY }
		setIsSwiping(true)
		setSwipeDistance(0)
		isDragging.current = true
	}, [])

	const handleTouchMove = useCallback((e: React.TouchEvent): void => {
		if (!isSwiping || !isDragging.current) return

		const touch = e.touches[0]
		if (!touch) return
		
		currentPos.current = { x: touch.clientX, y: touch.clientY }
		
		const deltaX = currentPos.current.x - startPos.current.x
		setSwipeDistance(deltaX)
	}, [isSwiping])

	const handleTouchEnd = useCallback((): void => {
		if (!isSwiping) return

		const deltaX = currentPos.current.x - startPos.current.x
		const deltaY = currentPos.current.y - startPos.current.y

		// Check if this was a tap (minimal movement)
		const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
		
		if (totalMovement < delta && onTap) {
			onTap()
		} else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > delta) {
			// Check if horizontal swipe is more significant than vertical
			if (deltaX > threshold && onSwipeRight) {
				onSwipeRight()
			} else if (deltaX < -threshold && onSwipeLeft) {
				onSwipeLeft()
			}
		}

		setIsSwiping(false)
		setSwipeDistance(0)
		isDragging.current = false
	}, [isSwiping, threshold, delta, onSwipeLeft, onSwipeRight, onTap])

	// Mouse events for desktop support
	const handleMouseDown = useCallback((e: React.MouseEvent): void => {
		e.preventDefault()
		startPos.current = { x: e.clientX, y: e.clientY }
		currentPos.current = { x: e.clientX, y: e.clientY }
		setIsSwiping(true)
		setSwipeDistance(0)
		isDragging.current = true
	}, [])

	// Global mouse move and up handlers for better UX
	useEffect(() => {
		const handleGlobalMouseMove = (e: MouseEvent): void => {
			if (!isSwiping || !isDragging.current) return

			e.preventDefault()
			currentPos.current = { x: e.clientX, y: e.clientY }
			const deltaX = currentPos.current.x - startPos.current.x
			setSwipeDistance(deltaX)
		}

		const handleGlobalMouseUp = (): void => {
			if (!isSwiping) return

			const deltaX = currentPos.current.x - startPos.current.x
			const deltaY = currentPos.current.y - startPos.current.y

			// Check if this was a tap (minimal movement)
			const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
			
			if (totalMovement < delta && onTap) {
				onTap()
			} else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > delta) {
				if (deltaX > threshold && onSwipeRight) {
					onSwipeRight()
				} else if (deltaX < -threshold && onSwipeLeft) {
					onSwipeLeft()
				}
			}

			setIsSwiping(false)
			setSwipeDistance(0)
			isDragging.current = false
		}

		if (isSwiping && isDragging.current) {
			document.addEventListener('mousemove', handleGlobalMouseMove)
			document.addEventListener('mouseup', handleGlobalMouseUp)
		}

		return (): void => {
			document.removeEventListener('mousemove', handleGlobalMouseMove)
			document.removeEventListener('mouseup', handleGlobalMouseUp)
		}
	}, [isSwiping, threshold, delta, onSwipeLeft, onSwipeRight, onTap])

	// Add passive: false to touch events when preventDefaultTouchmoveEvent is enabled
	useEffect(() => {
		if (!preventDefaultTouchmoveEvent) return

		const handleTouchMovePassive = (e: TouchEvent): void => {
			if (!isSwiping || !isDragging.current) return
			e.preventDefault()
		}

		const element = elementRef.current
		if (element) {
			element.addEventListener('touchmove', handleTouchMovePassive, { passive: false })
			
			return (): void => {
				element.removeEventListener('touchmove', handleTouchMovePassive)
			}
		}

		// Return empty cleanup function if element is not available
		return (): void => {}
	}, [isSwiping, preventDefaultTouchmoveEvent])

	const swipeHandlers = {
		onTouchStart: handleTouchStart,
		onTouchMove: handleTouchMove,
		onTouchEnd: handleTouchEnd,
		onMouseDown: handleMouseDown,
		ref: (el: HTMLElement | null) => {
			elementRef.current = el
		}
	}

	return {
		swipeHandlers,
		isSwiping,
		swipeDistance
	}
} 