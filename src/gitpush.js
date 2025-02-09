const simpleGit = require('simple-git');

const git = simpleGit();

exports.pushFileToRepo = async (filePath, repoUrl, branch = 'main') => {
    try {
        await git.remote(['set-url', 'origin', repoUrl]); // Set remote repository
        await git.fetch(); // Fetch latest changes

        console.log('Pulling latest changes...');
        await git.pull('origin', branch, { '--allow-unrelated-histories': null });

        await git.add(filePath); // Add only the specific file
        await git.commit(`new token launched: ${filePath}`);
        await git.push('origin', branch);

        console.log(`Successfully pushed ${filePath} to ${repoUrl} on branch ${branch}`);
    } catch (error) {
        console.error(`Error pushing ${filePath} to ${repoUrl}:`, error);
    }
}

// Example: Push a single file
// pushFileToRepo('./sample3.txt', 'https://github.com/OMAXCHAIN/omaxfunasset.git', 'main');
