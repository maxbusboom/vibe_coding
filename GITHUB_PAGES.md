# GitHub Pages Deployment Guide

This document provides detailed instructions for deploying the Ass-teroids game to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your machine

## Deployment Steps

1. **Fork or Clone the Repository**
   
   If you haven't already, fork or clone this repository to your GitHub account.

2. **Update Base Path (if necessary)**
   
   If your repository name is not `ass-teroids`, update the base path in `src/utils/base-path.ts`:
   
   ```typescript
   return isGithubPages ? '/your-repository-name' : '';
   ```

3. **Build the Project**
   
   Ensure all dependencies are installed and build the project:
   
   ```bash
   npm install
   npm run build
   ```
   
   This will create or update the `/docs` folder with all necessary files.

4. **Push to GitHub**
   
   Commit and push the changes to your GitHub repository:
   
   ```bash
   git add .
   git commit -m "Build for GitHub Pages"
   git push
   ```

5. **Configure GitHub Pages**
   
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to the "GitHub Pages" section (or navigate to "Pages" in the sidebar)
   - Under "Source", select "Deploy from a branch"
   - From the branch dropdown, select your main branch (usually `main` or `master`)
   - From the folder dropdown, select `/ (root)`
   - Click "Save"

6. **Access Your Game**
   
   Wait a few minutes for GitHub to build and deploy your site. Once deployed, your game will be available at:
   
   ```
   https://your-username.github.io/your-repository-name/
   ```

## Troubleshooting

- If assets don't load, ensure the base path in `src/utils/base-path.ts` matches your repository name
- If the page is blank, check the browser console for errors
- Make sure the `.nojekyll` file exists in your docs folder
- If you get a 404, ensure GitHub Pages is correctly configured in your repository settings

## Updating Your Deployment

Any time you make changes to the game, rebuild the project with `npm run build` and push the changes to GitHub. The deployment will update automatically after a few minutes.
