import React from 'react'
import { DocumentIcon } from '@heroicons/react/24/outline'

interface FileUploadSectionProps {
	onUploadClick: () => void
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ onUploadClick }) => {
	return (
		<div className="p-4 border-t border-gray-200 bg-blue-50">
			<div className="text-center">
				<DocumentIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
				<p className="text-sm text-gray-700 mb-3">Upload your resume</p>
				<button
					onClick={onUploadClick}
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				>
					Choose File
				</button>
				<p className="text-xs text-gray-500 mt-2">PDF or Word document, max 5MB</p>
			</div>
		</div>
	)
}

export default FileUploadSection
