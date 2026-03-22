const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Import services
const githubService = require('./services/githubService');
const resumeService = require('./services/resumeService');
const codingPlatformService = require('./services/codingPlatformService');
const analysisService = require('./services/analysisService');

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

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Validation middleware
const validateAnalysisRequest = [
  body('github').notEmpty().withMessage('GitHub username is required'),
  body('targetRole').isIn(['sde', 'frontend', 'backend', 'fullstack', 'data', 'devops']).withMessage('Invalid target role'),
  body('communication').isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  body('leetcode').optional().isString(),
  body('codechef').optional().isString(),
  body('linkedin').optional().isURL().withMessage('Invalid LinkedIn URL')
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Placementor API Server is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main analysis endpoint
app.post('/api/analyze', upload.single('resume'), validateAnalysisRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { github, linkedin, leetcode, codechef, targetRole, communication } = req.body;
    const resumeFile = req.file;

    console.log(`Starting analysis for GitHub user: ${github}`);

    // Gather data from all sources
    const [githubData, resumeData, leetcodeData, codechefData] = await Promise.all([
      githubService.analyzeProfile(github),
      resumeService.analyzeResume(resumeFile),
      leetcode ? codingPlatformService.analyzeLeetCode(leetcode) : Promise.resolve(null),
      codechef ? codingPlatformService.analyzeCodeChef(codechef) : Promise.resolve(null)
    ]);

    // Perform comprehensive analysis
    const analysisResult = await analysisService.generateAnalysis({
      github: githubData,
      resume: resumeData,
      leetcode: leetcodeData,
      codechef: codechefData,
      targetRole,
      communication: parseInt(communication),
      linkedin
    });

    // Clean up uploaded file
    if (resumeFile && fs.existsSync(resumeFile.path)) {
      fs.unlinkSync(resumeFile.path);
    }

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during analysis'
    });
  }
});

// GitHub profile analysis endpoint
app.get('/api/github/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const data = await githubService.analyzeProfile(username);
    res.json({ success: true, data });
  } catch (error) {
    console.error('GitHub analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to analyze GitHub profile' 
    });
  }
});

// Coding platform analysis endpoint
app.get('/api/coding/:platform/:username', async (req, res) => {
  try {
    const { platform, username } = req.params;
    let data;
    
    if (platform === 'leetcode') {
      data = await codingPlatformService.analyzeLeetCode(username);
    } else if (platform === 'codechef') {
      data = await codingPlatformService.analyzeCodeChef(username);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid platform. Use leetcode or codechef' 
      });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error(`${platform} analysis error:`, error);
    res.status(500).json({ 
      success: false, 
      message: error.message || `Failed to analyze ${platform} profile` 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Placementor API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Analysis endpoint: POST http://localhost:${PORT}/api/analyze`);
  
  // Get network IP addresses
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  if (results.length > 0) {
    console.log(`📱 Mobile Access URLs:`);
    results.forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
  }
});

module.exports = app;
