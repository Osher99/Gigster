import React from 'react'
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { OnboardingState } from '../../../services/onboarding-ai.service'
import type { Job } from '../../../types/job'

interface OnboardingSummaryProps {
	onboardingState: OnboardingState
	job?: Job
	onEditField: (field: 'name' | 'email') => void
	onUploadClick: () => void
}

const OnboardingSummary: React.FC<OnboardingSummaryProps> = ({
	onboardingState,
	job,
	onEditField,
	onUploadClick
}) => {
	if (onboardingState.step === 'complete') {
		return null
	}

	return (
		<div className="p-4 border-t border-gray-100 bg-gray-50" style={{ flexShrink: 0 }}>
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
							onClick={() => onEditField('name')}
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
							onClick={() => onEditField('email')}
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
								onClick={onUploadClick}
								className="text-green-600 hover:text-green-700"
							>
								<PlusIcon className="w-4 h-4" />
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default OnboardingSummary
