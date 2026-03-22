class AnalysisService {
  constructor() {
    // Role-specific skill requirements
    this.roleRequirements = {
      sde: {
        required: ['javascript', 'python', 'java', 'c++', 'data structures', 'algorithms', 'git'],
        preferred: ['react', 'nodejs', 'aws', 'docker', 'sql', 'rest api'],
        weights: { projects: 25, skills: 20, dsa: 20, resume: 15, experience: 10, communication: 10 }
      },
      frontend: {
        required: ['javascript', 'html', 'css', 'react', 'typescript'],
        preferred: ['angular', 'vue', 'webpack', 'sass', 'git', 'rest api'],
        weights: { projects: 30, skills: 25, dsa: 15, resume: 15, experience: 10, communication: 5 }
      },
      backend: {
        required: ['javascript', 'python', 'java', 'nodejs', 'sql', 'rest api'],
        preferred: ['aws', 'docker', 'kubernetes', 'mongodb', 'postgresql', 'git'],
        weights: { projects: 25, skills: 25, dsa: 20, resume: 15, experience: 10, communication: 5 }
      },
      fullstack: {
        required: ['javascript', 'react', 'nodejs', 'sql', 'git'],
        preferred: ['python', 'aws', 'docker', 'typescript', 'mongodb', 'rest api'],
        weights: { projects: 30, skills: 20, dsa: 20, resume: 15, experience: 10, communication: 5 }
      },
      data: {
        required: ['python', 'sql', 'machine learning', 'statistics'],
        preferred: ['tensorflow', 'pytorch', 'pandas', 'numpy', 'aws', 'jupyter'],
        weights: { projects: 25, skills: 30, dsa: 15, resume: 15, experience: 10, communication: 5 }
      },
      devops: {
        required: ['linux', 'docker', 'aws', 'git', 'ci/cd'],
        preferred: ['kubernetes', 'jenkins', 'terraform', 'ansible', 'monitoring'],
        weights: { projects: 20, skills: 30, dsa: 10, resume: 15, experience: 20, communication: 5 }
      }
    };

    // Project recommendations by role
    this.projectRecommendations = {
      sde: [
        {
          name: 'E-Commerce Platform',
          description: 'Full-stack e-commerce app with auth, payments, and inventory management',
          difficulty: 'advanced',
          tags: ['react', 'node.js', 'mongodb', 'rest api']
        },
        {
          name: 'REST API Backend',
          description: 'RESTful API with authentication, CRUD operations, and documentation',
          difficulty: 'intermediate',
          tags: ['node.js', 'express', 'mongodb', 'rest api']
        },
        {
          name: 'URL Shortener Service',
          description: 'URL shortening with analytics, click tracking, and custom aliases',
          difficulty: 'beginner',
          tags: ['node.js', 'mongodb', 'rest api']
        }
      ],
      frontend: [
        {
          name: 'Social Media Dashboard',
          description: 'Real-time dashboard with charts, notifications, and user interactions',
          difficulty: 'intermediate',
          tags: ['react', 'typescript', 'chart.js', 'websocket']
        },
        {
          name: 'E-Learning Platform',
          description: 'Interactive learning platform with video player and quiz system',
          difficulty: 'advanced',
          tags: ['react', 'node.js', 'mongodb', 'video-streaming']
        },
        {
          name: 'Weather App',
          description: 'Beautiful weather app with forecasts, maps, and location services',
          difficulty: 'beginner',
          tags: ['react', 'api-integration', 'geolocation']
        }
      ],
      backend: [
        {
          name: 'Microservices Architecture',
          description: 'Set of microservices with API gateway, service discovery, and load balancing',
          difficulty: 'advanced',
          tags: ['node.js', 'docker', 'kubernetes', 'microservices']
        },
        {
          name: 'Real-time Chat Application',
          description: 'Scalable chat app with WebSocket, message persistence, and user presence',
          difficulty: 'intermediate',
          tags: ['node.js', 'socket.io', 'redis', 'mongodb']
        },
        {
          name: 'File Upload Service',
          description: 'Cloud file storage with CDN integration and file processing',
          difficulty: 'beginner',
          tags: ['node.js', 'aws-s3', 'multer', 'cdn']
        }
      ]
    };
  }

  async generateAnalysis(data) {
    const { github, resume, leetcode, codechef, targetRole, communication, linkedin } = data;

    // Calculate individual component scores
    const scores = {
      projects: this.calculateProjectScore(github, targetRole),
      skills: this.calculateSkillScore(github, resume, targetRole),
      dsa: this.calculateDSAScore(leetcode, codechef),
      resume: this.calculateResumeScore(resume),
      experience: this.calculateExperienceScore(resume, github),
      communication: this.calculateCommunicationScore(communication)
    };

    // Calculate total weighted score
    const weights = this.roleRequirements[targetRole].weights;
    const totalScore = Math.round(
      scores.projects * weights.projects / 100 +
      scores.skills * weights.skills / 100 +
      scores.dsa * weights.dsa / 100 +
      scores.resume * weights.resume / 100 +
      scores.experience * weights.experience / 100 +
      scores.communication * weights.communication / 100
    );

    // Generate skill gap analysis
    const skillGap = this.analyzeSkillGap(github, resume, targetRole);

    // Generate recommendations
    const recommendations = this.generateRecommendations(scores, skillGap, targetRole);

    // Create personalized roadmap
    const roadmap = this.generateRoadmap(scores, skillGap, targetRole);

    return {
      user: {
        github: github?.username || '',
        name: github?.name || '',
        role: targetRole.toUpperCase()
      },
      totalScore,
      scores,
      breakdown: this.generateScoreBreakdown(scores, weights),
      skillGap,
      recommendations,
      roadmap,
      metrics: {
        githubProfileCompleteness: github?.metrics?.profileCompleteness?.score || 0,
        codingProfileStrength: this.getCodingProfileStrength(leetcode, codechef),
        resumeQuality: resume?.quality?.score || 0,
        overallActivity: this.calculateOverallActivity(github, leetcode, codechef)
      }
    };
  }

  calculateProjectScore(github, targetRole) {
    if (!github) return 0;

    const { repositories, metrics } = github;
    let score = 0;

    // Base score for number of projects
    if (metrics.totalRepos >= 5) score += 30;
    else if (metrics.totalRepos >= 3) score += 20;
    else if (metrics.totalRepos >= 1) score += 10;

    // Quality metrics
    if (metrics.avgStarsPerRepo >= 5) score += 20;
    else if (metrics.avgStarsPerRepo >= 2) score += 10;

    if (metrics.totalForks >= 5) score += 15;
    else if (metrics.totalForks >= 2) score += 8;

    // Activity consistency
    if (metrics.reposPerMonth >= 0.5) score += 15;
    else if (metrics.reposPerMonth >= 0.2) score += 8;

    // Role-specific project relevance
    const relevantProjects = repositories.filter(repo => 
      this.isProjectRelevant(repo, targetRole)
    ).length;
    
    if (relevantProjects >= 3) score += 20;
    else if (relevantProjects >= 1) score += 10;

    return Math.min(score, 100);
  }

  calculateSkillScore(github, resume, targetRole) {
    const allSkills = new Set();
    
    // Add skills from GitHub
    if (github?.languages) {
      Object.keys(github.languages).forEach(lang => allSkills.add(lang.toLowerCase()));
    }

    // Add skills from resume
    if (resume?.skills?.all) {
      resume.skills.all.forEach(skill => allSkills.add(skill.toLowerCase()));
    }

    const requirements = this.roleRequirements[targetRole];
    const requiredSkills = requirements.required.map(s => s.toLowerCase());
    const preferredSkills = requirements.preferred.map(s => s.toLowerCase());

    let score = 0;
    const totalRequired = requiredSkills.length;
    const totalPreferred = preferredSkills.length;

    // Score for required skills
    const requiredMatches = requiredSkills.filter(skill => 
      Array.from(allSkills).some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    ).length;

    score += (requiredMatches / totalRequired) * 60;

    // Score for preferred skills
    const preferredMatches = preferredSkills.filter(skill => 
      Array.from(allSkills).some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    ).length;

    score += (preferredMatches / totalPreferred) * 40;

    return Math.min(Math.round(score), 100);
  }

  calculateDSAScore(leetcode, codechef) {
    let score = 0;
    let totalSolved = 0;
    let contestRating = 0;

    // LeetCode analysis
    if (leetcode) {
      totalSolved += leetcode.problemStats?.totalSolved || 0;
      contestRating = Math.max(contestRating, leetcode.contests?.rating || 0);

      // Difficulty balance
      const { easySolved, mediumSolved, hardSolved } = leetcode.problemStats;
      const total = easySolved + mediumSolved + hardSolved;
      
      if (total >= 200) score += 40;
      else if (total >= 100) score += 30;
      else if (total >= 50) score += 20;
      else if (total >= 20) score += 10;

      // Bonus for hard problems
      if (hardSolved >= 10) score += 20;
      else if (hardSolved >= 5) score += 10;

      // Contest participation
      if (contestRating >= 1600) score += 20;
      else if (contestRating >= 1400) score += 15;
      else if (contestRating >= 1200) score += 10;
    }

    // CodeChef analysis
    if (codechef) {
      totalSolved += codechef.problemStats?.fullySolved || 0;
      contestRating = Math.max(contestRating, codechef.profile?.currentRating || 0);

      const solved = codechef.problemStats?.fullySolved || 0;
      if (solved >= 100) score += 30;
      else if (solved >= 50) score += 20;
      else if (solved >= 25) score += 10;

      // Rating bonus
      const rating = codechef.profile?.currentRating || 0;
      if (rating >= 1800) score += 20;
      else if (rating >= 1600) score += 15;
      else if (rating >= 1400) score += 10;
    }

    // Overall problem solving
    if (totalSolved >= 300) score += 20;
    else if (totalSolved >= 200) score += 15;
    else if (totalSolved >= 100) score += 10;

    return Math.min(score, 100);
  }

  calculateResumeScore(resume) {
    if (!resume) return 0;
    
    return resume.quality?.score || 0;
  }

  calculateExperienceScore(resume, github) {
    let score = 0;

    // Resume experience
    if (resume?.experience) {
      const { totalYears, hasExperience } = resume.experience;
      
      if (totalYears >= 2) score += 40;
      else if (totalYears >= 1) score += 30;
      else if (totalYears >= 0.5) score += 20;
      else if (hasExperience) score += 10;
    }

    // GitHub activity as experience proxy
    if (github?.metrics) {
      const { lastYearActive, reposPerMonth } = github.metrics;
      
      if (lastYearActive && reposPerMonth >= 0.5) score += 30;
      else if (lastYearActive) score += 20;
      else if (reposPerMonth >= 0.2) score += 10;
    }

    return Math.min(score, 100);
  }

  calculateCommunicationScore(rating) {
    return rating * 20; // Convert 1-5 scale to 20-100
  }

  generateScoreBreakdown(scores, weights) {
    return [
      { name: 'Projects', score: scores.projects, weight: weights.projects },
      { name: 'Skills', score: scores.skills, weight: weights.skills },
      { name: 'DSA / Coding', score: scores.dsa, weight: weights.dsa },
      { name: 'Resume Quality', score: scores.resume, weight: weights.resume },
      { name: 'Experience', score: scores.experience, weight: weights.experience },
      { name: 'Communication', score: scores.communication, weight: weights.communication }
    ];
  }

  analyzeSkillGap(github, resume, targetRole) {
    const requirements = this.roleRequirements[targetRole];
    const userSkills = new Set();

    // Collect all user skills
    if (github?.languages) {
      Object.keys(github.languages).forEach(lang => userSkills.add(lang.toLowerCase()));
    }

    if (resume?.skills?.all) {
      resume.skills.all.forEach(skill => userSkills.add(skill.toLowerCase()));
    }

    const required = requirements.required.filter(skill => 
      !Array.from(userSkills).some(userSkill => 
        userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
      )
    );

    const have = requirements.required.concat(requirements.preferred).filter(skill => 
      Array.from(userSkills).some(userSkill => 
        userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
      )
    );

    return {
      have: have.map(skill => this.formatSkillName(skill)),
      need: required.map(skill => this.formatSkillName(skill))
    };
  }

  formatSkillName(skill) {
    const skillMap = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'c++': 'C++',
      'react': 'React',
      'nodejs': 'Node.js',
      'data structures': 'Data Structures',
      'algorithms': 'Algorithms',
      'rest api': 'REST API',
      'machine learning': 'Machine Learning',
      'ci/cd': 'CI/CD'
    };
    
    return skillMap[skill.toLowerCase()] || skill.charAt(0).toUpperCase() + skill.slice(1);
  }

  generateRecommendations(scores, skillGap, targetRole) {
    const recommendations = {
      projects: this.getProjectRecommendations(targetRole),
      courses: this.getCourseRecommendations(skillGap.need, targetRole),
      resumeTips: this.getResumeTips(scores.resume),
      experience: this.getExperienceSuggestions(scores.experience),
      portfolio: this.getPortfolioSuggestions(scores.projects)
    };

    return recommendations;
  }

  getProjectRecommendations(targetRole) {
    const baseProjects = this.projectRecommendations[targetRole] || this.projectRecommendations.sde;
    
    return baseProjects.map(project => ({
      ...project,
      difficulty: project.difficulty
    }));
  }

  getCourseRecommendations(missingSkills, targetRole) {
    const courses = [];
    
    const courseMap = {
      'data structures': { name: 'Data Structures & Algorithms', category: 'DSA', priority: 'high' },
      'algorithms': { name: 'Algorithms & Problem Solving', category: 'DSA', priority: 'high' },
      'system design': { name: 'System Design for Interviews', category: 'Architecture', priority: 'medium' },
      'aws': { name: 'AWS Cloud Practitioner', category: 'Cloud', priority: 'medium' },
      'docker': { name: 'Docker & Containerization', category: 'DevOps', priority: 'medium' },
      'kubernetes': { name: 'Kubernetes Orchestration', category: 'DevOps', priority: 'medium' },
      'react': { name: 'React - The Complete Guide', category: 'Frontend', priority: 'high' },
      'nodejs': { name: 'Node.js - Backend Development', category: 'Backend', priority: 'high' },
      'python': { name: 'Python for Developers', category: 'Language', priority: 'medium' },
      'java': { name: 'Java for Interview Prep', category: 'Language', priority: 'medium' },
      'sql': { name: 'SQL & Database Design', category: 'Database', priority: 'medium' },
      'machine learning': { name: 'Machine Learning A-Z', category: 'Data Science', priority: 'high' }
    };

    missingSkills.forEach(skill => {
      const course = courseMap[skill.toLowerCase()];
      if (course) {
        courses.push(course);
      }
    });

    // Add some default courses if none found
    if (courses.length === 0) {
      courses.push(
        { name: 'Data Structures & Algorithms', category: 'DSA', priority: 'high' },
        { name: 'System Design for Interviews', category: 'Architecture', priority: 'medium' }
      );
    }

    return courses;
  }

  getResumeTips(resumeScore) {
    const tips = [];
    
    if (resumeScore < 40) {
      tips.push('Include achievements, certifications, or hackathon wins');
      tips.push('Add 2-3 strong, well-described projects');
      tips.push('Include standard sections: Education, Experience, Skills, Projects');
      tips.push('Consider condensing your resume to 1-2 pages');
    } else if (resumeScore < 60) {
      tips.push('Add more quantifiable achievements to your experience');
      tips.push('Include relevant technical skills and certifications');
      tips.push('Get feedback from peers or mentors');
    } else {
      tips.push('Keep your resume updated with latest projects and skills');
      tips.push('Tailor your resume for specific job applications');
    }

    return tips;
  }

  getExperienceSuggestions(experienceScore) {
    const suggestions = [
      'Apply to internships on LinkedIn, Internshala, or AngelList',
      'Take on freelance projects via Upwork or Fiverr to build real-world experience',
      'Contribute to open-source projects on GitHub to demonstrate collaboration skills',
      'Build a personal portfolio website to showcase your work'
    ];

    if (experienceScore < 30) {
      suggestions.unshift('Focus on building personal projects to gain experience');
    }

    return suggestions;
  }

  getPortfolioSuggestions(projectScore) {
    if (projectScore < 40) {
      return {
        alert: 'No portfolio detected',
        message: 'Build a personal portfolio website to showcase your projects, skills, and achievements. It\'s one of the most impactful things you can do for placement readiness.'
      };
    } else if (projectScore < 60) {
      return {
        alert: 'Portfolio needs improvement',
        message: 'Add more high-quality projects with detailed descriptions and live demos. Ensure your best work is prominently featured.'
      };
    }

    return {
      alert: 'Portfolio looks good',
      message: 'Continue updating your portfolio with new projects and keep improving the presentation.'
    };
  }

  generateRoadmap(scores, skillGap, targetRole) {
    const roadmap = [];
    
    // Week 1-2: Foundation
    roadmap.push({
      week: 'Week 1-2',
      title: 'Build Core Skills',
      tasks: [
        'Complete 1 course on missing technology',
        'Build a small practice project',
        'Study documentation and tutorials'
      ]
    });

    // Week 3-5: Projects
    roadmap.push({
      week: 'Week 3-5',
      title: 'Build Impressive Projects',
      tasks: [
        'Start one full-stack project',
        'Deploy it live with documentation',
        'Add it to GitHub with a polished README'
      ]
    });

    // Week 5-6: Resume
    roadmap.push({
      week: 'Week 5-6',
      title: 'Polish Your Resume',
      tasks: [
        'Rewrite project descriptions with metrics',
        'Add relevant skills and certifications',
        'Get feedback from peers or mentors'
      ]
    });

    // Week 6-8: Experience
    roadmap.push({
      week: 'Week 6-8',
      title: 'Gain Real Experience',
      tasks: [
        'Apply to internships or freelance gigs',
        'Contribute to open-source projects',
        'Build a portfolio website'
      ]
    });

    return roadmap;
  }

  isProjectRelevant(repo, targetRole) {
    if (!repo.description) return false;
    
    const description = repo.description.toLowerCase();
    const language = repo.language?.toLowerCase() || '';
    
    const roleKeywords = {
      sde: ['api', 'backend', 'full-stack', 'web', 'app', 'system'],
      frontend: ['frontend', 'ui', 'react', 'vue', 'angular', 'web', 'interface'],
      backend: ['backend', 'api', 'server', 'database', 'microservices'],
      fullstack: ['full-stack', 'web', 'app', 'mern', 'mean'],
      data: ['data', 'ml', 'ai', 'analytics', 'machine learning'],
      devops: ['devops', 'docker', 'kubernetes', 'ci/cd', 'deployment']
    };

    const keywords = roleKeywords[targetRole] || roleKeywords.sde;
    
    return keywords.some(keyword => 
      description.includes(keyword) || language.includes(keyword)
    );
  }

  getCodingProfileStrength(leetcode, codechef) {
    let strength = 0;
    
    if (leetcode) {
      const solved = leetcode.problemStats?.totalSolved || 0;
      const rating = leetcode.contests?.rating || 0;
      
      if (solved >= 100) strength += 30;
      else if (solved >= 50) strength += 20;
      else if (solved >= 20) strength += 10;
      
      if (rating >= 1600) strength += 20;
      else if (rating >= 1400) strength += 15;
      else if (rating >= 1200) strength += 10;
    }
    
    if (codechef) {
      const solved = codechef.problemStats?.fullySolved || 0;
      const rating = codechef.profile?.currentRating || 0;
      
      if (solved >= 50) strength += 20;
      else if (solved >= 25) strength += 15;
      else if (solved >= 10) strength += 10;
      
      if (rating >= 1800) strength += 20;
      else if (rating >= 1600) strength += 15;
      else if (rating >= 1400) strength += 10;
    }
    
    return Math.min(strength, 100);
  }

  calculateOverallActivity(github, leetcode, codechef) {
    let activity = 0;
    
    if (github?.metrics?.lastYearActive) activity += 30;
    if (github?.metrics?.reposPerMonth >= 0.2) activity += 20;
    
    if (leetcode?.contests?.attended >= 5) activity += 25;
    if (leetcode?.contests?.attended >= 1) activity += 15;
    
    if (codechef?.problemStats?.contests >= 5) activity += 25;
    if (codechef?.problemStats?.contests >= 1) activity += 15;
    
    return Math.min(activity, 100);
  }
}

module.exports = new AnalysisService();
