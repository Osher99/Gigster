import type { Job } from '../types/job'

export const mockJobs: Job[] = [
	{
		id: '1',
		title: 'Senior Frontend Developer',
		company: 'TechCorp',
		location: 'San Francisco, CA',
		salary: '$120,000 - $150,000',
		description: 'Join our team as a Senior Frontend Developer and help build the next generation of web applications.',
		tags: ['React', 'TypeScript', 'CSS', 'JavaScript'],
		image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
		workLocation: 'hybrid',
		compellingHighlight: 'Equity package included',
	},
	{
		id: '2',
		title: 'Full Stack Engineer',
		company: 'StartupCo',
		location: 'Remote',
		salary: '$90,000 - $120,000',
		description: 'Work on cutting-edge technology in a fast-paced startup environment.',
		tags: ['Node.js', 'React', 'MongoDB', 'AWS'],
		image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
		workLocation: 'remote',
		compellingHighlight: 'Flexible working hours',
	},
]