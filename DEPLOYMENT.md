# 🚀 Deployment Guide for Placementor

This guide will help you deploy your Placementor application to various platforms.

## 📋 Prerequisites

- Node.js 14+ installed locally
- Git installed and configured
- Account on your chosen deployment platform
- Environment variables ready

## 🔧 Environment Setup

Before deploying, make sure you have:

1. **Environment Variables** configured in your `.env` file:
   ```env
   PORT=3001
   GITHUB_TOKEN=your_github_token_here
   CORS_ORIGIN=*
   MAX_FILE_SIZE=5242880
   UPLOAD_DIR=uploads
   ```

2. **Dependencies installed**:
   ```bash
   npm install
   ```

## 🌐 Deployment Options

### 1. Vercel (Recommended)

**Pros**: Free tier, easy setup, automatic deployments
**Cons**: Serverless functions may need adjustments

#### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Create vercel.json** (in project root):
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       },
       {
         "src": "*.html",
         "use": "@vercel/static"
       },
       {
         "src": "*.css",
         "use": "@vercel/static"
       },
       {
         "src": "*.js",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ],
     "env": {
       "PORT": "3001"
     }
   }
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **Set Environment Variables**:
   ```bash
   vercel env add GITHUB_TOKEN
   vercel env add CORS_ORIGIN
   ```

### 2. Heroku

**Pros**: Reliable, easy to use, good for Node.js apps
**Cons**: Requires credit card for some features

#### Steps:

1. **Install Heroku CLI**:
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku App**:
   ```bash
   heroku create placementor
   ```

4. **Add Buildpack**:
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

5. **Set Environment Variables**:
   ```bash
   heroku config:set PORT=3001
   heroku config:set GITHUB_TOKEN=your_github_token
   heroku config:set CORS_ORIGIN=*
   heroku config:set MAX_FILE_SIZE=5242880
   heroku config:set UPLOAD_DIR=uploads
   ```

6. **Create Procfile** (in project root):
   ```
   web: node server.js
   ```

7. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### 3. Railway

**Pros**: Modern, simple, good free tier
**Cons**: Newer platform, fewer features

#### Steps:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set PORT=3001
   railway variables set GITHUB_TOKEN=your_github_token
   railway variables set CORS_ORIGIN=*
   ```

5. **Deploy**:
   ```bash
   railway deploy
   ```

### 4. DigitalOcean App Platform

**Pros**: Reliable, good performance
**Cons**: Paid service

#### Steps:

1. **Create DigitalOcean Account**
2. **Create New App**
3. **Connect GitHub Repository**
4. **Configure Build Settings**:
   - Build Command: `npm install`
   - Run Command: `node server.js`
   - HTTP Port: `3001`
5. **Set Environment Variables**
6. **Deploy**

### 5. AWS Elastic Beanstalk

**Pros**: Scalable, AWS integration
**Cons**: Complex setup

#### Steps:

1. **Install AWS CLI and EB CLI**
2. **Initialize EB Application**:
   ```bash
   eb init placementor
   ```
3. **Create Environment**:
   ```bash
   eb create production
   ```
4. **Deploy**:
   ```bash
   eb deploy
   ```

## 📱 Mobile-Specific Deployment

For mobile access, ensure:

1. **Server binds to all interfaces** (`0.0.0.0`)
2. **CORS allows mobile IPs**
3. **Ports are open (3000, 3001)**

### Mobile Deployment on Vercel

```json
{
  "version": 2,
  "functions": {
    "server.js": {
      "maxDuration": 10
    }
  }
}
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **File Uploads**: Limit file types and sizes
3. **Rate Limiting**: Configure appropriate limits
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: Validate all user inputs

## 🐛 Common Deployment Issues

### 1. Port Issues
```bash
# Ensure your app listens on the correct port
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. File Upload Issues
```bash
# Ensure upload directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
```

### 3. CORS Issues
```bash
# Update CORS origin for production
app.use(cors({
  origin: ['https://yourdomain.com', 'https://yourdomain.vercel.app'],
  credentials: true
}));
```

### 4. Memory Issues
```bash
# Increase memory limit in package.json
{
  "scripts": {
    "start": "node --max-old-space-size=2048 server.js"
  }
}
```

## 📊 Monitoring and Logging

### Add Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Check Endpoint
```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📈 Performance Optimization

1. **Enable Gzip Compression**:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Implement Caching**:
   ```javascript
   const NodeCache = require('node-cache');
   const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes
   ```

3. **Use CDN for Static Assets**:
   - Upload images, CSS, JS to CDN
   - Update HTML to use CDN URLs

## 🎯 Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] All API endpoints work
- [ ] File uploads function correctly
- [ ] Mobile access works
- [ ] Environment variables are set
- [ ] HTTPS is enabled
- [ ] Error monitoring is configured
- [ ] Backup strategy is in place
- [ ] Domain is pointed correctly
- [ ] SSL certificate is valid

## 🆘 Support

If you encounter issues:

1. Check platform-specific documentation
2. Review deployment logs
3. Verify environment variables
4. Test locally with production settings
5. Check network/firewall settings

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Railway Documentation](https://docs.railway.app/)
- [AWS EB Guide](https://docs.aws.amazon.com/elasticbeanstalk/)

---

**Happy deploying! 🚀**
