const simpleGit = require('simple-git');

async function pushToRepo(repoUrl, branch = 'main') {
    const git = simpleGit();
    
    try {
        await git.add('.');
        await git.commit(`Automated commit to ${repoUrl}`);
        await git.remote(['set-url', 'origin', repoUrl]); // Set the target repo
        await git.push('origin', branch);

        console.log(`Changes pushed to ${repoUrl} on branch ${branch}`);
    } catch (error) {
        console.error(`Error pushing to ${repoUrl}:`, error);
    }
}

// Example: Push to a specific GitHub repository
pushToRepo('https://github.com/kingaimaster94/gitpush.git', 'main');
