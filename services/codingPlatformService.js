const axios = require('axios');
const cheerio = require('cheerio');

class CodingPlatformService {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
  }

  async analyzeLeetCode(username) {
    try {
      // LeetCode GraphQL API
      const graphqlQuery = {
        query: `
          query getUserProfile($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              username
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
                totalSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
              profile {
                reputation
                ranking
              }
              skills {
                name
                level
              }
              languageProblemCount {
                languageName
                problemsSolved
              }
            }
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
              globalRanking
              totalParticipants
              topPercentage
            }
          }
        `,
        variables: { username }
      };

      const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
        headers: this.headers
      });

      const data = response.data.data;

      if (!data.matchedUser) {
        throw new Error(`LeetCode user '${username}' not found`);
      }

      const analysis = {
        username: data.matchedUser.username,
        profile: {
          reputation: data.matchedUser.profile?.reputation || 0,
          ranking: data.matchedUser.profile?.ranking || 0
        },
        problemStats: {
          totalSolved: this.getTotalSolved(data.allQuestionsCount, data.matchedUser.submitStats.acSubmissionNum),
          easySolved: this.getDifficultySolved(data.matchedUser.submitStats.acSubmissionNum, 'Easy'),
          mediumSolved: this.getDifficultySolved(data.matchedUser.submitStats.acSubmissionNum, 'Medium'),
          hardSolved: this.getDifficultySolved(data.matchedUser.submitStats.acSubmissionNum, 'Hard'),
          totalSubmissions: this.getTotalSubmissions(data.matchedUser.submitStats.totalSubmissionNum),
          acceptanceRate: this.calculateAcceptanceRate(data.matchedUser.submitStats)
        },
        contests: data.userContestRanking ? {
          attended: data.userContestRanking.attendedContestsCount,
          rating: data.userContestRanking.rating,
          globalRanking: data.userContestRanking.globalRanking,
          topPercentage: data.userContestRanking.topPercentage
        } : null,
        skills: data.matchedUser.skills || [],
        languages: data.matchedUser.languageProblemCount || [],
        metrics: this.calculateLeetCodeMetrics(data)
      };

      return analysis;

    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`LeetCode user '${username}' not found`);
      }
      throw new Error(`Failed to analyze LeetCode profile: ${error.message}`);
    }
  }

  async analyzeCodeChef(username) {
    try {
      // CodeChef API endpoint
      const apiUrl = `https://www.codechef.com/users/${username}`;
      
      const response = await axios.get(apiUrl, {
        headers: this.headers
      });

      const $ = cheerio.load(response.data);

      // Extract data from the HTML
      const profileData = this.parseCodeChefProfile($);

      if (!profileData.found) {
        throw new Error(`CodeChef user '${username}' not found`);
      }

      const analysis = {
        username: username,
        profile: {
          name: profileData.name,
          country: profileData.country,
          currentRating: profileData.currentRating,
          highestRating: profileData.highestRating,
          stars: profileData.stars,
          globalRank: profileData.globalRank,
          countryRank: profileData.countryRank
        },
        problemStats: {
          fullySolved: profileData.fullySolved,
          partiallySolved: profileData.partiallySolved,
          totalProblems: profileData.totalProblems,
          contests: profileData.contests
        },
        skills: profileData.skills,
        languages: profileData.languages,
        metrics: this.calculateCodeChefMetrics(profileData)
      };

      return analysis;

    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`CodeChef user '${username}' not found`);
      }
      throw new Error(`Failed to analyze CodeChef profile: ${error.message}`);
    }
  }

  parseCodeChefProfile($) {
    // Check if user exists
    if ($('.user-details').length === 0) {
      return { found: false };
    }

    const profileData = {
      found: true,
      name: $('.user-details h1').text().trim(),
      country: $('.user-details .user-country').text().trim(),
      currentRating: parseInt($('.rating-number').text().trim()) || 0,
      highestRating: parseInt($('.rating-header .small').text().match(/Highest:\s*(\d+)/)?.[1]) || 0,
      stars: $('.rating-star').length || 0,
      globalRank: this.parseRank($('.global-rank').text()),
      countryRank: this.parseRank($('.country-rank').text()),
      fullySolved: parseInt($('.problems-solved .fully-solved').text().trim()) || 0,
      partiallySolved: parseInt($('.problems-solved .partially-solved').text().trim()) || 0,
      contests: parseInt($('.contest-participated').text().trim()) || 0
    };

    // Extract skills from sections
    const skills = [];
    $('.skills-section .skill-tag').each((i, elem) => {
      skills.push($(elem).text().trim());
    });
    profileData.skills = skills;

    // Extract languages
    const languages = [];
    $('.language-stats .language-item').each((i, elem) => {
      const langName = $(elem).find('.language-name').text().trim();
      const problemsSolved = parseInt($(elem).find('.problems-count').text().trim()) || 0;
      if (langName && problemsSolved > 0) {
        languages.push({ language: langName, problemsSolved });
      }
    });
    profileData.languages = languages;

    // Calculate total problems available
    profileData.totalProblems = this.getTotalCodeChefProblems($);

    return profileData;
  }

  parseRank(rankText) {
    const match = rankText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  getTotalCodeChefProblems($) {
    // This is an approximation - actual total would need to be fetched from problems API
    return 3000; // Approximate current problem count
  }

  getTotalSolved(allQuestions, acSubmissions) {
    if (!acSubmissions) return 0;
    return acSubmissions.reduce((total, item) => total + item.count, 0);
  }

  getDifficultySolved(acSubmissions, difficulty) {
    if (!acSubmissions) return 0;
    const item = acSubmissions.find(item => item.difficulty === difficulty);
    return item ? item.count : 0;
  }

  getTotalSubmissions(totalSubmissions) {
    if (!totalSubmissions) return 0;
    return totalSubmissions.reduce((total, item) => total + item.submissions, 0);
  }

  calculateAcceptanceRate(submitStats) {
    if (!submitStats.acSubmissionNum || !submitStats.totalSubmissionNum) {
      return 0;
    }

    const totalAC = submitStats.acSubmissionNum.reduce((sum, item) => sum + item.submissions, 0);
    const totalSubmissions = submitStats.totalSubmissionNum.reduce((sum, item) => sum + item.submissions, 0);

    return totalSubmissions > 0 ? Math.round((totalAC / totalSubmissions) * 100) : 0;
  }

  calculateLeetCodeMetrics(data) {
    const acSubmissions = data.matchedUser.submitStats.acSubmissionNum;
    const totalSolved = this.getTotalSolved(data.allQuestionsCount, acSubmissions);
    const easySolved = this.getDifficultySolved(acSubmissions, 'Easy');
    const mediumSolved = this.getDifficultySolved(acSubmissions, 'Medium');
    const hardSolved = this.getDifficultySolved(acSubmissions, 'Hard');

    // Calculate difficulty balance
    const total = easySolved + mediumSolved + hardSolved;
    const easyPercent = total > 0 ? (easySolved / total) * 100 : 0;
    const mediumPercent = total > 0 ? (mediumSolved / total) * 100 : 0;
    const hardPercent = total > 0 ? (hardSolved / total) * 100 : 0;

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(totalSolved, data.userContestRanking);

    return {
      totalSolved,
      difficultyBalance: {
        easy: Math.round(easyPercent),
        medium: Math.round(mediumPercent),
        hard: Math.round(hardPercent)
      },
      consistencyScore,
      contestParticipation: data.userContestRanking ? data.userContestRanking.attendedContestsCount : 0,
      skillLevel: this.getSkillLevel(totalSolved, data.userContestRanking?.rating)
    };
  }

  calculateCodeChefMetrics(profileData) {
    const { currentRating, fullySolved, contests } = profileData;
    
    // Calculate problem solving consistency
    const avgProblemsPerContest = contests > 0 ? fullySolved / contests : 0;
    
    // Rating progression
    const ratingProgression = profileData.highestRating > 0 
      ? (currentRating / profileData.highestRating) * 100 
      : 0;

    return {
      avgProblemsPerContest: Math.round(avgProblemsPerContest * 10) / 10,
      ratingProgression: Math.round(ratingProgression),
      skillLevel: this.getCodeChefSkillLevel(currentRating),
      consistency: this.calculateCodeChefConsistency(fullySolved, contests)
    };
  }

  calculateConsistencyScore(totalSolved, contestData) {
    if (!contestData || contestData.attendedContestsCount === 0) {
      return 0;
    }

    // Higher score for consistent problem solving and contest participation
    const contestScore = Math.min(contestData.attendedContestsCount * 2, 20);
    const problemScore = Math.min(totalSolved / 10, 20);
    const ratingScore = contestData.rating ? Math.min(contestData.rating / 50, 20) : 0;

    return Math.round(contestScore + problemScore + ratingScore);
  }

  calculateCodeChefConsistency(problemsSolved, contests) {
    if (contests === 0) return 0;
    
    // Consistency based on problems solved per contest
    const problemsPerContest = problemsSolved / contests;
    
    if (problemsPerContest >= 5) return 'high';
    if (problemsPerContest >= 2) return 'medium';
    return 'low';
  }

  getSkillLevel(totalSolved, contestRating) {
    if (totalSolved >= 300 || contestRating >= 2000) return 'expert';
    if (totalSolved >= 200 || contestRating >= 1600) return 'advanced';
    if (totalSolved >= 100 || contestRating >= 1400) return 'intermediate';
    if (totalSolved >= 50 || contestRating >= 1200) return 'beginner';
    return 'novice';
  }

  getCodeChefSkillLevel(rating) {
    if (rating >= 2400) return 'grandmaster';
    if (rating >= 2200) return 'master';
    if (rating >= 2000) return 'candidate-master';
    if (rating >= 1800) return 'expert';
    if (rating >= 1600) return 'advanced';
    if (rating >= 1400) return 'intermediate';
    if (rating >= 1200) return 'beginner';
    return 'novice';
  }
}

module.exports = new CodingPlatformService();
