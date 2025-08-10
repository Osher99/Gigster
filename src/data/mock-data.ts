import type { Job } from '../types/job'

export const mockJobs: Job[] = [
	{
		id: '1',
		title: 'Senior React Developer',
		company: 'TechCorp',
		companyLogo: 'https://images.unsplash.com/photo-1560472355-109703aa3edc?w=100&h=100&fit=crop&crop=center',
		location: 'Tel Aviv, Israel',
		commuteEstimate: '15 min drive',
		salary: '₪25,000 - ₪35,000',
		compellingHighlight: 'Generous Stock Options',
		description: 'We are looking for a skilled React developer to join our dynamic team. You will be responsible for developing and maintaining web applications using React, Redux, and modern JavaScript.',
		requirements: ['5+ years React experience', 'TypeScript', 'Redux/Zustand', 'Testing (Jest/RTL)'],
		benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Remote work', 'Professional development budget'],
		aboutCompany: 'TechCorp is a leading technology company focused on building innovative web solutions. We foster a culture of creativity and continuous learning.',
		tags: ['React', 'TypeScript', 'Frontend'],
		image: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'remote',
		experience: 'senior',
		isResumeRequired: true,
		postedAt: '2024-01-01'
	},
	{
		id: '2',
		title: 'Full Stack Developer',
		company: 'StartupXYZ',
		companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&crop=center',
		location: 'Haifa, Israel',
		commuteEstimate: '25 min drive',
		salary: '₪18,000 - ₪28,000',
		compellingHighlight: 'Equity Package',
		description: 'Join our fast-growing startup as a Full Stack Developer. Work with modern technologies including Node.js, React, and MongoDB.',
		requirements: ['3+ years experience', 'Node.js', 'React', 'MongoDB', 'RESTful APIs'],
		benefits: ['Equity package', 'Flexible hours', 'Learning budget', 'Free lunch', 'Startup culture'],
		aboutCompany: 'StartupXYZ is disrupting the fintech space with innovative solutions. Join our growing team and make a real impact.',
		tags: ['JavaScript', 'Node.js', 'MongoDB'],
		image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'hybrid',
		experience: 'mid',
		isResumeRequired: true,
		postedAt: '2024-01-02'
	},
	{
		id: '3',
		title: 'DevOps Engineer',
		company: 'CloudTech',
		companyLogo: 'https://images.unsplash.com/photo-1567069981692-5d3f4ba7154c?w=100&h=100&fit=crop&crop=center',
		location: 'Jerusalem, Israel',
		commuteEstimate: '30 min drive',
		salary: '₪22,000 - ₪32,000',
		compellingHighlight: 'Cloud-First Culture',
		description: 'Looking for a DevOps Engineer to help us scale our infrastructure. Experience with AWS, Docker, and Kubernetes required.',
		requirements: ['AWS/Azure experience', 'Docker & Kubernetes', 'CI/CD pipelines', 'Infrastructure as Code'],
		benefits: ['Cloud infrastructure budget', 'Remote work', 'Certification sponsorship', 'Cutting-edge tech stack'],
		aboutCompany: 'CloudTech specializes in cloud infrastructure solutions for enterprise clients. We work with the latest technologies.',
		tags: ['DevOps', 'AWS', 'Docker'],
		image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'remote',
		experience: 'mid',
		isResumeRequired: true,
		postedAt: '2024-01-03'
	},
	{
		id: '4',
		title: 'Junior Frontend Developer',
		company: 'WebStudio',
		location: 'Beer Sheva, Israel',
		salary: '₪12,000 - ₪18,000',
		description: 'Great opportunity for a junior developer to grow their skills in a supportive environment. Work with HTML, CSS, JavaScript, and React.',
		requirements: ['HTML/CSS/JavaScript', 'Basic React knowledge', 'Git', 'Responsive design'],
		tags: ['JavaScript', 'CSS', 'React'],
		image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'office',
		experience: 'entry',
		isResumeRequired: true,
		postedAt: '2024-01-04'
	},
	{
		id: '5',
		title: 'Backend Developer',
		company: 'DataFlow',
		location: 'Netanya, Israel',
		salary: '₪20,000 - ₪30,000',
		description: 'Backend developer needed for building scalable APIs and microservices. Python and Django experience preferred.',
		requirements: ['Python/Django', 'PostgreSQL', 'REST APIs', 'Microservices'],
		tags: ['Python', 'Django', 'API'],
		image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'hybrid',
		experience: 'mid',
		isResumeRequired: true,
		postedAt: '2024-01-05'
	},
	{
		id: '6',
		title: 'Elementary School Teacher',
		company: 'Sunshine Elementary',
		location: 'Tel Aviv, Israel',
		salary: '₪8,000 - ₪12,000',
		description: 'Passionate teacher needed to inspire young minds. Experience with modern teaching methods and classroom management required.',
		requirements: ['Teaching certificate', 'Bachelor degree', 'Classroom management', 'Patience with children'],
		tags: ['Education', 'Children', 'Teaching'],
		image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'office',
		experience: 'mid',
		isResumeRequired: true,
		postedAt: '2024-01-06'
	},
	{
		id: '7',
		title: 'Landscape Gardener',
		company: 'Green Gardens Ltd',
		location: 'Ramat Gan, Israel',
		salary: '₪7,000 - ₪11,000',
		description: 'Join our team of landscape professionals. Design and maintain beautiful gardens for residential and commercial clients.',
		requirements: ['Gardening experience', 'Physical fitness', 'Knowledge of plants', 'Valid driving license'],
		tags: ['Gardening', 'Outdoors', 'Design'],
		image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
		type: 'part-time',
		workLocation: 'office',
		experience: 'entry',
		isResumeRequired: false,
		postedAt: '2024-01-07'
	},
	{
		id: '8',
		title: 'Registered Nurse',
		company: 'City Medical Center',
		location: 'Jerusalem, Israel',
		salary: '₪14,000 - ₪20,000',
		description: 'Compassionate nurse needed for our medical center. Provide excellent patient care in a fast-paced environment.',
		requirements: ['Nursing license', 'Hospital experience', 'Patient care skills', 'Medical knowledge'],
		tags: ['Healthcare', 'Medical', 'Patient Care'],
		image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'office',
		experience: 'mid',
		isResumeRequired: true,
		postedAt: '2024-01-08'
	},
	{
		id: '9',
		title: 'Head Chef',
		company: 'Fine Dining Restaurant',
		location: 'Herzliya, Israel',
		salary: '₪15,000 - ₪25,000',
		description: 'Lead our kitchen team in creating exceptional culinary experiences. Mediterranean cuisine experience preferred.',
		requirements: ['Culinary degree', 'Kitchen management', 'Menu planning', 'Food safety certification'],
		tags: ['Cooking', 'Management', 'Culinary'],
		image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'office',
		experience: 'senior',
		isResumeRequired: true,
		postedAt: '2024-01-09'
	},
	{
		id: '10',
		title: 'Delivery Driver',
		company: 'Express Delivery',
		companyLogo: 'https://images.unsplash.com/photo-1614265068243-2dffbdc25ac3?w=100&h=100&fit=crop&crop=center',
		location: 'Ashdod, Israel',
		commuteEstimate: '20 min drive',
		salary: '₪6,000 - ₪10,000',
		compellingHighlight: 'Flexible Hours',
		description: 'Reliable driver needed for package delivery throughout the city. Flexible hours and competitive pay.',
		requirements: ['Valid driving license', 'Clean driving record', 'Customer service skills', 'Physical fitness'],
		benefits: ['Flexible schedule', 'Fuel allowance', 'Performance bonuses', 'Health insurance'],
		aboutCompany: 'Express Delivery is the leading package delivery service in Israel, known for fast and reliable service.',
		tags: ['Driving', 'Delivery', 'Customer Service'],
		image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
		type: 'part-time',
		workLocation: 'office',
		experience: 'entry',
		isResumeRequired: false,
		postedAt: '2024-01-10'
	},
	{
		id: '11',
		title: 'Hair Stylist',
		company: 'Style Studio',
		location: 'Eilat, Israel',
		salary: '₪8,000 - ₪15,000',
		description: 'Creative hair stylist wanted for busy salon. Experience with modern cutting techniques and color treatments.',
		requirements: ['Cosmetology license', 'Hair styling experience', 'Customer service', 'Creative flair'],
		tags: ['Beauty', 'Hair', 'Creative'],
		image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
		type: 'part-time',
		workLocation: 'office',
		experience: 'entry',
		isResumeRequired: false,
		postedAt: '2024-01-11'
	},
	{
		id: '12',
		title: 'Auto Mechanic',
		company: 'City Auto Repair',
		location: 'Haifa, Israel',
		salary: '₪12,000 - ₪18,000',
		description: 'Experienced mechanic needed for full-service auto repair shop. European and Asian vehicles specialty.',
		requirements: ['Automotive certification', 'Diagnostic tools experience', 'Problem solving', 'Physical stamina'],
		tags: ['Automotive', 'Repair', 'Technical'],
		image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop',
		type: 'full-time',
		workLocation: 'office',
		experience: 'mid',
		isResumeRequired: true,
		postedAt: '2024-01-12'
	}
]

// Add missing fields to remaining jobs that don't have them
mockJobs.forEach(job => {
	if (!('commuteEstimate' in job)) {
		job.commuteEstimate = '20-30 min drive'
	}
	if (!('compellingHighlight' in job)) {
		job.compellingHighlight = 'Great opportunity'
	}
	if (!('benefits' in job)) {
		job.benefits = ['Health insurance', 'Paid time off', 'Professional development']
	}
	if (!('aboutCompany' in job)) {
		job.aboutCompany = `${job.company} is a leading company in the ${job.tags[0]} industry, committed to excellence and innovation.`
	}
	if (!('isResumeRequired' in job)) {
		job.isResumeRequired = true
	}
}) 