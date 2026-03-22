const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');

class ResumeService {
  constructor() {
    this.tfidf = new natural.TfIdf();
    this.tokenizer = new natural.WordTokenizer();
    
    // Common technical skills to look for
    this.technicalSkills = [
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
      'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel',
      'html', 'css', 'sass', 'typescript', 'webpack', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest api',
      'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'agile', 'scrum', 'jira',
      'machine learning', 'data science', 'ai', 'deep learning', 'tensorflow', 'pytorch',
      'linux', 'ubuntu', 'windows', 'macos', 'bash', 'powershell', 'shell scripting'
    ];

    // Common resume sections
    this.sections = [
      'education', 'experience', 'work experience', 'employment', 'projects', 'skills',
      'technical skills', 'certifications', 'achievements', 'awards', 'publications',
      'leadership', 'volunteer', 'activities', 'summary', 'objective', 'about'
    ];
  }

  async analyzeResume(file) {
    try {
      if (!file) {
        throw new Error('No resume file provided');
      }

      let text = '';
      const fileExtension = path.extname(file.originalname).toLowerCase();

      // Extract text based on file type
      if (fileExtension === '.pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdf(dataBuffer);
        text = data.text;
      } else if (fileExtension === '.docx') {
        const result = await mammoth.extractRawText({ path: file.path });
        text = result.value;
      } else if (fileExtension === '.doc') {
        // For .doc files, we'll need additional libraries or conversion
        throw new Error('.doc files are not supported. Please convert to .docx or .pdf');
      }

      // Clean and normalize text
      text = this.cleanText(text);

      // Analyze the resume content
      const analysis = {
        text: text,
        wordCount: this.countWords(text),
        sections: this.extractSections(text),
        skills: this.extractSkills(text),
        experience: this.extractExperience(text),
        education: this.extractEducation(text),
        projects: this.extractProjects(text),
        metrics: this.calculateResumeMetrics(text),
        quality: this.assessResumeQuality(text),
        contactInfo: this.extractContactInfo(text)
      };

      return analysis;

    } catch (error) {
      throw new Error(`Failed to analyze resume: ${error.message}`);
    }
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  extractSections(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = null;
    let sectionContent = [];

    lines.forEach(line => {
      const lowerLine = line.toLowerCase().trim();
      
      // Check if this line is a section header
      const foundSection = this.sections.find(section => 
        lowerLine.includes(section) && line.length < 50
      );

      if (foundSection) {
        // Save previous section if exists
        if (currentSection) {
          sections[currentSection] = sectionContent.join('\n').trim();
        }
        
        currentSection = foundSection;
        sectionContent = [];
      } else if (currentSection) {
        sectionContent.push(line);
      }
    });

    // Save last section
    if (currentSection) {
      sections[currentSection] = sectionContent.join('\n').trim();
    }

    return sections;
  }

  extractSkills(text) {
    const foundSkills = [];
    const lowerText = text.toLowerCase();

    this.technicalSkills.forEach(skill => {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill);
      }
    });

    // Extract skills that are mentioned in skills section
    const skillsSection = this.extractSections(text).skills || '';
    const skillsSectionLower = skillsSection.toLowerCase();
    
    const sectionSkills = this.technicalSkills.filter(skill => 
      skillsSectionLower.includes(skill)
    );

    return {
      all: foundSkills,
      inSkillsSection: sectionSkills,
      categories: this.categorizeSkills(foundSkills)
    };
  }

  categorizeSkills(skills) {
    const categories = {
      programming: [],
      frameworks: [],
      databases: [],
      cloud: [],
      tools: [],
      other: []
    };

    skills.forEach(skill => {
      if (['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'typescript'].includes(skill)) {
        categories.programming.push(skill);
      } else if (['react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel'].includes(skill)) {
        categories.frameworks.push(skill);
      } else if (['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'].includes(skill)) {
        categories.databases.push(skill);
      } else if (['aws', 'azure', 'gcp', 'docker', 'kubernetes'].includes(skill)) {
        categories.cloud.push(skill);
      } else if (['git', 'github', 'gitlab', 'jenkins', 'jira'].includes(skill)) {
        categories.tools.push(skill);
      } else {
        categories.other.push(skill);
      }
    });

    return categories;
  }

  extractExperience(text) {
    const experienceSection = this.extractSections(text);
    const expText = experienceSection.experience || experienceSection['work experience'] || experienceSection.employment || '';
    
    // Look for years of experience
    const yearPatterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
      /(\d+)\s*-\s*(\d+)\s*years?/gi,
      /since\s*(\d{4})/gi
    ];

    let totalYears = 0;
    yearPatterns.forEach(pattern => {
      const matches = expText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const years = match.match(/\d+/g);
          if (years) {
            totalYears += Math.max(...years.map(y => parseInt(y)));
          }
        });
      }
    });

    // Count number of positions/companies
    const positionCount = (expText.match(/\n/g) || []).length + 1;

    return {
      totalYears: Math.min(totalYears, 20), // Cap at 20 years
      positionCount,
      hasExperience: expText.length > 100,
      text: expText
    };
  }

  extractEducation(text) {
    const educationSection = this.extractSections(text).education || '';
    
    // Look for degrees
    const degreePatterns = [
      /bachelor|b\.?s\.?|b\.?tech|b\.?e\.?/gi,
      /master|m\.?s\.?|m\.?tech|m\.?e\.?/gi,
      /phd|ph\.?d\.?|doctorate/gi,
      /diploma|certificate/gi
    ];

    const foundDegrees = [];
    degreePatterns.forEach(pattern => {
      if (educationSection.match(pattern)) {
        foundDegrees.push(pattern.source.replace(/[\\\/\.]/g, ''));
      }
    });

    return {
      hasEducation: educationSection.length > 50,
      degrees: foundDegrees,
      text: educationSection
    };
  }

  extractProjects(text) {
    const projectsSection = this.extractSections(text).projects || '';
    
    return {
      hasProjects: projectsSection.length > 100,
      projectCount: (projectsSection.split(/\n\n/).filter(p => p.length > 50)).length,
      text: projectsSection
    };
  }

  calculateResumeMetrics(text) {
    return {
      wordCount: this.countWords(text),
      estimatedPages: Math.ceil(this.countWords(text) / 500), // ~500 words per page
      sectionCount: Object.keys(this.extractSections(text)).length,
      skillCount: this.extractSkills(text).all.length,
      hasContactInfo: this.extractContactInfo(text).hasContact
    };
  }

  assessResumeQuality(text) {
    const sections = this.extractSections(text);
    const skills = this.extractSkills(text);
    const experience = this.extractExperience(text);
    const education = this.extractEducation(text);
    const projects = this.extractProjects(text);
    const metrics = this.calculateResumeMetrics(text);

    let score = 0;
    let suggestions = [];

    // Check essential sections
    if (sections.experience || sections['work experience']) {
      score += 20;
    } else {
      suggestions.push('Add work experience section');
    }

    if (sections.education) {
      score += 15;
    } else {
      suggestions.push('Add education section');
    }

    if (sections.skills || sections['technical skills']) {
      score += 15;
    } else {
      suggestions.push('Add skills section');
    }

    if (sections.projects) {
      score += 15;
    } else {
      suggestions.push('Add projects section to showcase your work');
    }

    // Check content quality
    if (metrics.wordCount >= 200 && metrics.wordCount <= 600) {
      score += 10;
    } else if (metrics.wordCount > 600) {
      suggestions.push('Consider condensing your resume to 1-2 pages');
    } else {
      suggestions.push('Add more detail to your resume');
    }

    if (skills.all.length >= 5) {
      score += 10;
    } else {
      suggestions.push('List more technical skills');
    }

    if (experience.totalYears > 0) {
      score += 10;
    } else {
      suggestions.push('Include any internships or relevant experience');
    }

    if (projects.hasProjects) {
      score += 5;
    } else {
      suggestions.push('Add personal or academic projects');
    }

    return {
      score: Math.min(score, 100),
      grade: this.getGrade(score),
      suggestions
    };
  }

  getGrade(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  extractContactInfo(text) {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phonePattern = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
    const linkedinPattern = /linkedin\.com\/in\/[\w-]+/gi;
    const githubPattern = /github\.com\/[\w-]+/gi;

    const emails = text.match(emailPattern) || [];
    const phones = text.match(phonePattern) || [];
    const linkedins = text.match(linkedinPattern) || [];
    const githubs = text.match(githubPattern) || [];

    return {
      hasContact: emails.length > 0 || phones.length > 0,
      emails,
      phones,
      linkedins,
      githubs
    };
  }
}

module.exports = new ResumeService();
