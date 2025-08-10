import React from 'react'
import Header from '../components/Header'
import JobStack from '../components/JobStack'

interface SwipePageProps {
	onSwipeAction?: (action: 'like' | 'dislike') => void
}

const SwipePage: React.FC<SwipePageProps> = ({ onSwipeAction }) => {
	return (
		<div className="fixed inset-0 bg-gray-100 overflow-hidden flex flex-col" style={{ backgroundColor: '#f3f4f6' }}>
			<Header onSwipeAction={onSwipeAction} />
			
			{/* Job cards container - takes remaining space */}
			<div className="flex-1 overflow-hidden relative" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
				<JobStack {...(onSwipeAction && { onSwipeAction })} />
			</div>
		</div>
	)
}

export default SwipePage 