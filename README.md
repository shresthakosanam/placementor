# 🚀 Placementor - AI-Powered Career Analysis

<div align="center">

![Placementor Logo](https://img.shields.io/badge/Placementor-AI%20Powered%20Career%20Analysis-blue?style=for-the-badge&logo=github)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.18.2-blue)](https://expressjs.com/)

**A comprehensive platform that analyzes your GitHub profile, resume, coding platform performance, and skills to provide personalized placement readiness scores with actionable insights.**

[🌐 Live Demo](#) · [📖 Documentation](#documentation) · [🚀 Quick Start](#-quick-start) · [🤝 Contributing](#-contributing)

</div>

## ✨ Features

- **🔍 Multi-Platform Analysis**: GitHub, LeetCode, CodeChef, LinkedIn integration
- **📄 Resume Parsing**: Automatic extraction of skills, experience, and education from PDF/DOC files
- **🎯 Smart Scoring Algorithm**: Role-specific placement readiness assessment (SDE, Frontend, Backend, etc.)
- **📊 Skill Gap Analysis**: Identify missing skills for your target role
- **💡 Personalized Recommendations**: Projects, courses, and 8-week roadmap tailored to you
- **📱 Mobile Responsive**: Beautiful, modern interface that works perfectly on all devices
- **🔒 Secure**: Rate limiting, input validation, and secure file uploads

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Multer** for secure file uploads
- **Axios** for API integrations
- **PDF-parse** & Mammoth for resume parsing
- **Natural** for NLP processing
- **Cheerio** for web scraping

### Frontend
- **HTML5** with modern CSS3
- **Vanilla JavaScript** (no frameworks required)
- **Font Awesome** for icons
- **Responsive design** with CSS Grid & Flexbox

## 🌟 Live Demo

Check out the live demo here: [Demo Link](#)

*Note: The demo uses mock data for demonstration purposes. For real analysis, deploy your own instance.*

## 📸 Screenshots

<div align="center">
  <img src="https://img.shields.io/badge/Screenshot-Coming%20Soon-lightgrey" alt="Screenshot coming soon">
</div>

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/placementor.git
   cd placementor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env file with your configurations
   # Optional: Add GitHub token for higher rate limits
   ```

4. **Start the server**

   **For Desktop/Laptop Development:**
   ```bash
   npm run dev
   ```

   **For Mobile Access:**
   ```bash
   npm run dev-mobile
   ```

5. **Access the application**

   **Desktop:** Open `index.html` in your browser or visit `http://localhost:3001`
   
   **Mobile:** Use the IP address shown in console (e.g., `http://192.168.1.100:3000`)

## 📱 Mobile Setup

### Quick Mobile Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start mobile servers**
   ```bash
   npm run dev-mobile
   ```

3. **Access on mobile**
   - Look for "📱 Mobile Access URLs:" in the console
   - Enter the displayed URL in your mobile browser
   - Example: `http://192.168.1.100:3000`

### Troubleshooting Mobile Access

- **Same WiFi network** required for both devices
- **Firewall permissions** may be needed
- **Port conflicts** - check if ports 3000/3001 are free

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001

# GitHub API Token (optional but recommended)
# Get your token from: https://github.com/settings/tokens
GITHUB_TOKEN=your_github_token_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### GitHub Token Setup (Recommended)

1. Visit [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` and `read:user` scopes
3. Add the token to your `.env` file

## 📊 API Endpoints

### Main Analysis Endpoint
```http
POST /api/analyze
Content-Type: multipart/form-data

Parameters:
- github (required): GitHub username
- resume (required): Resume file (PDF/DOC/DOCX)
- targetRole (required): sde, frontend, backend, fullstack, data, devops
- communication (required): 1-5 rating
- linkedin (optional): LinkedIn URL
- leetcode (optional): LeetCode username
- codechef (optional): CodeChef username
```

### Individual Platform Analysis
```http
GET /api/github/:username
GET /api/coding/:platform/:username  # platform: leetcode or codechef
GET /api/health
```

## 🎯 Role-Specific Analysis

The platform provides tailored analysis for different roles:

| Role | Focus Areas | Weightage Distribution |
|------|------------|----------------------|
| **SDE** | DSA, System Design, Full-Stack | Projects (25%), Skills (20%), DSA (20%), Resume (15%), Experience (10%), Communication (10%) |
| **Frontend** | React/Vue/Angular, UI/UX | Projects (30%), Skills (25%), DSA (15%), Resume (15%), Experience (10%), Communication (5%) |
| **Backend** | APIs, Databases, Cloud | Projects (25%), Skills (25%), DSA (20%), Resume (15%), Experience (10%), Communication (5%) |
| **Full Stack** | End-to-end Development | Projects (30%), Skills (20%), DSA (20%), Resume (15%), Experience (10%), Communication (5%) |
| **Data Scientist** | ML/AI, Statistics, Python | Projects (25%), Skills (30%), DSA (15%), Resume (15%), Experience (10%), Communication (5%) |
| **DevOps** | CI/CD, Cloud Infrastructure | Projects (20%), Skills (30%), DSA (10%), Resume (15%), Experience (20%), Communication (5%) |

## 📈 Scoring Algorithm

The placement readiness score is calculated based on:

1. **Project Quality** (20-30%): GitHub repositories, stars, forks, relevance to role
2. **Technical Skills** (20-30%): Match between your skills and role requirements
3. **DSA/Coding** (10-20%): LeetCode/CodeChef performance, contest ratings
4. **Resume Quality** (15%): Structure, content, completeness, achievements
5. **Experience** (5-20%): Work experience, internships, open-source contributions
6. **Communication** (5-10%): Self-rated communication skills

## 🔍 Analysis Features

### GitHub Analysis
- Repository quality and quantity
- Language diversity and relevance
- Contribution activity
- Profile completeness
- Project relevance to target role

### Resume Analysis
- Automatic skill extraction
- Experience quantification
- Education details
- Project descriptions
- Quality assessment and suggestions

### Coding Platform Analysis
- Problem-solving statistics
- Difficulty distribution
- Contest performance
- Consistency metrics
- Skill level assessment

### Personalized Recommendations
- **Projects**: Role-specific project ideas with difficulty levels
- **Courses**: Targeted learning based on skill gaps
- **Resume Tips**: Actionable improvements
- **Experience**: Internships and freelance opportunities
- **Roadmap**: 8-week personalized improvement plan

## 🛡️ Security Features

- Rate limiting (10 requests per 15 minutes)
- File upload validation (PDF/DOC/DOCX, max 5MB)
- Input sanitization and validation
- CORS protection
- Helmet.js for security headers

## 📁 Project Structure

```
placementor/
├── server.js              # Main server file
├── simple-mobile.js       # Mobile-friendly server
├── package.json           # Dependencies and scripts
├── index.html            # Frontend application
├── results.html          # Results page
├── services/             # API service modules
│   ├── githubService.js
│   ├── resumeService.js
│   ├── codingPlatformService.js
│   └── analysisService.js
├── uploads/              # Temporary file storage
├── .env.example          # Environment template
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

### Deploy to Heroku

1. **Create Heroku app**
   ```bash
   heroku create placementor
   ```

2. **Set environment variables**
   ```bash
   heroku config:set PORT=3001
   heroku config:set GITHUB_TOKEN=your_token
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy**
   ```bash
   railway login
   railway deploy
   ```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly

## 🐛 Troubleshooting

### Common Issues

1. **GitHub API Rate Limit**
   - Add GitHub token to `.env` file
   - Wait for rate limit to reset (typically 1 hour)

2. **File Upload Errors**
   - Ensure file is PDF, DOC, or DOCX
   - Check file size is under 5MB
   - Verify uploads directory permissions

3. **LeetCode/CodeChef Analysis Failures**
   - Some profiles may be private
   - Platform structure changes may require updates
   - Network connectivity issues

4. **CORS Errors**
   - Check CORS_ORIGIN in `.env`
   - Ensure frontend and backend ports match configuration

5. **Mobile Access Issues**
   - Ensure both devices are on same WiFi
   - Check firewall settings
   - Verify IP address is correct

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for profile analysis
- [LeetCode](https://leetcode.com/) and [CodeChef](https://www.codechef.com/) for coding statistics
- Open-source community for inspiration and tools
- All contributors who help improve this project

## 📞 Support & Contact

For issues, questions, or contributions:

- 🐛 **Report Issues**: [Create an issue on GitHub](https://github.com/yourusername/placementor/issues)
- 💬 **Discussions**: [Join our GitHub Discussions](https://github.com/yourusername/placementor/discussions)
- 📧 **Email**: your.email@example.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/placementor&type=Date)](https://star-history.com/#yourusername/placementor&Date)

---

<div align="center">

**Built with ❤️ for students and professionals seeking career growth**

[⬆️ Back to top](#-placementor---ai-powered-career-analysis)

</div>
