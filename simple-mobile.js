const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple static file server for mobile testing
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    // Serve the main HTML file
    const filePath = path.join(__dirname, 'index.html');
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/results') {
    // Serve the results HTML file
    const filePath = path.join(__dirname, 'results.html');
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading results page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.method === 'POST' && parsedUrl.pathname === '/api/analyze') {
    // Mock API response for testing
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('Received analysis request on mobile');
      
      // Send mock response for testing
      const mockResponse = {
        success: true,
        data: {
          user: {
            github: 'test-user',
            name: 'Test User',
            role: 'SDE'
          },
          totalScore: 75,
          scores: {
            projects: 80,
            skills: 70,
            dsa: 75,
            resume: 80,
            experience: 60,
            communication: 80
          },
          breakdown: [
            { name: 'Projects', score: 80, weight: 25 },
            { name: 'Skills', score: 70, weight: 20 },
            { name: 'DSA / Coding', score: 75, weight: 20 },
            { name: 'Resume Quality', score: 80, weight: 15 },
            { name: 'Experience', score: 60, weight: 10 },
            { name: 'Communication', score: 80, weight: 10 }
          ],
          skillGap: {
            have: ['JavaScript', 'React', 'Node.js', 'Git'],
            need: ['System Design', 'AWS', 'Docker', 'TypeScript']
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
                priority: 'medium'
              },
              {
                name: 'Java for Interview Prep',
                category: 'Language',
                priority: 'medium'
              },
              {
                name: 'Python for Developers',
                category: 'Language',
                priority: 'medium'
              },
              {
                name: 'SQL & Database Design',
                category: 'Database',
                priority: 'medium'
              }
            ],
            resumeTips: [
              'Include achievements, certifications, or hackathon wins',
              'Add 2-3 strong, well-described projects',
              'Include standard sections: Education, Experience, Skills, Projects',
              'Consider condensing your resume to 1-2 pages'
            ],
            experience: [
              'Apply to internships on LinkedIn, Internshala, or AngelList',
              'Take on freelance projects via Upwork or Fiverr to build real-world experience',
              'Contribute to open-source projects on GitHub to demonstrate collaboration skills',
              'Build a personal portfolio website to showcase your work'
            ],
            portfolio: {
              alert: 'Portfolio needs improvement',
              message: 'Build a personal portfolio website to showcase your projects, skills, and achievements. It\'s one of the most impactful things you can do for placement readiness.'
            }
          },
          roadmap: [
            {
              week: 'Week 1-2',
              title: 'Build Core Skills',
              tasks: [
                'Complete 1 course on missing technology',
                'Build a small practice project',
                'Study documentation and tutorials'
              ]
            },
            {
              week: 'Week 3-5',
              title: 'Build Impressive Projects',
              tasks: [
                'Start one full-stack project',
                'Deploy it live with documentation',
                'Add it to GitHub with a polished README'
              ]
            },
            {
              week: 'Week 5-6',
              title: 'Polish Your Resume',
              tasks: [
                'Rewrite project descriptions with metrics',
                'Add relevant skills and certifications',
                'Get feedback from peers or mentors'
              ]
            },
            {
              week: 'Week 6-8',
              title: 'Gain Real Experience',
              tasks: [
                'Apply to internships or freelance gigs',
                'Contribute to open-source projects',
                'Build a portfolio website'
              ]
            }
          ]
        }
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockResponse));
    });
  } else {
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
});

const PORT = 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Simple Mobile Server running on port ${PORT}`);
  
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
    console.log(`📱 Mobile Access URL:`);
    results.forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
    console.log(`📱 Also access on mobile at: http://localhost:${PORT}`);
  }
  
  console.log(`📝 Note: This is a test server with mock data`);
  console.log(`📝 For full functionality, start the main servers with: npm run dev-mobile`);
});
