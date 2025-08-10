/**
 * Generate a consistent match score for a job based on its ID
 * This ensures the same job always shows the same match percentage
 */
export function getJobMatchScore(jobId: string): number {
	// Create a simple hash from the job ID
	let hash = 0
	for (let i = 0; i < jobId.length; i++) {
		const char = jobId.charCodeAt(i)
		hash = ((hash << 5) - hash) + char
		hash = hash & hash // Convert to 32-bit integer
	}
	
	// Convert to positive number and get a value between 60-100
	const positiveHash = Math.abs(hash)
	const matchScore = 60 + (positiveHash % 41) // 60-100 range
	
	return matchScore
}
