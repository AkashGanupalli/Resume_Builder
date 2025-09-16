// Resume Analysis Module
class ResumeAnalyzer {
    constructor() {
        this.actionVerbs = [
            'achieved', 'administered', 'analyzed', 'built', 'collaborated', 'created', 'delivered', 
            'developed', 'designed', 'directed', 'established', 'executed', 'generated', 'improved', 
            'implemented', 'increased', 'initiated', 'launched', 'led', 'managed', 'optimized', 
            'organized', 'reduced', 'resolved', 'streamlined', 'supervised', 'transformed', 'upgraded',
            'accelerated', 'accomplished', 'adapted', 'advised', 'allocated', 'amplified', 'assembled',
            'assisted', 'automated', 'balanced', 'boosted', 'budgeted', 'calculated', 'campaigned',
            'coached', 'completed', 'concentrated', 'conducted', 'configured', 'consolidated',
            'constructed', 'consulted', 'contributed', 'controlled', 'converted', 'coordinated',
            'corrected', 'cultivated', 'customized', 'debugged', 'decided', 'decreased', 'delegated',
            'demonstrated', 'deployed', 'devised', 'diagnosed', 'documented', 'drove', 'earned',
            'educated', 'eliminated', 'enabled', 'encouraged', 'engineered', 'enhanced', 'enlisted',
            'evaluated', 'exceeded', 'expanded', 'expedited', 'facilitated', 'focused', 'forecasted',
            'formulated', 'founded', 'guided', 'handled', 'hired', 'identified', 'illustrated',
            'influenced', 'innovated', 'inspected', 'installed', 'instituted', 'integrated',
            'interpreted', 'interviewed', 'introduced', 'invented', 'investigated', 'maximized',
            'mentored', 'migrated', 'minimized', 'modernized', 'modified', 'monitored', 'motivated',
            'navigated', 'negotiated', 'operated', 'orchestrated', 'overcame', 'participated',
            'performed', 'pioneered', 'planned', 'prepared', 'presented', 'prioritized', 'produced',
            'programmed', 'projected', 'promoted', 'proposed', 'provided', 'published', 'purchased',
            'recommended', 'reconciled', 'recorded', 'recruited', 'redesigned', 'refined',
            'rehabilitated', 'reinforced', 'relocated', 'remodeled', 'repaired', 'replaced',
            'reported', 'researched', 'restructured', 'reviewed', 'revitalized', 'scheduled',
            'secured', 'selected', 'simplified', 'solved', 'spearheaded', 'specialized', 'specified',
            'standardized', 'strengthened', 'structured', 'succeeded', 'supported', 'surpassed',
            'synthesized', 'systematized', 'tested', 'trained', 'translated', 'troubleshot',
            'unified', 'updated', 'utilized', 'validated', 'volunteered', 'won'
        ];

        this.requiredSections = [
            'fullName', 'jobTitle', 'email', 'phone', 'summary', 'experience', 'skills'
        ];
    }

    analyzeResume(formData) {
        const analysis = {
            completeness: this.calculateCompleteness(formData),
            actionVerbCount: this.countActionVerbs(formData),
            skillsCount: this.countSkills(formData),
            score: 0,
            suggestions: []
        };

        analysis.score = this.calculateScore(analysis);
        analysis.suggestions = this.generateSuggestions(analysis, formData);

        return analysis;
    }

    calculateCompleteness(formData) {
        let filledSections = 0;
        const totalSections = this.requiredSections.length;

        // Check personal info
        if (formData.fullName && formData.jobTitle && formData.email && formData.phone) {
            filledSections++;
        }

        // Check summary
        if (formData.summary && formData.summary.length > 50) {
            filledSections++;
        }

        // Check experience
        if (formData.experience && formData.experience.length > 0) {
            const hasValidExperience = formData.experience.some(exp => 
                exp.title && exp.company && exp.description && exp.description.length > 30
            );
            if (hasValidExperience) filledSections++;
        }

        // Check education
        if (formData.education && formData.education.length > 0) {
            const hasValidEducation = formData.education.some(edu => 
                edu.degree && edu.institution
            );
            if (hasValidEducation) filledSections++;
        }

        // Check skills
        if (formData.skills && formData.skills.length > 20) {
            filledSections++;
        }

        // Check projects
        if (formData.projects && formData.projects.length > 0) {
            const hasValidProjects = formData.projects.some(proj => 
                proj.name && proj.description && proj.description.length > 30
            );
            if (hasValidProjects) filledSections++;
        }

        // Check certifications
        if (formData.certifications && formData.certifications.length > 0) {
            const hasValidCertifications = formData.certifications.some(cert => 
                cert.name && cert.organization
            );
            if (hasValidCertifications) filledSections++;
        }

        return { filled: filledSections, total: totalSections };
    }

    countActionVerbs(formData) {
        let count = 0;
        const textToAnalyze = [];

        // Collect all text content
        if (formData.summary) textToAnalyze.push(formData.summary.toLowerCase());
        
        if (formData.experience) {
            formData.experience.forEach(exp => {
                if (exp.description) textToAnalyze.push(exp.description.toLowerCase());
            });
        }

        if (formData.projects) {
            formData.projects.forEach(proj => {
                if (proj.description) textToAnalyze.push(proj.description.toLowerCase());
            });
        }

        // Count action verbs
        const allText = textToAnalyze.join(' ');
        this.actionVerbs.forEach(verb => {
            const regex = new RegExp(`\\b${verb}\\b`, 'gi');
            const matches = allText.match(regex);
            if (matches) count += matches.length;
        });

        return count;
    }

    countSkills(formData) {
        if (!formData.skills) return 0;
        
        const skillsList = formData.skills.split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        
        return skillsList.length;
    }

    countWords(formData) {
        let wordCount = 0;
        const textFields = [];

        // Collect all text content
        if (formData.summary) textFields.push(formData.summary);
        
        if (formData.experience) {
            formData.experience.forEach(exp => {
                if (exp.description) textFields.push(exp.description);
            });
        }

        if (formData.projects) {
            formData.projects.forEach(proj => {
                if (proj.description) textFields.push(proj.description);
            });
        }

        if (formData.skills) textFields.push(formData.skills);

        // Count words
        textFields.forEach(text => {
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            wordCount += words.length;
        });

        return wordCount;
    }

    calculateScore(analysis) {
        let score = 0;

        // Completeness (40% of score)
        const completenessPercentage = (analysis.completeness.filled / analysis.completeness.total) * 100;
        score += (completenessPercentage * 0.4);

        // Action verbs (30% of score)
        const actionVerbScore = Math.min(analysis.actionVerbCount * 5, 100);
        score += (actionVerbScore * 0.3);

        // Skills count (30% of score)
        const skillsScore = Math.min(analysis.skillsCount * 10, 100);
        score += (skillsScore * 0.3);

        return Math.round(score);
    }

    generateSuggestions(analysis, formData) {
        const suggestions = [];

        // Completeness suggestions
        if (analysis.completeness.filled < analysis.completeness.total) {
            const missingSections = analysis.completeness.total - analysis.completeness.filled;
            suggestions.push(`💡 Complete ${missingSections} more section(s) to improve your resume`);
        }

        // Action verbs suggestions
        if (analysis.actionVerbCount < 10) {
            suggestions.push('🎯 Add more action verbs like "developed", "led", "improved" to make your resume more impactful');
        } else if (analysis.actionVerbCount >= 20) {
            suggestions.push('✅ Great job! Your resume has strong action verbs');
        }

        // Skills suggestions
        if (analysis.skillsCount < 5) {
            suggestions.push('🛠️ Add more skills to showcase your expertise (aim for 8-15 relevant skills)');
        } else if (analysis.skillsCount > 20) {
            suggestions.push('⚠️ Consider focusing on your most relevant skills (8-15 is optimal)');
        } else {
            suggestions.push('✅ Good skills section! You have a well-balanced list');
        }

        // Summary suggestions
        if (!formData.summary || formData.summary.length < 100) {
            suggestions.push('📝 Add a compelling professional summary (100-200 words recommended)');
        }

        // Experience suggestions
        if (!formData.experience || formData.experience.length === 0) {
            suggestions.push('💼 Add your work experience with quantifiable achievements');
        }

        // Score-based suggestions
        if (analysis.score >= 80) {
            suggestions.push('🌟 Excellent! Your resume is well-optimized');
        } else if (analysis.score >= 60) {
            suggestions.push('👍 Good progress! A few improvements will make your resume outstanding');
        } else {
            suggestions.push('📈 Keep building! Your resume has good potential');
        }

        return suggestions;
    }

    getScoreTip(score) {
        if (score >= 90) return "Outstanding! Your resume is highly optimized";
        if (score >= 80) return "Excellent! Your resume looks very strong";
        if (score >= 70) return "Good job! Your resume is well-structured";
        if (score >= 60) return "Making progress! Keep improving your content";
        if (score >= 40) return "Getting there! Focus on completing more sections";
        if (score >= 20) return "Good start! Add more details to boost your score";
        return "Start filling your details to improve your score!";
    }
}

// Export for use in main script
window.ResumeAnalyzer = ResumeAnalyzer;