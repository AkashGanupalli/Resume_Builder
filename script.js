// Main Application Logic
class ResumeBuilder {
    constructor() {
        this.analyzer = new ResumeAnalyzer();
        this.currentTemplate = 'modern';
        this.formData = this.initializeFormData();
        
        this.init();
    }

    initializeFormData() {
        return {
            // Personal Information
            fullName: '',
            jobTitle: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            
            // Professional Summary
            summary: '',
            
            // Dynamic sections
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            
            // Skills
            skills: ''
        };
    }

    init() {
        this.bindEvents();
        this.updatePreview();
        this.updateAnalysis();
    }

    bindEvents() {
        // Form input events
        document.getElementById('resumeForm').addEventListener('input', (e) => {
            this.handleFormInput(e);
        });

        // Template selection
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTemplate(e.target.dataset.template);
            });
        });

        // Dynamic form additions
        document.getElementById('addExperience').addEventListener('click', () => {
            this.addExperienceItem();
        });

        document.getElementById('addEducation').addEventListener('click', () => {
            this.addEducationItem();
        });

        document.getElementById('addProject').addEventListener('click', () => {
            this.addProjectItem();
        });

        document.getElementById('addCertification').addEventListener('click', () => {
            this.addCertificationItem();
        });

        // Action buttons
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadPDF();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetForm();
        });
    }

    handleFormInput(event) {
        const { name, value } = event.target;
        
        // Handle simple form fields
        if (this.formData.hasOwnProperty(name)) {
            this.formData[name] = value;
        }
        
        // Handle dynamic arrays
        this.updateDynamicArrays();
        
        // Update preview and analysis
        this.debounce(() => {
            this.updatePreview();
            this.updateAnalysis();
        }, 300);
    }

    updateDynamicArrays() {
        // Update experience array
        this.formData.experience = [];
        document.querySelectorAll('.experience-item').forEach(item => {
            const experience = {
                title: item.querySelector('[name="experienceTitle"]').value,
                company: item.querySelector('[name="experienceCompany"]').value,
                startDate: item.querySelector('[name="experienceStartDate"]').value,
                endDate: item.querySelector('[name="experienceEndDate"]').value,
                description: item.querySelector('[name="experienceDescription"]').value
            };
            if (experience.title || experience.company || experience.description) {
                this.formData.experience.push(experience);
            }
        });

        // Update education array
        this.formData.education = [];
        document.querySelectorAll('.education-item').forEach(item => {
            const education = {
                degree: item.querySelector('[name="educationDegree"]').value,
                institution: item.querySelector('[name="educationInstitution"]').value,
                year: item.querySelector('[name="educationYear"]').value,
                gpa: item.querySelector('[name="educationGPA"]').value
            };
            if (education.degree || education.institution) {
                this.formData.education.push(education);
            }
        });

        // Update projects array
        this.formData.projects = [];
        document.querySelectorAll('.project-item').forEach(item => {
            const project = {
                name: item.querySelector('[name="projectName"]').value,
                technologies: item.querySelector('[name="projectTech"]').value,
                description: item.querySelector('[name="projectDescription"]').value,
                url: item.querySelector('[name="projectUrl"]').value
            };
            if (project.name || project.description) {
                this.formData.projects.push(project);
            }
        });

        // Update certifications array
        this.formData.certifications = [];
        document.querySelectorAll('.certification-item').forEach(item => {
            const certification = {
                name: item.querySelector('[name="certificationName"]').value,
                organization: item.querySelector('[name="certificationOrg"]').value,
                date: item.querySelector('[name="certificationDate"]').value,
                expiry: item.querySelector('[name="certificationExpiry"]').value
            };
            if (certification.name || certification.organization) {
                this.formData.certifications.push(certification);
            }
        });
    }

    switchTemplate(template) {
        this.currentTemplate = template;
        
        // Update button states
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-template="${template}"]`).classList.add('active');
        
        // Update preview
        this.updatePreview();
    }

    updatePreview() {
        const resumeContent = document.getElementById('resumeContent');
        
        // Remove existing classes and add new template class
        resumeContent.className = `resume-content ${this.currentTemplate}-template`;
        
        if (this.isFormEmpty()) {
            resumeContent.innerHTML = `
                <div class="resume-placeholder">
                    <div class="placeholder-icon">📄</div>
                    <h3>Your Resume Preview</h3>
                    <p>Start filling the form to see your resume come to life!</p>
                </div>
            `;
            return;
        }

        const html = this.generateResumeHTML();
        resumeContent.innerHTML = html;
        
        // Add fade-in animation
        resumeContent.classList.add('fade-in');
        setTimeout(() => {
            resumeContent.classList.remove('fade-in');
        }, 300);
    }

    generateResumeHTML() {
        let html = '';

        // Header Section
        if (this.formData.fullName || this.formData.jobTitle) {
            html += '<div class="resume-header">';
            if (this.formData.fullName) {
                html += `<h1 class="resume-name">${this.escapeHtml(this.formData.fullName)}</h1>`;
            }
            if (this.formData.jobTitle) {
                html += `<p class="resume-title">${this.escapeHtml(this.formData.jobTitle)}</p>`;
            }
            
            // Contact Information
            const contactItems = [];
            if (this.formData.email) contactItems.push(this.formData.email);
            if (this.formData.phone) contactItems.push(this.formData.phone);
            if (this.formData.location) contactItems.push(this.formData.location);
            if (this.formData.linkedin) contactItems.push(this.formData.linkedin);
            
            if (contactItems.length > 0) {
                html += '<div class="resume-contact">';
                contactItems.forEach(item => {
                    html += `<span>${this.escapeHtml(item)}</span>`;
                });
                html += '</div>';
            }
            
            html += '</div>';
        }

        // Professional Summary
        if (this.formData.summary) {
            html += '<div class="resume-section">';
            html += '<h2 class="section-title">Professional Summary</h2>';
            html += `<p class="resume-summary">${this.escapeHtml(this.formData.summary)}</p>`;
            html += '</div>';
        }

        // Experience Section
        if (this.formData.experience && this.formData.experience.length > 0) {
            html += '<div class="resume-section">';
            html += '<h2 class="section-title">Work Experience</h2>';
            
            this.formData.experience.forEach(exp => {
                if (exp.title || exp.company || exp.description) {
                    html += '<div class="experience-item">';
                    html += '<div class="item-header">';
                    html += '<div>';
                    if (exp.title) html += `<div class="item-title">${this.escapeHtml(exp.title)}</div>`;
                    if (exp.company) html += `<div class="item-company">${this.escapeHtml(exp.company)}</div>`;
                    html += '</div>';
                    if (exp.startDate || exp.endDate) {
                        const dateRange = [exp.startDate, exp.endDate].filter(d => d).join(' - ');
                        html += `<div class="item-date">${this.escapeHtml(dateRange)}</div>`;
                    }
                    html += '</div>';
                    if (exp.description) html += `<p class="item-description">${this.escapeHtml(exp.description)}</p>`;
                    html += '</div>';
                }
            });
            
            html += '</div>';
        }

        // Education Section
        if (this.formData.education && this.formData.education.length > 0) {
            html += '<div class="resume-section">';
            html += '<h2 class="section-title">Education</h2>';
            
            this.formData.education.forEach(edu => {
                if (edu.degree || edu.institution) {
                    html += '<div class="education-item">';
                    html += '<div class="item-header">';
                    html += '<div>';
                    if (edu.degree) html += `<div class="item-title">${this.escapeHtml(edu.degree)}</div>`;
                    if (edu.institution) html += `<div class="item-institution">${this.escapeHtml(edu.institution)}</div>`;
                    html += '</div>';
                    if (edu.year) html += `<div class="item-date">${this.escapeHtml(edu.year)}</div>`;
                    html += '</div>';
                    if (edu.gpa) html += `<p class="item-description">GPA: ${this.escapeHtml(edu.gpa)}</p>`;
                    html += '</div>';
                }
            });
            
            html += '</div>';
        }

        // Skills Section
        if (this.formData.skills) {
            html += '<div class="resume-section">';
            html += '<h2 class="section-title">Skills</h2>';
            
            const skills = this.formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
            
            if (this.currentTemplate === 'minimal') {
                html += `<div class="skills-list">${skills.map(skill => this.escapeHtml(skill)).join('<span class="skill-separator">•</span>')}</div>`;
            } else {
                html += '<div class="skills-list">';
                skills.forEach(skill => {
                    html += `<span class="skill-tag">${this.escapeHtml(skill)}</span>`;
                });
                html += '</div>';
            }
            
            html += '</div>';
        }

        // Projects Section
        if (this.formData.projects && this.formData.projects.length > 0) {
            html += '<div class="resume-section">';
            html += '<h2 class="section-title">Projects</h2>';
            
            this.formData.projects.forEach(proj => {
                if (proj.name || proj.description) {
                    html += '<div class="project-item">';
                    html += '<div class="item-header">';
                    html += '<div>';
                    if (proj.name) html += `<div class="item-title">${this.escapeHtml(proj.name)}</div>`;
                    if (proj.technologies) html += `<div class="item-company">${this.escapeHtml(proj.technologies)}</div>`;
                    html += '</div>';
                    if (proj.url) html += `<div class="item-date"><a href="${this.escapeHtml(proj.url)}" target="_blank">View Project</a></div>`;
                    html += '</div>';
                    if (proj.description) html += `<p class="item-description">${this.escapeHtml(proj.description)}</p>`;
                    html += '</div>';
                }
            });
            
            html += '</div>';
        }

        // Certifications Section
        if (this.formData.certifications && this.formData.certifications.length > 0) {
            html += '<div class="resume-section">';
            html += '<h2 class="section-title">Certifications</h2>';
            
            this.formData.certifications.forEach(cert => {
                if (cert.name || cert.organization) {
                    html += '<div class="certification-item">';
                    html += '<div class="item-header">';
                    html += '<div>';
                    if (cert.name) html += `<div class="item-title">${this.escapeHtml(cert.name)}</div>`;
                    if (cert.organization) html += `<div class="item-company">${this.escapeHtml(cert.organization)}</div>`;
                    html += '</div>';
                    if (cert.date) {
                        let dateText = cert.date;
                        if (cert.expiry) dateText += ` - Expires: ${cert.expiry}`;
                        html += `<div class="item-date">${this.escapeHtml(dateText)}</div>`;
                    }
                    html += '</div>';
                    html += '</div>';
                }
            });
            
            html += '</div>';
        }

        return html;
    }

    updateAnalysis() {
        const analysis = this.analyzer.analyzeResume(this.formData);
        const wordCount = this.analyzer.countWords(this.formData);

        // Update score bar
        document.getElementById('scoreValue').textContent = analysis.score;
        document.getElementById('scoreTip').textContent = this.analyzer.getScoreTip(analysis.score);
        document.getElementById('progressFill').style.width = `${analysis.score}%`;

        // Update stats
        document.getElementById('wordCount').textContent = wordCount;
        document.getElementById('actionVerbCount').textContent = analysis.actionVerbCount;

        // Update analysis panel
        document.getElementById('completenessValue').textContent = `${analysis.completeness.filled}/${analysis.completeness.total} sections`;
        document.getElementById('actionVerbsValue').textContent = `${analysis.actionVerbCount} found`;
        document.getElementById('skillsValue').textContent = `${analysis.skillsCount} skills`;

        // Update suggestions
        const suggestionsContainer = document.getElementById('analysisSuggestions');
        suggestionsContainer.innerHTML = analysis.suggestions.map(suggestion => 
            `<div class="suggestion-item">${suggestion}</div>`
        ).join('');
    }

    addExperienceItem() {
        const container = document.getElementById('experienceContainer');
        const item = this.createExperienceItem();
        container.appendChild(item);
        item.classList.add('fade-in');
    }

    addEducationItem() {
        const container = document.getElementById('educationContainer');
        const item = this.createEducationItem();
        container.appendChild(item);
        item.classList.add('fade-in');
    }

    addProjectItem() {
        const container = document.getElementById('projectsContainer');
        const item = this.createProjectItem();
        container.appendChild(item);
        item.classList.add('fade-in');
    }

    addCertificationItem() {
        const container = document.getElementById('certificationsContainer');
        const item = this.createCertificationItem();
        container.appendChild(item);
        item.classList.add('fade-in');
    }

    createExperienceItem() {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-field">
                    <label>Job Title</label>
                    <input type="text" name="experienceTitle" placeholder="e.g., Senior Software Developer">
                </div>
                <div class="form-field">
                    <label>Company</label>
                    <input type="text" name="experienceCompany" placeholder="Company Name">
                </div>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>Start Date</label>
                    <input type="text" name="experienceStartDate" placeholder="e.g., Jan 2020">
                </div>
                <div class="form-field">
                    <label>End Date</label>
                    <input type="text" name="experienceEndDate" placeholder="e.g., Present">
                </div>
            </div>
            <div class="form-field">
                <label>Description</label>
                <textarea name="experienceDescription" rows="3" placeholder="Describe your key responsibilities and achievements using action verbs like 'developed', 'led', 'improved'..."></textarea>
            </div>
            <button type="button" class="btn-remove" onclick="removeExperience(this)">Remove</button>
        `;
        return div;
    }

    createEducationItem() {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-field">
                    <label>Degree</label>
                    <input type="text" name="educationDegree" placeholder="e.g., Bachelor of Computer Science">
                </div>
                <div class="form-field">
                    <label>Institution</label>
                    <input type="text" name="educationInstitution" placeholder="University Name">
                </div>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>Year</label>
                    <input type="text" name="educationYear" placeholder="e.g., 2020">
                </div>
                <div class="form-field">
                    <label>GPA (Optional)</label>
                    <input type="text" name="educationGPA" placeholder="e.g., 3.8/4.0">
                </div>
            </div>
            <button type="button" class="btn-remove" onclick="removeEducation(this)">Remove</button>
        `;
        return div;
    }

    createProjectItem() {
        const div = document.createElement('div');
        div.className = 'project-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-field">
                    <label>Project Name</label>
                    <input type="text" name="projectName" placeholder="e.g., E-commerce Platform">
                </div>
                <div class="form-field">
                    <label>Technologies</label>
                    <input type="text" name="projectTech" placeholder="React, Node.js, MongoDB">
                </div>
            </div>
            <div class="form-field">
                <label>Description</label>
                <textarea name="projectDescription" rows="2" placeholder="Describe the project, your role, and key achievements..."></textarea>
            </div>
            <div class="form-field">
                <label>Project URL (Optional)</label>
                <input type="url" name="projectUrl" placeholder="https://github.com/username/project">
            </div>
            <button type="button" class="btn-remove" onclick="removeProject(this)">Remove</button>
        `;
        return div;
    }

    createCertificationItem() {
        const div = document.createElement('div');
        div.className = 'certification-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-field">
                    <label>Certification Name</label>
                    <input type="text" name="certificationName" placeholder="e.g., AWS Certified Solutions Architect">
                </div>
                <div class="form-field">
                    <label>Issuing Organization</label>
                    <input type="text" name="certificationOrg" placeholder="e.g., Amazon Web Services">
                </div>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>Date Obtained</label>
                    <input type="text" name="certificationDate" placeholder="e.g., March 2023">
                </div>
                <div class="form-field">
                    <label>Expiry Date (Optional)</label>
                    <input type="text" name="certificationExpiry" placeholder="e.g., March 2026">
                </div>
            </div>
            <button type="button" class="btn-remove" onclick="removeCertification(this)">Remove</button>
        `;
        return div;
    }

    async downloadPDF() {
        const resumeContent = document.getElementById('resumeContent');
        
        if (this.isFormEmpty()) {
            alert('Please fill in your resume details before downloading.');
            return;
        }

        // Show loading state
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating PDF...';
        downloadBtn.disabled = true;

        try {
            const opt = {
                margin: 0.5,
                filename: `${this.formData.fullName || 'Resume'}_Resume.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(resumeContent).save();
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            // Reset button state
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }

    resetForm() {
        if (confirm('Are you sure you want to reset all form data? This cannot be undone.')) {
            // Reset form data
            this.formData = this.initializeFormData();
            
            // Clear form fields
            document.getElementById('resumeForm').reset();
            
            // Reset dynamic containers to single items
            this.resetDynamicContainers();
            
            // Update preview and analysis
            this.updatePreview();
            this.updateAnalysis();
            
            // Show success message
            this.showNotification('Form reset successfully!', 'success');
        }
    }

    resetDynamicContainers() {
        // Reset experience
        const expContainer = document.getElementById('experienceContainer');
        expContainer.innerHTML = '';
        expContainer.appendChild(this.createExperienceItem());

        // Reset education
        const eduContainer = document.getElementById('educationContainer');
        eduContainer.innerHTML = '';
        eduContainer.appendChild(this.createEducationItem());

        // Reset projects
        const projContainer = document.getElementById('projectsContainer');
        projContainer.innerHTML = '';
        projContainer.appendChild(this.createProjectItem());

        // Reset certifications
        const certContainer = document.getElementById('certificationsContainer');
        certContainer.innerHTML = '';
        certContainer.appendChild(this.createCertificationItem());
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#667eea'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    isFormEmpty() {
        return !this.formData.fullName && 
               !this.formData.jobTitle && 
               !this.formData.summary && 
               (!this.formData.experience || this.formData.experience.length === 0) &&
               (!this.formData.education || this.formData.education.length === 0) &&
               !this.formData.skills;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Global functions for remove buttons
function removeExperience(button) {
    if (document.querySelectorAll('.experience-item').length > 1) {
        button.parentElement.remove();
        resumeBuilder.handleFormInput({ target: { name: '', value: '' } });
    }
}

function removeEducation(button) {
    if (document.querySelectorAll('.education-item').length > 1) {
        button.parentElement.remove();
        resumeBuilder.handleFormInput({ target: { name: '', value: '' } });
    }
}

function removeProject(button) {
    if (document.querySelectorAll('.project-item').length > 1) {
        button.parentElement.remove();
        resumeBuilder.handleFormInput({ target: { name: '', value: '' } });
    }
}

function removeCertification(button) {
    if (document.querySelectorAll('.certification-item').length > 1) {
        button.parentElement.remove();
        resumeBuilder.handleFormInput({ target: { name: '', value: '' } });
    }
}

// Initialize the application
let resumeBuilder;
document.addEventListener('DOMContentLoaded', () => {
    resumeBuilder = new ResumeBuilder();
});