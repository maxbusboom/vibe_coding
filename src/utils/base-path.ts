// Helper function to determine the base path for assets based on the deployment environment
export function getBasePath(): string {
    // Check if we're running on GitHub Pages
    const isGithubPages = window.location.hostname.includes('github.io');
    
    // If on GitHub Pages, we need the repository name as the base path
    // Modify this if your repository name is different
    // With our new structure, assets are in the root
    return isGithubPages ? '/ass-teroids' : '';
}
