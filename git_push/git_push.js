const simpleGit = require('simple-git');
const git = simpleGit();

async function pushFileToRepo(filePath, repoUrl, branch = 'main') {
    try {
        await git.remote(['set-url', 'origin', repoUrl]); // Set remote repository
        await git.fetch(); // Fetch latest changes

        console.log('Pulling latest changes...');
        await git.pull('origin', branch, { '--allow-unrelated-histories': null });

        await git.add(filePath); // Add only the specific file
        await git.commit(`Automated commit: ${filePath}`);
        await git.push('origin', branch);

        console.log(`Successfully pushed ${filePath} to ${repoUrl} on branch ${branch}`);
    } catch (error) {
        console.error(`Error pushing ${filePath} to ${repoUrl}:`, error);
    }
}

// Example: Push a single file
pushFileToRepo('/home/omax_pumpfun/gitpush/push.txt', 'https://github.com/kingaimaster94/gitpush.git', 'main');
