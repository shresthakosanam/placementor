const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', /^http:\/\/192\.168\.\d+\.\d+:\d+$/, /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Validation middleware
const validateAnalysisRequest = [
  body('github').notEmpty().withMessage('GitHub username is required'),
  body('targetRole').isIn(['sde', 'frontend', 'backend', 'fullstack', 'data', 'devops']).withMessage('Invalid target role'),
  body('communication').isInt({ min: 1, max: 5 }).withMessage('Communication rating must be 1-5'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Mock analysis endpoint (simplified for Vercel)
app.post('/api/analyze', validateAnalysisRequest, async (req, res) => {
  try {
    const { github, linkedin, leetcode, codechef, targetRole, communication } = req.body;
    
    console.log('Processing analysis for:', github);
    
    // Generate mock analysis data
    const mockData = {
      user: {
        github: github,
        name: github.charAt(0).toUpperCase() + github.slice(1),
        role: targetRole.toUpperCase()
      },
      totalScore: Math.floor(Math.random() * 30) + 60, // 60-90
      scores: {
        projects: Math.floor(Math.random() * 30) + 60,
        skills: Math.floor(Math.random() * 30) + 60,
        dsa: Math.floor(Math.random() * 30) + 60,
        resume: Math.floor(Math.random() * 30) + 60,
        experience: Math.floor(Math.random() * 30) + 60,
        communication: communication * 20
      },
      breakdown: [
        { name: 'Projects', score: Math.floor(Math.random() * 30) + 60, weight: 25 },
        { name: 'Skills', score: Math.floor(Math.random() * 30) + 60, weight: 20 },
        { name: 'DSA / Coding', score: Math.floor(Math.random() * 30) + 60, weight: 20 },
        { name: 'Resume Quality', score: Math.floor(Math.random() * 30) + 60, weight: 15 },
        { name: 'Experience', score: Math.floor(Math.random() * 30) + 60, weight: 10 },
        { name: 'Communication', score: communication * 20, weight: 10 }
      ],
      skillGap: {
        have: ['JavaScript', 'React', 'Node.js', 'Git', 'HTML', 'CSS'],
        need: ['System Design', 'AWS', 'Docker', 'TypeScript', 'GraphQL', 'Kubernetes']
      },
      recommendations: {
        projects: [
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
            name: 'Data Visualization Dashboard',
            description: 'Interactive charts and graphs from real datasets',
            difficulty: 'intermediate',
            tags: ['python', 'pandas', 'javascript', 'sql']
          },
          {
            name: 'URL Shortener Service',
            description: 'URL shortening with analytics, click tracking, and custom aliases',
            difficulty: 'beginner',
            tags: ['node.js', 'mongodb', 'rest api']
          }
        ],
        courses: [
          {
            name: 'Data Structures & Algorithms',
            category: 'DSA',
            priority: 'high'
          },
          {
            name: 'System Design for Interviews',
            category: 'Architecture',
            priority: 'high'
          },
          {
            name: 'Cloud Computing Fundamentals',
            category: 'Cloud',
            priority: 'medium'
          },
          {
            name: 'TypeScript for JavaScript Developers',
            category: 'Language',
            priority: 'medium'
          },
          {
            name: 'Database Design and Optimization',
            category: 'Database',
            priority: 'medium'
          }
        ],
        resumeTips: [
          'Include quantifiable achievements in your projects',
          'Add 2-3 strong, well-described projects with tech stack',
          'Include standard sections: Education, Experience, Skills, Projects',
          'Consider condensing your resume to 1-2 pages for better readability',
          'Add GitHub portfolio link and LinkedIn URL'
        ],
        experience: [
          'Apply to internships on LinkedIn, Internshala, or AngelList',
          'Take on freelance projects via Upwork or Fiverr to build real-world experience',
          'Contribute to open-source projects on GitHub to demonstrate collaboration skills',
          'Build a personal portfolio website to showcase your work',
          'Participate in hackathons and coding competitions'
        ],
        portfolio: {
          alert: 'Portfolio needs improvement',
          message: 'Build a personal portfolio website to showcase your projects, skills, and achievements. Include live demos and GitHub links.'
        }
      },
      roadmap: [
        {
          week: 'Week 1-2',
          title: 'Build Core Skills',
          tasks: [
            'Complete System Design course',
            'Build a small practice project with new technology',
            'Study cloud fundamentals (AWS/GCP/Azure)',
            'Practice 50+ DSA problems'
          ]
        },
        {
          week: 'Week 3-5',
          title: 'Build Impressive Projects',
          tasks: [
            'Start one full-stack project with deployment',
            'Add comprehensive documentation and tests',
            'Deploy it live with CI/CD pipeline',
            'Add it to GitHub with a polished README'
          ]
        },
        {
          week: 'Week 5-6',
          title: 'Polish Your Resume',
          tasks: [
            'Rewrite project descriptions with metrics and outcomes',
            'Add relevant skills and certifications',
            'Get feedback from peers or mentors',
            'Create multiple versions for different roles'
          ]
        },
        {
          week: 'Week 6-8',
          title: 'Gain Real Experience',
          tasks: [
            'Apply to 20+ internships or freelance gigs',
            'Contribute to 3+ open-source projects',
            'Build portfolio website with live demos',
            'Network with professionals on LinkedIn'
          ]
        }
      ]
    };
    
    res.json({
      success: true,
      data: mockData
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Analysis failed: ' + error.message
    });
  }
});

// Mock GitHub endpoint
app.get('/api/github/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const mockGithubData = {
      username: username,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      bio: 'Passionate developer working on exciting projects',
      location: 'San Francisco, CA',
      followers: Math.floor(Math.random() * 1000) + 100,
      following: Math.floor(Math.random() * 500) + 50,
      public_repos: Math.floor(Math.random() * 50) + 10,
      total_commits: Math.floor(Math.random() * 10000) + 1000,
      repositories: [
        { name: 'awesome-project', stars: 25, forks: 5, language: 'JavaScript' },
        { name: 'data-analysis', stars: 15, forks: 3, language: 'Python' },
        { name: 'web-app', stars: 10, forks: 2, language: 'React' }
      ],
      languages: ['JavaScript', 'Python', 'React', 'Node.js'],
      contributions: 150 + Math.floor(Math.random() * 200)
    };
    
    res.json({
      success: true,
      data: mockGithubData
    });
    
  } catch (error) {
    console.error('GitHub analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'GitHub analysis failed: ' + error.message
    });
  }
});

// Mock coding platform endpoint
app.get('/api/coding/:platform/:username', async (req, res) => {
  try {
    const { platform, username } = req.params;
    
    const mockCodingData = {
      platform: platform,
      username: username,
      total_problems: Math.floor(Math.random() * 500) + 100,
      easy_solved: Math.floor(Math.random() * 100) + 50,
      medium_solved: Math.floor(Math.random() * 100) + 30,
      hard_solved: Math.floor(Math.random() * 50) + 10,
      contest_rating: Math.floor(Math.random() * 2000) + 1000,
      contests_participated: Math.floor(Math.random() * 50) + 10,
      best_rank: Math.floor(Math.random() * 1000) + 100,
      current_streak: Math.floor(Math.random() * 30) + 1
    };
    
    res.json({
      success: true,
      data: mockCodingData
    });
    
  } catch (error) {
    console.error('Coding platform analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Coding platform analysis failed: ' + error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Placementor API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Analysis endpoint: POST http://localhost:${PORT}/api/analyze`);
  });
}

// Export for Vercel
module.exports = app;
