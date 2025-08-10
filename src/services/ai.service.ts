// Environment variables are handled by Vite automatically
export class AIService {
    static API_URL = "https://api.groq.com/openai/v1/chat/completions";
    // Add the API key to .env file
    static API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
    /**
   * Create job-specific prompt
   */
    static createJobPrompt(job: any) {
        return `You are a helpful AI assistant helping users learn about job opportunities. 
You are currently discussing this specific job:

**Job Title:** ${job.title}
**Company:** ${job.company}
**Location:** ${job.location}
**Work Type:** ${job.workLocation || "Office-based"}
**Salary:** ${job.salary}
**Requirements:** ${job.requirements.join(", ")}
${job.benefits ? `**Benefits:** ${job.benefits.join(", ")}` : ""}
${job.aboutCompany ? `**About Company:** ${job.aboutCompany}` : ""}
${job.description ? `**Job Description:** ${job.description}` : ""}

Instructions:
- Answer questions specifically about this job
- Be helpful, friendly, and encouraging
- If you don't have specific information, suggest they ask during the interview
- Keep responses concise but informative
- Focus on helping the user understand if this role is a good fit
- Always respond in English

Please answer the user's question about this job position.`;
    }
    /**
   * Auto-correct common typos and improve question quality
   */
    static improveQuestion(question: any) {
        let improved = question.trim();
        const corrections = {
            "salery": "salary",
            "benifits": "benefits",
            "requirments": "requirements",
            "responsiblities": "responsibilities",
            "expirience": "experience",
            "oppurtunity": "opportunity",
            "compnay": "company",
            "loaction": "location",
            "wrk": "work",
            "hw": "how",
            "wat": "what",
            "wen": "when",
            "wher": "where",
            "teh": "the",
            "adn": "and",
            "tehm": "them",
            "yor": "your",
            "u": "you",
            "ur": "your",
            "r": "are",
            "n": "and",
            "&": "and"
        };
        Object.entries(corrections).forEach( ([typo,correct]) => {
            const regex = new RegExp(`\\b${typo}\\b`,"gi");
            improved = improved.replace(regex, correct);
        }
        );
        if (improved.match(/^(what|how|when|where|why|who|is|are|can|do|does|will|would|should)/i) && !improved.endsWith("?")) {
            improved += "?";
        }
        return improved;
    }
    /**
   * Send question to AI with job context
   */
    static async askAboutJob(question: any, job: any) {
        try {
            const improvedQuestion = this.improveQuestion(question);
            console.log("🔧 Original question:", question);
            if (improvedQuestion !== question) {
                console.log("✨ Improved question:", improvedQuestion);
            }
            console.log("🔑 API Key status:", {
                hasKey: !!this.API_KEY,
                keyLength: this.API_KEY?.length || 0,
                keyPrefix: this.API_KEY?.substring(0, 8) || "none"
            });
            if (!this.API_KEY) {
                console.log("❌ No API key found - using enhanced fallback");
                return `[FALLBACK MODE - No API Key] ${this.getEnhancedFallbackResponse(improvedQuestion, job)}`;
            }
            const messages = [{
                role: "system",
                content: this.createJobPrompt(job)
            }, {
                role: "user",
                content: improvedQuestion
            }];
            console.log("🤖 Sending request to AI:", {
                question: improvedQuestion,
                jobTitle: job.title,
                url: this.API_URL,
                model: "llama-3.3-70b-versatile"
            });
            const requestBody = {
                model: "llama-3.3-70b-versatile",
                messages,
                max_tokens: 600,
                temperature: 0.7,
                stop: null
            };
            console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });
            console.log("📥 Response status:", response.status, response.statusText);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ AI API Error:", response.status, response.statusText, errorText);
                if (response.status === 401) {
                    console.error("🔑 Invalid API key - check your Groq API key");
                    return `I apologize, but there seems to be an authentication issue with the AI service. Let me help you with some basic information about this ${job.title} position:

${this.getEnhancedFallbackResponse(improvedQuestion, job)}`;
                }
                if (response.status === 429) {
                    return `I'm experiencing high demand right now. Here's what I can tell you about this ${job.title} position: ${this.getEnhancedFallbackResponse(improvedQuestion, job)}`;
                }
                return this.getEnhancedFallbackResponse(improvedQuestion, job);
            }
            const data = await response.json();
            console.log("📊 Full API Response:", JSON.stringify(data, null, 2));
            const aiResponse = data.choices[0]?.message?.content;
            if (!aiResponse) {
                console.error("❌ No response content from AI - choices:", data.choices);
                return `[GROQ API ERROR - No Content] ${this.getEnhancedFallbackResponse(improvedQuestion, job)}`;
            }
            console.log("✅ AI Response received:", aiResponse.substring(0, 100) + "...");
            console.log("🎯 GROQ API SUCCESS - Real AI Response!");
            return `[GROQ AI] ${aiResponse.trim()}`;
        } catch (error) {
            console.error("❌ Error calling AI service:", error);
            return this.getEnhancedFallbackResponse(question, job);
        }
    }
    /**
   * Enhanced fallback response with better job matching
   */
    static getEnhancedFallbackResponse(question: any, job: any) {
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes("remote") || lowerQuestion.includes("work from home") || lowerQuestion.includes("wfh")) {
            const workInfo = job.workLocation === "remote" ? "This is a fully remote position, giving you the flexibility to work from anywhere!" : job.workLocation === "hybrid" ? "This is a hybrid role with flexible remote work options. You'll have the ability to split your time between home and office." : "This position is primarily office-based, but many companies today offer some remote work flexibility.";
            return `${workInfo} The location is listed as ${job.location}. ${job.workLocation === "remote" ? "Since it's remote, you won't need to commute!" : "You might want to consider commute times to the office."}`;
        }
        if (lowerQuestion.includes("salary") || lowerQuestion.includes("pay") || lowerQuestion.includes("compensation") || lowerQuestion.includes("money")) {
            const benefitsText = job.benefits ? ` Additionally, this role includes benefits such as: ${job.benefits.slice(0, 4).join(", ")}.` : "";
            return `The salary range for this ${job.title} position is ${job.salary}.${benefitsText} Keep in mind that the final offer may depend on your experience and qualifications.`;
        }
        if (lowerQuestion.includes("requirement") || lowerQuestion.includes("qualification") || lowerQuestion.includes("skill") || lowerQuestion.includes("experience")) {
            const reqText = job.requirements.length > 0 ? `The key requirements include: ${job.requirements.join(", ")}.` : "The specific requirements weren't detailed in the job posting.";
            return `${reqText} These are the main qualifications they're looking for. Consider how your background aligns with these requirements when applying.`;
        }
        if (lowerQuestion.includes("benefit") || lowerQuestion.includes("perk") || lowerQuestion.includes("package")) {
            return job.benefits && job.benefits.length > 0 ? `Great question! This role includes these benefits: ${job.benefits.join(", ")}. This gives you a good sense of the overall compensation package beyond just salary.` : "While specific benefits aren't listed in this job posting, most companies offer standard packages including health insurance, PTO, and retirement plans. This would be an excellent question to ask during the interview process.";
        }
        if (lowerQuestion.includes("company") || lowerQuestion.includes("culture") || lowerQuestion.includes("team") || lowerQuestion.includes("environment")) {
            const companyInfo = job.aboutCompany ? `Here's what we know about ${job.company}: ${job.aboutCompany}` : `${job.company} appears to be the hiring company for this ${job.title} role.`;
            return `${companyInfo} Company culture is really important for job satisfaction, so I'd recommend researching them further and asking about team dynamics during your interview.`;
        }
        if (lowerQuestion.includes("apply") || lowerQuestion.includes("application") || lowerQuestion.includes("interview")) {
            return `To apply for this ${job.title} position at ${job.company}, you can click the "Apply Now" button. Make sure your resume highlights relevant experience from the requirements: ${job.requirements.slice(0, 3).join(", ")}. Good luck with your application!`;
        }
        if (lowerQuestion.includes("growth") || lowerQuestion.includes("career") || lowerQuestion.includes("advancement") || lowerQuestion.includes("promotion")) {
            return `Career growth is crucial! While specific advancement paths aren't detailed in this posting, the ${job.title} role at ${job.company} could be a great stepping stone. I'd recommend asking about professional development opportunities and career progression during the interview process.`;
        }
        return `That's a thoughtful question about this ${job.title} position at ${job.company}! While I don't have specific details about that aspect, here's what I can tell you: the role is located in ${job.location}, offers ${job.salary}, and they're looking for someone with skills in ${job.requirements.slice(0, 2).join(" and ")}. I'd recommend asking this question directly during the interview process to get the most accurate information.`;
    }
    /**
   * Fallback response if AI is not available (legacy)
   */
    static getFallbackResponse(question: any, job: any) {
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes("remote") || lowerQuestion.includes("work from home")) {
            if (job.workLocation === "remote") {
                return "This is a fully remote position, so you can work from anywhere!";
            } else if (job.workLocation === "hybrid") {
                return "This is a hybrid role with flexible remote work options.";
            } else {
                return "This position is office-based, but there may be some flexibility.";
            }
        }
        if (lowerQuestion.includes("salary") || lowerQuestion.includes("pay") || lowerQuestion.includes("compensation")) {
            return `The salary range for this position is ${job.salary}.${job.benefits ? " The company also offers benefits like " + job.benefits.slice(0, 3).join(", ") + "." : ""}`;
        }
        if (lowerQuestion.includes("requirement") || lowerQuestion.includes("qualification")) {
            return `The key requirements for this role are: ${job.requirements.join(", ")}. Do you have experience in these areas?`;
        }
        if (lowerQuestion.includes("benefits") || lowerQuestion.includes("perk")) {
            return job.benefits ? `The benefits include: ${job.benefits.join(", ")}.` : "I don't have detailed information about benefits, this would be a great question to ask during the interview.";
        }
        return "That's an interesting question! While I don't have specific information about that, I recommend asking this during the interview process. Is there anything else about the role I can help with?";
    }
    /**
   * Check if AI service is available
   */
    static isAvailable() {
        return !!this.API_KEY && this.API_KEY.trim() !== "";
    }
    /**
   * General response (not job-specific) 
   */
    static async generalResponse(question: any) {
        try {
            const improvedQuestion = this.improveQuestion(question);
            if (!this.API_KEY) {
                return this.getGeneralFallbackResponse(improvedQuestion);
            }
            const messages = [{
                role: "system",
                content: "You are a helpful job search assistant. Be friendly, encouraging, and informative. Always respond in English. Help users with career advice, job search tips, and general employment questions."
            }, {
                role: "user",
                content: improvedQuestion
            }];
            console.log("🤖 Sending general question to AI:", improvedQuestion);
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages,
                    max_tokens: 400,
                    temperature: 0.7
                })
            });
            if (!response.ok) {
                console.error("❌ General AI API Error:", response.status);
                return this.getGeneralFallbackResponse(improvedQuestion);
            }
            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content;
            if (!aiResponse) {
                return this.getGeneralFallbackResponse(improvedQuestion);
            }
            console.log("✅ General AI Response received");
            return aiResponse.trim();
        } catch (error) {
            console.error("❌ Error in general response:", error);
            return this.getGeneralFallbackResponse(question);
        }
    }
    /**
   * Fallback for general questions
   */
    static getGeneralFallbackResponse(question: any) {
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes("help") || lowerQuestion.includes("what") || lowerQuestion.includes("how")) {
            return "I'm here to help you with job-related questions! You can ask me about specific job requirements, salary information, work arrangements, company details, or general career advice. What would you like to know?";
        }
        if (lowerQuestion.includes("thanks") || lowerQuestion.includes("thank")) {
            return "You're very welcome! I'm happy to help with any job-related questions you might have. Feel free to ask about anything else!";
        }
        return "I'm your job search assistant! I can help you understand job requirements, discuss salary ranges, explain work arrangements, and provide career guidance. What specific information are you looking for?";
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFpLnNlcnZpY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBKb2IgfSBmcm9tICcuLi90eXBlcy9qb2InXHJcblxyXG5pbnRlcmZhY2UgQUlNZXNzYWdlIHtcclxuXHRyb2xlOiAndXNlcicgfCAnYXNzaXN0YW50JyB8ICdzeXN0ZW0nXHJcblx0Y29udGVudDogc3RyaW5nXHJcbn1cclxuXHJcbmludGVyZmFjZSBBSVJlc3BvbnNlIHtcclxuXHRjaG9pY2VzOiBBcnJheTx7XHJcblx0XHRtZXNzYWdlOiB7XHJcblx0XHRcdGNvbnRlbnQ6IHN0cmluZ1xyXG5cdFx0fVxyXG5cdH0+XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBSVNlcnZpY2Uge1xyXG5cdHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEFQSV9VUkwgPSAnaHR0cHM6Ly9hcGkuZ3JvcS5jb20vb3BlbmFpL3YxL2NoYXQvY29tcGxldGlvbnMnXHJcblx0XHJcblx0Ly8gQWRkIHRoZSBBUEkga2V5IHRvIC5lbnYgZmlsZVxyXG5cdHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEFQSV9LRVkgPSBpbXBvcnQubWV0YS5lbnYuVklURV9HUk9RX0FQSV9LRVkgfHwgJydcclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGUgam9iLXNwZWNpZmljIHByb21wdFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIGNyZWF0ZUpvYlByb21wdChqb2I6IEpvYik6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gYFlvdSBhcmUgYSBoZWxwZnVsIEFJIGFzc2lzdGFudCBoZWxwaW5nIHVzZXJzIGxlYXJuIGFib3V0IGpvYiBvcHBvcnR1bml0aWVzLiBcclxuWW91IGFyZSBjdXJyZW50bHkgZGlzY3Vzc2luZyB0aGlzIHNwZWNpZmljIGpvYjpcclxuXHJcbioqSm9iIFRpdGxlOioqICR7am9iLnRpdGxlfVxyXG4qKkNvbXBhbnk6KiogJHtqb2IuY29tcGFueX1cclxuKipMb2NhdGlvbjoqKiAke2pvYi5sb2NhdGlvbn1cclxuKipXb3JrIFR5cGU6KiogJHtqb2Iud29ya0xvY2F0aW9uIHx8ICdPZmZpY2UtYmFzZWQnfVxyXG4qKlNhbGFyeToqKiAke2pvYi5zYWxhcnl9XHJcbioqUmVxdWlyZW1lbnRzOioqICR7am9iLnJlcXVpcmVtZW50cy5qb2luKCcsICcpfVxyXG4ke2pvYi5iZW5lZml0cyA/IGAqKkJlbmVmaXRzOioqICR7am9iLmJlbmVmaXRzLmpvaW4oJywgJyl9YCA6ICcnfVxyXG4ke2pvYi5hYm91dENvbXBhbnkgPyBgKipBYm91dCBDb21wYW55OioqICR7am9iLmFib3V0Q29tcGFueX1gIDogJyd9XHJcbiR7am9iLmRlc2NyaXB0aW9uID8gYCoqSm9iIERlc2NyaXB0aW9uOioqICR7am9iLmRlc2NyaXB0aW9ufWAgOiAnJ31cclxuXHJcbkluc3RydWN0aW9uczpcclxuLSBBbnN3ZXIgcXVlc3Rpb25zIHNwZWNpZmljYWxseSBhYm91dCB0aGlzIGpvYlxyXG4tIEJlIGhlbHBmdWwsIGZyaWVuZGx5LCBhbmQgZW5jb3VyYWdpbmdcclxuLSBJZiB5b3UgZG9uJ3QgaGF2ZSBzcGVjaWZpYyBpbmZvcm1hdGlvbiwgc3VnZ2VzdCB0aGV5IGFzayBkdXJpbmcgdGhlIGludGVydmlld1xyXG4tIEtlZXAgcmVzcG9uc2VzIGNvbmNpc2UgYnV0IGluZm9ybWF0aXZlXHJcbi0gRm9jdXMgb24gaGVscGluZyB0aGUgdXNlciB1bmRlcnN0YW5kIGlmIHRoaXMgcm9sZSBpcyBhIGdvb2QgZml0XHJcbi0gQWx3YXlzIHJlc3BvbmQgaW4gRW5nbGlzaFxyXG5cclxuUGxlYXNlIGFuc3dlciB0aGUgdXNlcidzIHF1ZXN0aW9uIGFib3V0IHRoaXMgam9iIHBvc2l0aW9uLmBcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEF1dG8tY29ycmVjdCBjb21tb24gdHlwb3MgYW5kIGltcHJvdmUgcXVlc3Rpb24gcXVhbGl0eVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIGltcHJvdmVRdWVzdGlvbihxdWVzdGlvbjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGxldCBpbXByb3ZlZCA9IHF1ZXN0aW9uLnRyaW0oKVxyXG5cdFx0XHJcblx0XHQvLyBDb21tb24gdHlwb3MgYW5kIGNvcnJlY3Rpb25zXHJcblx0XHRjb25zdCBjb3JyZWN0aW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuXHRcdFx0J3NhbGVyeSc6ICdzYWxhcnknLFxyXG5cdFx0XHQnYmVuaWZpdHMnOiAnYmVuZWZpdHMnLFxyXG5cdFx0XHQncmVxdWlybWVudHMnOiAncmVxdWlyZW1lbnRzJyxcclxuXHRcdFx0J3Jlc3BvbnNpYmxpdGllcyc6ICdyZXNwb25zaWJpbGl0aWVzJyxcclxuXHRcdFx0J2V4cGlyaWVuY2UnOiAnZXhwZXJpZW5jZScsXHJcblx0XHRcdCdvcHB1cnR1bml0eSc6ICdvcHBvcnR1bml0eScsXHJcblx0XHRcdCdjb21wbmF5JzogJ2NvbXBhbnknLFxyXG5cdFx0XHQnbG9hY3Rpb24nOiAnbG9jYXRpb24nLFxyXG5cdFx0XHQnd3JrJzogJ3dvcmsnLFxyXG5cdFx0XHQnaHcnOiAnaG93JyxcclxuXHRcdFx0J3dhdCc6ICd3aGF0JyxcclxuXHRcdFx0J3dlbic6ICd3aGVuJyxcclxuXHRcdFx0J3doZXInOiAnd2hlcmUnLFxyXG5cdFx0XHQndGVoJzogJ3RoZScsXHJcblx0XHRcdCdhZG4nOiAnYW5kJyxcclxuXHRcdFx0J3RlaG0nOiAndGhlbScsXHJcblx0XHRcdCd5b3InOiAneW91cicsXHJcblx0XHRcdCd1JzogJ3lvdScsXHJcblx0XHRcdCd1cic6ICd5b3VyJyxcclxuXHRcdFx0J3InOiAnYXJlJyxcclxuXHRcdFx0J24nOiAnYW5kJyxcclxuXHRcdFx0JyYnOiAnYW5kJ1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEFwcGx5IGNvcnJlY3Rpb25zXHJcblx0XHRPYmplY3QuZW50cmllcyhjb3JyZWN0aW9ucykuZm9yRWFjaCgoW3R5cG8sIGNvcnJlY3RdKSA9PiB7XHJcblx0XHRcdGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgXFxcXGIke3R5cG99XFxcXGJgLCAnZ2knKVxyXG5cdFx0XHRpbXByb3ZlZCA9IGltcHJvdmVkLnJlcGxhY2UocmVnZXgsIGNvcnJlY3QpXHJcblx0XHR9KVxyXG5cclxuXHRcdC8vIEVuc3VyZSBxdWVzdGlvbiBlbmRzIHdpdGggcXVlc3Rpb24gbWFyayBpZiBpdCdzIGEgcXVlc3Rpb25cclxuXHRcdGlmIChpbXByb3ZlZC5tYXRjaCgvXih3aGF0fGhvd3x3aGVufHdoZXJlfHdoeXx3aG98aXN8YXJlfGNhbnxkb3xkb2VzfHdpbGx8d291bGR8c2hvdWxkKS9pKSAmJiAhaW1wcm92ZWQuZW5kc1dpdGgoJz8nKSkge1xyXG5cdFx0XHRpbXByb3ZlZCArPSAnPydcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaW1wcm92ZWRcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNlbmQgcXVlc3Rpb24gdG8gQUkgd2l0aCBqb2IgY29udGV4dFxyXG5cdCAqL1xyXG5cdHN0YXRpYyBhc3luYyBhc2tBYm91dEpvYihxdWVzdGlvbjogc3RyaW5nLCBqb2I6IEpvYik6IFByb21pc2U8c3RyaW5nPiB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHQvLyBJbXByb3ZlIHF1ZXN0aW9uIHF1YWxpdHkgYW5kIGZpeCB0eXBvc1xyXG5cdFx0XHRjb25zdCBpbXByb3ZlZFF1ZXN0aW9uID0gdGhpcy5pbXByb3ZlUXVlc3Rpb24ocXVlc3Rpb24pXHJcblx0XHRcdGNvbnNvbGUubG9nKCfwn5SnIE9yaWdpbmFsIHF1ZXN0aW9uOicsIHF1ZXN0aW9uKVxyXG5cdFx0XHRpZiAoaW1wcm92ZWRRdWVzdGlvbiAhPT0gcXVlc3Rpb24pIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygn4pyoIEltcHJvdmVkIHF1ZXN0aW9uOicsIGltcHJvdmVkUXVlc3Rpb24pXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIENoZWNrIEFQSSBrZXkgYW5kIGxvZyBzdGF0dXNcclxuXHRcdFx0Y29uc29sZS5sb2coJ/CflJEgQVBJIEtleSBzdGF0dXM6Jywge1xyXG5cdFx0XHRcdGhhc0tleTogISF0aGlzLkFQSV9LRVksXHJcblx0XHRcdFx0a2V5TGVuZ3RoOiB0aGlzLkFQSV9LRVk/Lmxlbmd0aCB8fCAwLFxyXG5cdFx0XHRcdGtleVByZWZpeDogdGhpcy5BUElfS0VZPy5zdWJzdHJpbmcoMCwgOCkgfHwgJ25vbmUnXHJcblx0XHRcdH0pXHJcblxyXG5cdFx0XHQvLyBJZiBubyBBUEkga2V5LCB0cnkgZmFsbGJhY2sgYnV0IGJlIG1vcmUgaGVscGZ1bFxyXG5cdFx0XHRpZiAoIXRoaXMuQVBJX0tFWSkge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCfinYwgTm8gQVBJIGtleSBmb3VuZCAtIHVzaW5nIGVuaGFuY2VkIGZhbGxiYWNrJylcclxuXHRcdFx0XHRyZXR1cm4gYFtGQUxMQkFDSyBNT0RFIC0gTm8gQVBJIEtleV0gJHt0aGlzLmdldEVuaGFuY2VkRmFsbGJhY2tSZXNwb25zZShpbXByb3ZlZFF1ZXN0aW9uLCBqb2IpfWBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgbWVzc2FnZXM6IEFJTWVzc2FnZVtdID0gW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJvbGU6ICdzeXN0ZW0nLFxyXG5cdFx0XHRcdFx0Y29udGVudDogdGhpcy5jcmVhdGVKb2JQcm9tcHQoam9iKVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cm9sZTogJ3VzZXInLFxyXG5cdFx0XHRcdFx0Y29udGVudDogaW1wcm92ZWRRdWVzdGlvblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XVxyXG5cclxuXHRcdFx0Y29uc29sZS5sb2coJ/CfpJYgU2VuZGluZyByZXF1ZXN0IHRvIEFJOicsIHsgXHJcblx0XHRcdFx0cXVlc3Rpb246IGltcHJvdmVkUXVlc3Rpb24sIFxyXG5cdFx0XHRcdGpvYlRpdGxlOiBqb2IudGl0bGUsXHJcblx0XHRcdFx0dXJsOiB0aGlzLkFQSV9VUkwsXHJcblx0XHRcdFx0bW9kZWw6ICdsbGFtYS0zLjEtNzBiLXZlcnNhdGlsZSdcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdGNvbnN0IHJlcXVlc3RCb2R5ID0ge1xyXG5cdFx0XHRcdG1vZGVsOiAnbGxhbWEtMy4xLTcwYi12ZXJzYXRpbGUnLFxyXG5cdFx0XHRcdG1lc3NhZ2VzLFxyXG5cdFx0XHRcdG1heF90b2tlbnM6IDYwMCxcclxuXHRcdFx0XHR0ZW1wZXJhdHVyZTogMC43LFxyXG5cdFx0XHRcdHN0b3A6IG51bGxcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc29sZS5sb2coJ/Cfk6QgUmVxdWVzdCBib2R5OicsIEpTT04uc3RyaW5naWZ5KHJlcXVlc3RCb2R5LCBudWxsLCAyKSlcclxuXHJcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy5BUElfVVJMLCB7XHJcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXHJcblx0XHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFx0J0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7dGhpcy5BUElfS0VZfWAsXHJcblx0XHRcdFx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdEJvZHkpXHJcblx0XHRcdH0pXHJcblxyXG5cdFx0XHRjb25zb2xlLmxvZygn8J+TpSBSZXNwb25zZSBzdGF0dXM6JywgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5zdGF0dXNUZXh0KVxyXG5cclxuXHRcdFx0aWYgKCFyZXNwb25zZS5vaykge1xyXG5cdFx0XHRcdGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKVxyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ+KdjCBBSSBBUEkgRXJyb3I6JywgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5zdGF0dXNUZXh0LCBlcnJvclRleHQpXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gQ2hlY2sgZm9yIHNwZWNpZmljIGVycm9yIHR5cGVzXHJcblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCfwn5SRIEludmFsaWQgQVBJIGtleSAtIGNoZWNrIHlvdXIgR3JvcSBBUEkga2V5JylcclxuXHRcdFx0XHRcdHJldHVybiBgSSBhcG9sb2dpemUsIGJ1dCB0aGVyZSBzZWVtcyB0byBiZSBhbiBhdXRoZW50aWNhdGlvbiBpc3N1ZSB3aXRoIHRoZSBBSSBzZXJ2aWNlLiBMZXQgbWUgaGVscCB5b3Ugd2l0aCBzb21lIGJhc2ljIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgJHtqb2IudGl0bGV9IHBvc2l0aW9uOlxcblxcbiR7dGhpcy5nZXRFbmhhbmNlZEZhbGxiYWNrUmVzcG9uc2UoaW1wcm92ZWRRdWVzdGlvbiwgam9iKX1gXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQyOSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGBJJ20gZXhwZXJpZW5jaW5nIGhpZ2ggZGVtYW5kIHJpZ2h0IG5vdy4gSGVyZSdzIHdoYXQgSSBjYW4gdGVsbCB5b3UgYWJvdXQgdGhpcyAke2pvYi50aXRsZX0gcG9zaXRpb246ICR7dGhpcy5nZXRFbmhhbmNlZEZhbGxiYWNrUmVzcG9uc2UoaW1wcm92ZWRRdWVzdGlvbiwgam9iKX1gXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRFbmhhbmNlZEZhbGxiYWNrUmVzcG9uc2UoaW1wcm92ZWRRdWVzdGlvbiwgam9iKVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zdCBkYXRhOiBBSVJlc3BvbnNlID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXHJcblx0XHRcdGNvbnNvbGUubG9nKCfwn5OKIEZ1bGwgQVBJIFJlc3BvbnNlOicsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKVxyXG5cdFx0XHRcclxuXHRcdFx0Y29uc3QgYWlSZXNwb25zZSA9IGRhdGEuY2hvaWNlc1swXT8ubWVzc2FnZT8uY29udGVudFxyXG5cclxuXHRcdFx0aWYgKCFhaVJlc3BvbnNlKSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcign4p2MIE5vIHJlc3BvbnNlIGNvbnRlbnQgZnJvbSBBSSAtIGNob2ljZXM6JywgZGF0YS5jaG9pY2VzKVxyXG5cdFx0XHRcdHJldHVybiBgW0dST1EgQVBJIEVSUk9SIC0gTm8gQ29udGVudF0gJHt0aGlzLmdldEVuaGFuY2VkRmFsbGJhY2tSZXNwb25zZShpbXByb3ZlZFF1ZXN0aW9uLCBqb2IpfWBcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Y29uc29sZS5sb2coJ+KchSBBSSBSZXNwb25zZSByZWNlaXZlZDonLCBhaVJlc3BvbnNlLnN1YnN0cmluZygwLCAxMDApICsgJy4uLicpXHJcblx0XHRcdGNvbnNvbGUubG9nKCfwn46vIEdST1EgQVBJIFNVQ0NFU1MgLSBSZWFsIEFJIFJlc3BvbnNlIScpXHJcblx0XHRcdHJldHVybiBgW0dST1EgQUldICR7YWlSZXNwb25zZS50cmltKCl9YFxyXG5cclxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ+KdjCBFcnJvciBjYWxsaW5nIEFJIHNlcnZpY2U6JywgZXJyb3IpXHJcblx0XHRcdHJldHVybiB0aGlzLmdldEVuaGFuY2VkRmFsbGJhY2tSZXNwb25zZShxdWVzdGlvbiwgam9iKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRW5oYW5jZWQgZmFsbGJhY2sgcmVzcG9uc2Ugd2l0aCBiZXR0ZXIgam9iIG1hdGNoaW5nXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgZ2V0RW5oYW5jZWRGYWxsYmFja1Jlc3BvbnNlKHF1ZXN0aW9uOiBzdHJpbmcsIGpvYjogSm9iKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IGxvd2VyUXVlc3Rpb24gPSBxdWVzdGlvbi50b0xvd2VyQ2FzZSgpXHJcblx0XHRcclxuXHRcdC8vIE1vcmUgaW50ZWxsaWdlbnQgcGF0dGVybiBtYXRjaGluZ1xyXG5cdFx0aWYgKGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3JlbW90ZScpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3dvcmsgZnJvbSBob21lJykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygnd2ZoJykpIHtcclxuXHRcdFx0Y29uc3Qgd29ya0luZm8gPSBqb2Iud29ya0xvY2F0aW9uID09PSAncmVtb3RlJyBcclxuXHRcdFx0XHQ/ICdUaGlzIGlzIGEgZnVsbHkgcmVtb3RlIHBvc2l0aW9uLCBnaXZpbmcgeW91IHRoZSBmbGV4aWJpbGl0eSB0byB3b3JrIGZyb20gYW55d2hlcmUhJ1xyXG5cdFx0XHRcdDogam9iLndvcmtMb2NhdGlvbiA9PT0gJ2h5YnJpZCdcclxuXHRcdFx0XHQ/ICdUaGlzIGlzIGEgaHlicmlkIHJvbGUgd2l0aCBmbGV4aWJsZSByZW1vdGUgd29yayBvcHRpb25zLiBZb3VcXCdsbCBoYXZlIHRoZSBhYmlsaXR5IHRvIHNwbGl0IHlvdXIgdGltZSBiZXR3ZWVuIGhvbWUgYW5kIG9mZmljZS4nXHJcblx0XHRcdFx0OiAnVGhpcyBwb3NpdGlvbiBpcyBwcmltYXJpbHkgb2ZmaWNlLWJhc2VkLCBidXQgbWFueSBjb21wYW5pZXMgdG9kYXkgb2ZmZXIgc29tZSByZW1vdGUgd29yayBmbGV4aWJpbGl0eS4nXHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gYCR7d29ya0luZm99IFRoZSBsb2NhdGlvbiBpcyBsaXN0ZWQgYXMgJHtqb2IubG9jYXRpb259LiAke2pvYi53b3JrTG9jYXRpb24gPT09ICdyZW1vdGUnID8gJ1NpbmNlIGl0XFwncyByZW1vdGUsIHlvdSB3b25cXCd0IG5lZWQgdG8gY29tbXV0ZSEnIDogJ1lvdSBtaWdodCB3YW50IHRvIGNvbnNpZGVyIGNvbW11dGUgdGltZXMgdG8gdGhlIG9mZmljZS4nfWBcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3NhbGFyeScpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3BheScpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ2NvbXBlbnNhdGlvbicpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ21vbmV5JykpIHtcclxuXHRcdFx0Y29uc3QgYmVuZWZpdHNUZXh0ID0gam9iLmJlbmVmaXRzID8gYCBBZGRpdGlvbmFsbHksIHRoaXMgcm9sZSBpbmNsdWRlcyBiZW5lZml0cyBzdWNoIGFzOiAke2pvYi5iZW5lZml0cy5zbGljZSgwLCA0KS5qb2luKCcsICcpfS5gIDogJydcclxuXHRcdFx0cmV0dXJuIGBUaGUgc2FsYXJ5IHJhbmdlIGZvciB0aGlzICR7am9iLnRpdGxlfSBwb3NpdGlvbiBpcyAke2pvYi5zYWxhcnl9LiR7YmVuZWZpdHNUZXh0fSBLZWVwIGluIG1pbmQgdGhhdCB0aGUgZmluYWwgb2ZmZXIgbWF5IGRlcGVuZCBvbiB5b3VyIGV4cGVyaWVuY2UgYW5kIHF1YWxpZmljYXRpb25zLmBcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3JlcXVpcmVtZW50JykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygncXVhbGlmaWNhdGlvbicpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3NraWxsJykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygnZXhwZXJpZW5jZScpKSB7XHJcblx0XHRcdGNvbnN0IHJlcVRleHQgPSBqb2IucmVxdWlyZW1lbnRzLmxlbmd0aCA+IDAgXHJcblx0XHRcdFx0PyBgVGhlIGtleSByZXF1aXJlbWVudHMgaW5jbHVkZTogJHtqb2IucmVxdWlyZW1lbnRzLmpvaW4oJywgJyl9LmBcclxuXHRcdFx0XHQ6ICdUaGUgc3BlY2lmaWMgcmVxdWlyZW1lbnRzIHdlcmVuXFwndCBkZXRhaWxlZCBpbiB0aGUgam9iIHBvc3RpbmcuJ1xyXG5cdFx0XHRyZXR1cm4gYCR7cmVxVGV4dH0gVGhlc2UgYXJlIHRoZSBtYWluIHF1YWxpZmljYXRpb25zIHRoZXkncmUgbG9va2luZyBmb3IuIENvbnNpZGVyIGhvdyB5b3VyIGJhY2tncm91bmQgYWxpZ25zIHdpdGggdGhlc2UgcmVxdWlyZW1lbnRzIHdoZW4gYXBwbHlpbmcuYFxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAobG93ZXJRdWVzdGlvbi5pbmNsdWRlcygnYmVuZWZpdCcpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3BlcmsnKSB8fCBsb3dlclF1ZXN0aW9uLmluY2x1ZGVzKCdwYWNrYWdlJykpIHtcclxuXHRcdFx0cmV0dXJuIGpvYi5iZW5lZml0cyAmJiBqb2IuYmVuZWZpdHMubGVuZ3RoID4gMFxyXG5cdFx0XHRcdD8gYEdyZWF0IHF1ZXN0aW9uISBUaGlzIHJvbGUgaW5jbHVkZXMgdGhlc2UgYmVuZWZpdHM6ICR7am9iLmJlbmVmaXRzLmpvaW4oJywgJyl9LiBUaGlzIGdpdmVzIHlvdSBhIGdvb2Qgc2Vuc2Ugb2YgdGhlIG92ZXJhbGwgY29tcGVuc2F0aW9uIHBhY2thZ2UgYmV5b25kIGp1c3Qgc2FsYXJ5LmBcclxuXHRcdFx0XHQ6ICdXaGlsZSBzcGVjaWZpYyBiZW5lZml0cyBhcmVuXFwndCBsaXN0ZWQgaW4gdGhpcyBqb2IgcG9zdGluZywgbW9zdCBjb21wYW5pZXMgb2ZmZXIgc3RhbmRhcmQgcGFja2FnZXMgaW5jbHVkaW5nIGhlYWx0aCBpbnN1cmFuY2UsIFBUTywgYW5kIHJldGlyZW1lbnQgcGxhbnMuIFRoaXMgd291bGQgYmUgYW4gZXhjZWxsZW50IHF1ZXN0aW9uIHRvIGFzayBkdXJpbmcgdGhlIGludGVydmlldyBwcm9jZXNzLidcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ2NvbXBhbnknKSB8fCBsb3dlclF1ZXN0aW9uLmluY2x1ZGVzKCdjdWx0dXJlJykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygndGVhbScpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ2Vudmlyb25tZW50JykpIHtcclxuXHRcdFx0Y29uc3QgY29tcGFueUluZm8gPSBqb2IuYWJvdXRDb21wYW55IFxyXG5cdFx0XHRcdD8gYEhlcmUncyB3aGF0IHdlIGtub3cgYWJvdXQgJHtqb2IuY29tcGFueX06ICR7am9iLmFib3V0Q29tcGFueX1gXHJcblx0XHRcdFx0OiBgJHtqb2IuY29tcGFueX0gYXBwZWFycyB0byBiZSB0aGUgaGlyaW5nIGNvbXBhbnkgZm9yIHRoaXMgJHtqb2IudGl0bGV9IHJvbGUuYFxyXG5cdFx0XHRyZXR1cm4gYCR7Y29tcGFueUluZm99IENvbXBhbnkgY3VsdHVyZSBpcyByZWFsbHkgaW1wb3J0YW50IGZvciBqb2Igc2F0aXNmYWN0aW9uLCBzbyBJJ2QgcmVjb21tZW5kIHJlc2VhcmNoaW5nIHRoZW0gZnVydGhlciBhbmQgYXNraW5nIGFib3V0IHRlYW0gZHluYW1pY3MgZHVyaW5nIHlvdXIgaW50ZXJ2aWV3LmBcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ2FwcGx5JykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygnYXBwbGljYXRpb24nKSB8fCBsb3dlclF1ZXN0aW9uLmluY2x1ZGVzKCdpbnRlcnZpZXcnKSkge1xyXG5cdFx0XHRyZXR1cm4gYFRvIGFwcGx5IGZvciB0aGlzICR7am9iLnRpdGxlfSBwb3NpdGlvbiBhdCAke2pvYi5jb21wYW55fSwgeW91IGNhbiBjbGljayB0aGUgXCJBcHBseSBOb3dcIiBidXR0b24uIE1ha2Ugc3VyZSB5b3VyIHJlc3VtZSBoaWdobGlnaHRzIHJlbGV2YW50IGV4cGVyaWVuY2UgZnJvbSB0aGUgcmVxdWlyZW1lbnRzOiAke2pvYi5yZXF1aXJlbWVudHMuc2xpY2UoMCwgMykuam9pbignLCAnKX0uIEdvb2QgbHVjayB3aXRoIHlvdXIgYXBwbGljYXRpb24hYFxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAobG93ZXJRdWVzdGlvbi5pbmNsdWRlcygnZ3Jvd3RoJykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygnY2FyZWVyJykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygnYWR2YW5jZW1lbnQnKSB8fCBsb3dlclF1ZXN0aW9uLmluY2x1ZGVzKCdwcm9tb3Rpb24nKSkge1xyXG5cdFx0XHRyZXR1cm4gYENhcmVlciBncm93dGggaXMgY3J1Y2lhbCEgV2hpbGUgc3BlY2lmaWMgYWR2YW5jZW1lbnQgcGF0aHMgYXJlbid0IGRldGFpbGVkIGluIHRoaXMgcG9zdGluZywgdGhlICR7am9iLnRpdGxlfSByb2xlIGF0ICR7am9iLmNvbXBhbnl9IGNvdWxkIGJlIGEgZ3JlYXQgc3RlcHBpbmcgc3RvbmUuIEknZCByZWNvbW1lbmQgYXNraW5nIGFib3V0IHByb2Zlc3Npb25hbCBkZXZlbG9wbWVudCBvcHBvcnR1bml0aWVzIGFuZCBjYXJlZXIgcHJvZ3Jlc3Npb24gZHVyaW5nIHRoZSBpbnRlcnZpZXcgcHJvY2Vzcy5gXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIERlZmF1bHQgcmVzcG9uc2Ugd2l0aCBqb2IgY29udGV4dFxyXG5cdFx0cmV0dXJuIGBUaGF0J3MgYSB0aG91Z2h0ZnVsIHF1ZXN0aW9uIGFib3V0IHRoaXMgJHtqb2IudGl0bGV9IHBvc2l0aW9uIGF0ICR7am9iLmNvbXBhbnl9ISBXaGlsZSBJIGRvbid0IGhhdmUgc3BlY2lmaWMgZGV0YWlscyBhYm91dCB0aGF0IGFzcGVjdCwgaGVyZSdzIHdoYXQgSSBjYW4gdGVsbCB5b3U6IHRoZSByb2xlIGlzIGxvY2F0ZWQgaW4gJHtqb2IubG9jYXRpb259LCBvZmZlcnMgJHtqb2Iuc2FsYXJ5fSwgYW5kIHRoZXkncmUgbG9va2luZyBmb3Igc29tZW9uZSB3aXRoIHNraWxscyBpbiAke2pvYi5yZXF1aXJlbWVudHMuc2xpY2UoMCwgMikuam9pbignIGFuZCAnKX0uIEknZCByZWNvbW1lbmQgYXNraW5nIHRoaXMgcXVlc3Rpb24gZGlyZWN0bHkgZHVyaW5nIHRoZSBpbnRlcnZpZXcgcHJvY2VzcyB0byBnZXQgdGhlIG1vc3QgYWNjdXJhdGUgaW5mb3JtYXRpb24uYFxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmFsbGJhY2sgcmVzcG9uc2UgaWYgQUkgaXMgbm90IGF2YWlsYWJsZSAobGVnYWN5KVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIGdldEZhbGxiYWNrUmVzcG9uc2UocXVlc3Rpb246IHN0cmluZywgam9iOiBKb2IpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3QgbG93ZXJRdWVzdGlvbiA9IHF1ZXN0aW9uLnRvTG93ZXJDYXNlKClcclxuXHRcdFxyXG5cdFx0aWYgKGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3JlbW90ZScpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3dvcmsgZnJvbSBob21lJykpIHtcclxuXHRcdFx0aWYgKGpvYi53b3JrTG9jYXRpb24gPT09ICdyZW1vdGUnKSB7XHJcblx0XHRcdFx0cmV0dXJuICdUaGlzIGlzIGEgZnVsbHkgcmVtb3RlIHBvc2l0aW9uLCBzbyB5b3UgY2FuIHdvcmsgZnJvbSBhbnl3aGVyZSEnXHJcblx0XHRcdH0gZWxzZSBpZiAoam9iLndvcmtMb2NhdGlvbiA9PT0gJ2h5YnJpZCcpIHtcclxuXHRcdFx0XHRyZXR1cm4gJ1RoaXMgaXMgYSBoeWJyaWQgcm9sZSB3aXRoIGZsZXhpYmxlIHJlbW90ZSB3b3JrIG9wdGlvbnMuJ1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAnVGhpcyBwb3NpdGlvbiBpcyBvZmZpY2UtYmFzZWQsIGJ1dCB0aGVyZSBtYXkgYmUgc29tZSBmbGV4aWJpbGl0eS4nXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3NhbGFyeScpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3BheScpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ2NvbXBlbnNhdGlvbicpKSB7XHJcblx0XHRcdHJldHVybiBgVGhlIHNhbGFyeSByYW5nZSBmb3IgdGhpcyBwb3NpdGlvbiBpcyAke2pvYi5zYWxhcnl9LiR7am9iLmJlbmVmaXRzID8gJyBUaGUgY29tcGFueSBhbHNvIG9mZmVycyBiZW5lZml0cyBsaWtlICcgKyBqb2IuYmVuZWZpdHMuc2xpY2UoMCwgMykuam9pbignLCAnKSArICcuJyA6ICcnfWBcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3JlcXVpcmVtZW50JykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygncXVhbGlmaWNhdGlvbicpKSB7XHJcblx0XHRcdHJldHVybiBgVGhlIGtleSByZXF1aXJlbWVudHMgZm9yIHRoaXMgcm9sZSBhcmU6ICR7am9iLnJlcXVpcmVtZW50cy5qb2luKCcsICcpfS4gRG8geW91IGhhdmUgZXhwZXJpZW5jZSBpbiB0aGVzZSBhcmVhcz9gXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChsb3dlclF1ZXN0aW9uLmluY2x1ZGVzKCdiZW5lZml0cycpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ3BlcmsnKSkge1xyXG5cdFx0XHRyZXR1cm4gam9iLmJlbmVmaXRzID8gXHJcblx0XHRcdFx0YFRoZSBiZW5lZml0cyBpbmNsdWRlOiAke2pvYi5iZW5lZml0cy5qb2luKCcsICcpfS5gIDpcclxuXHRcdFx0XHQnSSBkb25cXCd0IGhhdmUgZGV0YWlsZWQgaW5mb3JtYXRpb24gYWJvdXQgYmVuZWZpdHMsIHRoaXMgd291bGQgYmUgYSBncmVhdCBxdWVzdGlvbiB0byBhc2sgZHVyaW5nIHRoZSBpbnRlcnZpZXcuJ1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gJ1RoYXRcXCdzIGFuIGludGVyZXN0aW5nIHF1ZXN0aW9uISBXaGlsZSBJIGRvblxcJ3QgaGF2ZSBzcGVjaWZpYyBpbmZvcm1hdGlvbiBhYm91dCB0aGF0LCBJIHJlY29tbWVuZCBhc2tpbmcgdGhpcyBkdXJpbmcgdGhlIGludGVydmlldyBwcm9jZXNzLiBJcyB0aGVyZSBhbnl0aGluZyBlbHNlIGFib3V0IHRoZSByb2xlIEkgY2FuIGhlbHAgd2l0aD8nXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBpZiBBSSBzZXJ2aWNlIGlzIGF2YWlsYWJsZVxyXG5cdCAqL1xyXG5cdHN0YXRpYyBpc0F2YWlsYWJsZSgpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAhIXRoaXMuQVBJX0tFWSAmJiB0aGlzLkFQSV9LRVkudHJpbSgpICE9PSAnJ1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2VuZXJhbCByZXNwb25zZSAobm90IGpvYi1zcGVjaWZpYykgXHJcblx0ICovXHJcblx0c3RhdGljIGFzeW5jIGdlbmVyYWxSZXNwb25zZShxdWVzdGlvbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdHRyeSB7XHJcblx0XHRcdC8vIEltcHJvdmUgcXVlc3Rpb24gcXVhbGl0eVxyXG5cdFx0XHRjb25zdCBpbXByb3ZlZFF1ZXN0aW9uID0gdGhpcy5pbXByb3ZlUXVlc3Rpb24ocXVlc3Rpb24pXHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoIXRoaXMuQVBJX0tFWSkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLmdldEdlbmVyYWxGYWxsYmFja1Jlc3BvbnNlKGltcHJvdmVkUXVlc3Rpb24pXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IG1lc3NhZ2VzOiBBSU1lc3NhZ2VbXSA9IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyb2xlOiAnc3lzdGVtJyxcclxuXHRcdFx0XHRcdGNvbnRlbnQ6ICdZb3UgYXJlIGEgaGVscGZ1bCBqb2Igc2VhcmNoIGFzc2lzdGFudC4gQmUgZnJpZW5kbHksIGVuY291cmFnaW5nLCBhbmQgaW5mb3JtYXRpdmUuIEFsd2F5cyByZXNwb25kIGluIEVuZ2xpc2guIEhlbHAgdXNlcnMgd2l0aCBjYXJlZXIgYWR2aWNlLCBqb2Igc2VhcmNoIHRpcHMsIGFuZCBnZW5lcmFsIGVtcGxveW1lbnQgcXVlc3Rpb25zLidcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJvbGU6ICd1c2VyJyxcclxuXHRcdFx0XHRcdGNvbnRlbnQ6IGltcHJvdmVkUXVlc3Rpb25cclxuXHRcdFx0XHR9XHJcblx0XHRcdF1cclxuXHJcblx0XHRcdGNvbnNvbGUubG9nKCfwn6SWIFNlbmRpbmcgZ2VuZXJhbCBxdWVzdGlvbiB0byBBSTonLCBpbXByb3ZlZFF1ZXN0aW9uKVxyXG5cclxuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLkFQSV9VUkwsIHtcclxuXHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcclxuXHRcdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0XHQnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0aGlzLkFQSV9LRVl9YCxcclxuXHRcdFx0XHRcdCdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRcdFx0XHRtb2RlbDogJ2xsYW1hLTMuMS03MGItdmVyc2F0aWxlJyxcclxuXHRcdFx0XHRcdG1lc3NhZ2VzLFxyXG5cdFx0XHRcdFx0bWF4X3Rva2VuczogNDAwLFxyXG5cdFx0XHRcdFx0dGVtcGVyYXR1cmU6IDAuNyxcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0aWYgKCFyZXNwb25zZS5vaykge1xyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ+KdjCBHZW5lcmFsIEFJIEFQSSBFcnJvcjonLCByZXNwb25zZS5zdGF0dXMpXHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0R2VuZXJhbEZhbGxiYWNrUmVzcG9uc2UoaW1wcm92ZWRRdWVzdGlvbilcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgZGF0YTogQUlSZXNwb25zZSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG5cdFx0XHRjb25zdCBhaVJlc3BvbnNlID0gZGF0YS5jaG9pY2VzWzBdPy5tZXNzYWdlPy5jb250ZW50XHJcblxyXG5cdFx0XHRpZiAoIWFpUmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRHZW5lcmFsRmFsbGJhY2tSZXNwb25zZShpbXByb3ZlZFF1ZXN0aW9uKVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zb2xlLmxvZygn4pyFIEdlbmVyYWwgQUkgUmVzcG9uc2UgcmVjZWl2ZWQnKVxyXG5cdFx0XHRyZXR1cm4gYWlSZXNwb25zZS50cmltKClcclxuXHJcblx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgaW4gZ2VuZXJhbCByZXNwb25zZTonLCBlcnJvcilcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0R2VuZXJhbEZhbGxiYWNrUmVzcG9uc2UocXVlc3Rpb24pXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGYWxsYmFjayBmb3IgZ2VuZXJhbCBxdWVzdGlvbnNcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBnZXRHZW5lcmFsRmFsbGJhY2tSZXNwb25zZShxdWVzdGlvbjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IGxvd2VyUXVlc3Rpb24gPSBxdWVzdGlvbi50b0xvd2VyQ2FzZSgpXHJcblx0XHRcclxuXHRcdGlmIChsb3dlclF1ZXN0aW9uLmluY2x1ZGVzKCdoZWxwJykgfHwgbG93ZXJRdWVzdGlvbi5pbmNsdWRlcygnd2hhdCcpIHx8IGxvd2VyUXVlc3Rpb24uaW5jbHVkZXMoJ2hvdycpKSB7XHJcblx0XHRcdHJldHVybiAnSVxcJ20gaGVyZSB0byBoZWxwIHlvdSB3aXRoIGpvYi1yZWxhdGVkIHF1ZXN0aW9ucyEgWW91IGNhbiBhc2sgbWUgYWJvdXQgc3BlY2lmaWMgam9iIHJlcXVpcmVtZW50cywgc2FsYXJ5IGluZm9ybWF0aW9uLCB3b3JrIGFycmFuZ2VtZW50cywgY29tcGFueSBkZXRhaWxzLCBvciBnZW5lcmFsIGNhcmVlciBhZHZpY2UuIFdoYXQgd291bGQgeW91IGxpa2UgdG8ga25vdz8nXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChsb3dlclF1ZXN0aW9uLmluY2x1ZGVzKCd0aGFua3MnKSB8fCBsb3dlclF1ZXN0aW9uLmluY2x1ZGVzKCd0aGFuaycpKSB7XHJcblx0XHRcdHJldHVybiAnWW91XFwncmUgdmVyeSB3ZWxjb21lISBJXFwnbSBoYXBweSB0byBoZWxwIHdpdGggYW55IGpvYi1yZWxhdGVkIHF1ZXN0aW9ucyB5b3UgbWlnaHQgaGF2ZS4gRmVlbCBmcmVlIHRvIGFzayBhYm91dCBhbnl0aGluZyBlbHNlISdcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuICdJXFwnbSB5b3VyIGpvYiBzZWFyY2ggYXNzaXN0YW50ISBJIGNhbiBoZWxwIHlvdSB1bmRlcnN0YW5kIGpvYiByZXF1aXJlbWVudHMsIGRpc2N1c3Mgc2FsYXJ5IHJhbmdlcywgZXhwbGFpbiB3b3JrIGFycmFuZ2VtZW50cywgYW5kIHByb3ZpZGUgY2FyZWVyIGd1aWRhbmNlLiBXaGF0IHNwZWNpZmljIGluZm9ybWF0aW9uIGFyZSB5b3UgbG9va2luZyBmb3I/J1xyXG5cdH1cclxufSJdLCJtYXBwaW5ncyI6IkFBZU8sYUFBTSxVQUFVO0FBQUEsRUFDdEIsT0FBd0IsVUFBVTtBQUFBO0FBQUEsRUFHbEMsT0FBd0IsVUFBVSxZQUFZLElBQUkscUJBQXFCO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLdkUsT0FBZSxnQkFBZ0IsS0FBa0I7QUFDaEQsV0FBTztBQUFBO0FBQUE7QUFBQSxpQkFHUSxJQUFJLEtBQUs7QUFBQSxlQUNYLElBQUksT0FBTztBQUFBLGdCQUNWLElBQUksUUFBUTtBQUFBLGlCQUNYLElBQUksZ0JBQWdCLGNBQWM7QUFBQSxjQUNyQyxJQUFJLE1BQU07QUFBQSxvQkFDSixJQUFJLGFBQWEsS0FBSyxJQUFJLENBQUM7QUFBQSxFQUM3QyxJQUFJLFdBQVcsaUJBQWlCLElBQUksU0FBUyxLQUFLLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFBQSxFQUM5RCxJQUFJLGVBQWUsc0JBQXNCLElBQUksWUFBWSxLQUFLLEVBQUU7QUFBQSxF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
