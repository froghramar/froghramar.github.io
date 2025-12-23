const fs = require('fs');
const path = require('path');
const https = require('https');

// Read projects.json
const projectsConfig = JSON.parse(fs.readFileSync('projects.json', 'utf8'));

// GitHub API function
function fetchGitHubRepo(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: {
        'User-Agent': 'GitHub-Pages-Builder',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    // Use token if available (for higher rate limits)
    if (process.env.GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else if (res.statusCode === 404) {
          reject(new Error(`Repository ${owner}/${repo} not found`));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} - ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Generate HTML for a single project item using template
function generateProjectItemHTML(project, itemTemplate) {
  const description = project.description || 'No description available';
  const truncatedDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;
  const language = project.language || 'Unknown';
  const stars = project.stargazers_count || 0;
  const forks = project.forks_count || 0;
  const updated = new Date(project.updated_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const languageColor = getLanguageColor(language);

  return itemTemplate
    .replace(/\{\{PROJECT_URL\}\}/g, project.html_url)
    .replace(/\{\{PROJECT_NAME\}\}/g, escapeHtml(project.name))
    .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, escapeHtml(truncatedDescription))
    .replace(/\{\{LANGUAGE\}\}/g, escapeHtml(language))
    .replace(/\{\{LANGUAGE_COLOR\}\}/g, languageColor)
    .replace(/\{\{STARS\}\}/g, stars.toString())
    .replace(/\{\{FORKS\}\}/g, forks.toString())
    .replace(/\{\{UPDATED_DATE\}\}/g, updated);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Extract item template from the full template
function extractItemTemplate(fullTemplate) {
  const placeholderStart = fullTemplate.indexOf('<!-- PROJECT_ITEMS_PLACEHOLDER -->');
  const placeholderEnd = fullTemplate.indexOf('<!-- END_PROJECT_ITEM_TEMPLATE -->');
  
  if (placeholderStart === -1 || placeholderEnd === -1) {
    throw new Error('Template placeholders not found. Make sure projects-template.html contains <!-- PROJECT_ITEMS_PLACEHOLDER --> and <!-- END_PROJECT_ITEM_TEMPLATE -->');
  }
  
  // Extract the item template (the example div between the placeholders)
  return fullTemplate.substring(placeholderStart + '<!-- PROJECT_ITEMS_PLACEHOLDER -->'.length, placeholderEnd).trim();
}

// Generate HTML for projects using template
function generateProjectsHTML(projects, fullTemplate) {
  if (projects.length === 0) {
    return '';
  }

  // Extract the item template from the full template
  const itemTemplate = extractItemTemplate(fullTemplate);

  // Generate project items
  const projectItems = projects.map(project => generateProjectItemHTML(project, itemTemplate)).join('\n        ');

  // Replace everything between the placeholders (including the example item) with generated items
  const placeholderStart = fullTemplate.indexOf('<!-- PROJECT_ITEMS_PLACEHOLDER -->');
  const placeholderEnd = fullTemplate.indexOf('<!-- END_PROJECT_ITEM_TEMPLATE -->');
  const beforePlaceholder = fullTemplate.substring(0, placeholderStart + '<!-- PROJECT_ITEMS_PLACEHOLDER -->'.length);
  const afterPlaceholder = fullTemplate.substring(placeholderEnd);
  
  return beforePlaceholder + '\n        ' + projectItems + '\n        ' + afterPlaceholder;
}

// Get color for programming language
function getLanguageColor(language) {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C#': '#239120',
    'C++': '#f34b7d',
    'C': '#555555',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#A97BFF',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'PowerShell': '#012456',
    'Dockerfile': '#384d54',
    'Unknown': '#cccccc'
  };
  return colors[language] || colors['Unknown'];
}

// Main function
async function main() {
  console.log('Fetching project details from GitHub...');
  
  const projects = [];
  const errors = [];

  for (const projectConfig of projectsConfig.projects) {
    try {
      console.log(`Fetching ${projectConfig.owner}/${projectConfig.repo}...`);
      const repoData = await fetchGitHubRepo(projectConfig.owner, projectConfig.repo);
      projects.push(repoData);
    } catch (error) {
      console.error(`Error fetching ${projectConfig.owner}/${projectConfig.repo}:`, error.message);
      errors.push({ repo: `${projectConfig.owner}/${projectConfig.repo}`, error: error.message });
    }
  }

  if (errors.length > 0) {
    console.warn('\nSome projects failed to fetch:');
    errors.forEach(err => {
      console.warn(`  - ${err.repo}: ${err.error}`);
    });
  }

  if (projects.length === 0) {
    console.log('No projects to display.');
    return;
  }

  // Sort by updated date (most recent first)
  projects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  // Read the single template file
  const pageTemplate = fs.readFileSync('projects-template.html', 'utf8');

  // Generate projects HTML using template
  const projectsPageContent = generateProjectsHTML(projects, pageTemplate);

  // Write projects.html
  const projectsPath = path.join('site', 'projects.html');
  fs.writeFileSync(projectsPath, projectsPageContent, 'utf8');
  console.log(`\n✅ Successfully generated projects page with ${projects.length} project(s)`);
  console.log(`✅ Created ${projectsPath}`);
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

