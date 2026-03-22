const axios = require('axios');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Placementor-Analysis-Tool'
    };
    
    if (process.env.GITHUB_TOKEN) {
      this.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
  }

  async analyzeProfile(username) {
    try {
      // Get user profile data
      const userResponse = await axios.get(`${this.baseURL}/users/${username}`, {
        headers: this.headers
      });

      const user = userResponse.data;

      // Get repositories
      const reposResponse = await axios.get(`${this.baseURL}/users/${username}/repos`, {
        headers: this.headers,
        params: {
          sort: 'updated',
          per_page: 100
        }
      });

      const repositories = reposResponse.data;

      // Get languages from all repositories
      const languages = await this.getRepositoryLanguages(username, repositories);

      // Get contribution data
      const contributions = await this.getContributions(username);

      // Calculate metrics
      const analysis = {
        username: user.login,
        name: user.name,
        bio: user.bio,
        location: user.location,
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        repositories: repositories.map(repo => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          size: repo.size,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          isFork: repo.fork
        })),
        languages: languages,
        contributions: contributions,
        metrics: this.calculateMetrics(user, repositories, languages, contributions)
      };

      return analysis;

    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`GitHub user '${username}' not found`);
      }
      throw new Error(`Failed to analyze GitHub profile: ${error.message}`);
    }
  }

  async getRepositoryLanguages(username, repositories) {
    const languageCount = {};
    let totalSize = 0;

    for (const repo of repositories.filter(r => !r.fork && r.size > 0)) {
      try {
        const langResponse = await axios.get(`${this.baseURL}/repos/${username}/${repo.name}/languages`, {
          headers: this.headers
        });

        const repoLanguages = langResponse.data;
        const repoTotalSize = Object.values(repoLanguages).reduce((sum, bytes) => sum + bytes, 0);

        for (const [language, bytes] of Object.entries(repoLanguages)) {
          if (!languageCount[language]) {
            languageCount[language] = 0;
          }
          languageCount[language] += bytes;
          totalSize += bytes;
        }
      } catch (error) {
        console.warn(`Could not fetch languages for repo: ${repo.name}`);
      }
    }

    // Convert to percentages
    const languagePercentages = {};
    for (const [language, bytes] of Object.entries(languageCount)) {
      languagePercentages[language] = Math.round((bytes / totalSize) * 100);
    }

    return languagePercentages;
  }

  async getContributions(username) {
    try {
      // Get the last year of contributions
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      
      const response = await axios.get(`${this.baseURL}/search/commits`, {
        headers: this.headers,
        params: {
          q: `author:${username} author-date:>${oneYearAgo.toISOString().split('T')[0]}`,
          per_page: 1
        }
      });

      // Note: GitHub API doesn't provide exact contribution counts without authentication
      // This is a simplified approach
      return {
        totalCommits: response.data.total_count || 0,
        lastYearActive: response.data.total_count > 0
      };
    } catch (error) {
      console.warn('Could not fetch contribution data');
      return {
        totalCommits: 0,
        lastYearActive: false
      };
    }
  }

  calculateMetrics(user, repositories, languages, contributions) {
    const nonForkRepos = repositories.filter(repo => !repo.fork);
    
    // Project quality metrics
    const avgStarsPerRepo = nonForkRepos.length > 0 
      ? nonForkRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0) / nonForkRepos.length 
      : 0;

    const totalForks = nonForkRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Activity metrics
    const daysSinceCreation = Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
    const reposPerMonth = daysSinceCreation > 0 ? (nonForkRepos.length / (daysSinceCreation / 30)).toFixed(2) : 0;

    // Language diversity
    const languageCount = Object.keys(languages).length;
    const hasPopularLanguages = ['JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'Go', 'Rust']
      .some(lang => languages[lang]);

    // Profile completeness
    const hasBio = !!user.bio;
    const hasLocation = !!user.location;
    const hasProfilePicture = user.avatar_url && !user.avatar_url.includes('identicon');

    return {
      totalRepos: nonForkRepos.length,
      avgStarsPerRepo: Math.round(avgStarsPerRepo * 10) / 10,
      totalForks,
      reposPerMonth: parseFloat(reposPerMonth),
      languageCount,
      hasPopularLanguages,
      contributions: contributions.totalCommits,
      lastYearActive: contributions.lastYearActive,
      profileCompleteness: {
        hasBio,
        hasLocation,
        hasProfilePicture,
        score: (hasBio ? 25 : 0) + (hasLocation ? 25 : 0) + (hasProfilePicture ? 50 : 0)
      }
    };
  }
}

module.exports = new GitHubService();
