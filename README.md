[![Stand With Palestine](https://raw.githubusercontent.com/TheBSD/StandWithPalestine/main/banner-no-action.svg)](https://TheBSD.github.io/StandWithPalestine/)

# froghramar.github.io
Personal Website

A personal portfolio website with automated GitHub project integration. The site automatically fetches project details from GitHub and generates a projects section on the homepage.

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── site/                        # Website files (deployed to GitHub Pages)
│   ├── index.html              # Main homepage
│   ├── assets/                 # Images, icons, etc.
│   └── ...                     # Other static files
├── projects.json               # GitHub projects configuration
├── projects-template.html      # HTML template for projects section
├── generate-projects.js        # Script to fetch and generate projects
└── README.md                   # This file
```

## 🚀 Setup

### Prerequisites

- Node.js 20+ installed
- A GitHub repository for your website
- GitHub Pages enabled in your repository settings

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/froghramar.github.io.git
   cd froghramar.github.io
   ```

2. **Test the project generation script locally**
   ```bash
   node generate-projects.js
   ```
   
   This will:
   - Read `projects.json` to get your GitHub project list
   - Fetch project details from GitHub API
   - Generate the projects section HTML
   - Update `site/index.html` with the generated content

3. **View your site locally**
   - Open `site/index.html` in your browser, or
   - Use a local server:
     ```bash
     # Using Python
     cd site
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server site -p 8000
     ```
   - Visit `http://localhost:8000` in your browser

## ⚙️ Configuration

### Adding GitHub Projects

Edit `projects.json` to add your GitHub repositories:

```json
{
  "projects": [
    {
      "owner": "froghramar",
      "repo": "my-awesome-project"
    },
    {
      "owner": "froghramar",
      "repo": "another-project"
    }
  ]
}
```

**Format:** `owner/repo` where:
- `owner` is your GitHub username or organization name
- `repo` is the repository name

### Customizing Projects Display

Edit `projects-template.html` to customize the styling and layout of your projects section. The template uses placeholder variables that are automatically populated by the script:

- `{{PROJECT_URL}}` - GitHub repository URL
- `{{PROJECT_NAME}}` - Repository name
- `{{PROJECT_DESCRIPTION}}` - Repository description (truncated to 120 chars)
- `{{LANGUAGE}}` - Primary programming language
- `{{LANGUAGE_COLOR}}` - Color code for the language indicator
- `{{STARS}}` - Number of stars
- `{{FORKS}}` - Number of forks
- `{{UPDATED_DATE}}` - Last updated date

**Template Structure:**
- The section wrapper and heading are at the top
- An example project item is between `<!-- PROJECT_ITEMS_PLACEHOLDER -->` and `<!-- END_PROJECT_ITEM_TEMPLATE -->`
- The script uses this example to generate all project items
- Modify the example item's HTML/CSS to change how all projects are displayed

## 🚢 Deployment

### GitHub Pages Setup

1. **Enable GitHub Pages**
   - Go to your repository Settings
   - Navigate to **Pages** in the left sidebar
   - Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
   - Save the settings

2. **Deploy automatically**
   - Push your changes to the `main` branch
   - The GitHub Action will automatically:
     - Run the project generation script
     - Build your site
     - Deploy to GitHub Pages

3. **Manual deployment**
   - Go to the **Actions** tab in your repository
   - Select the "Deploy to GitHub Pages" workflow
   - Click **Run workflow** to manually trigger a deployment

### Deployment Process

The GitHub Actions workflow (`.github/workflows/deploy.yml`) performs these steps:

1. **Checkout** - Gets your repository code
2. **Setup Node.js** - Installs Node.js 20
3. **Generate Projects HTML** - Runs `generate-projects.js` to fetch GitHub project data and generate HTML
4. **Setup Pages** - Configures GitHub Pages
5. **Upload Artifact** - Packages the `site` folder
6. **Deploy** - Publishes to GitHub Pages

## 🔧 How It Works

1. **Project Data Fetching**
   - The script reads `projects.json` to get a list of GitHub repositories
   - For each repository, it calls the GitHub API to fetch:
     - Repository name, description, URL
     - Primary programming language
     - Star and fork counts
     - Last updated date

2. **HTML Generation**
   - The script reads `projects-template.html`
   - Extracts the project item template (between the placeholder comments)
   - For each project, replaces placeholders with actual data
   - Generates the complete projects section HTML

3. **Site Update**
   - The generated HTML is inserted into `site/index.html`
   - The projects section appears before the "Get In Touch" section

4. **Deployment**
   - The updated `site` folder is deployed to GitHub Pages
   - Your live site automatically shows the latest project information

## 📝 Notes

- The script uses the GitHub API (no authentication required for public repos)
- For higher rate limits, GitHub Actions automatically provides `GITHUB_TOKEN`
- Projects are sorted by last updated date (most recent first)
- Descriptions are automatically truncated to 120 characters
- The script includes XSS protection by escaping HTML in project data

## 🛠️ Troubleshooting

**Projects not showing up?**
- Check that your repositories in `projects.json` are public
- Verify the owner/repo names are correct
- Check the GitHub Actions logs for API errors

**Styling not working?**
- Make sure you're editing `projects-template.html` (not the generated HTML in `site/index.html`)
- The generated HTML is overwritten on each deployment

**Deployment failing?**
- Ensure GitHub Pages is set to use "GitHub Actions" as the source
- Check that your default branch is `main` (or update the workflow file)
- Review the Actions tab for error messages

## 📄 License

This project is open source and available for personal use.