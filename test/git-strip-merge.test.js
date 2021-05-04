const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const tmp = require('tmp');

const gitStripMerge = require('../src/git-strip-merge');

async function createFile(filePath, basePath, fileContent = '') {
  const baseDir = path.join(basePath, path.dirname(filePath));
  // Ensure that path exists
  fs.mkdirSync(baseDir, { recursive: true });
  fs.writeFileSync(path.join(basePath, filePath), fileContent);
}

describe('git strip merge', () => {
  let git;
  let tmpDir;
  let baseDir;
  let baseBranch;
  const releaseBranch = 'release';

  function fileExists(filePath) {
    return fs.existsSync(path.join(baseDir, filePath));
  }

  beforeEach(async () => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    baseDir = tmpDir.name;

    // Initialize git
    git = simpleGit({ baseDir });
    await git
      .init()
      .addConfig('user.name', 'Test')
      .addConfig('user.email', 'test@example.com')
      .commit('Initial commit', ['--allow-empty']);

    // Get the branchName from the initialization
    baseBranch = (await git.branch()).current;

    // Create release branch and switch back to the base branch
    await git.checkoutLocalBranch(releaseBranch).checkout(baseBranch);
  });

  test('Simple behaviour', async () => {
    const excludePaths = ['src/*', 'unused_path/*'];

    // Prepare repo
    createFile('main.tf', baseDir);
    createFile('src/some.js', baseDir);
    expect(fileExists('main.tf')).toBeTruthy();
    expect(fileExists('src/some.js')).toBeTruthy();
    await git.add('.').commit('Commit 1');

    // Run strip merge
    await git.checkout(releaseBranch);
    await gitStripMerge(git, baseBranch, excludePaths);

    expect(fileExists('main.tf')).toBeTruthy();
    expect(fileExists('src/some.js')).toBeFalsy();

    // Total number of commits should be 4
    let commitCount = await git.raw(['rev-list', '--count', releaseBranch]);
    expect(Number(commitCount)).toBe(4);

    // Edit excluded file
    await git.checkout(baseBranch);
    createFile('src/some.js', baseDir, 'newContent');
    expect(fileExists('src/some.js')).toBeTruthy();
    await git.add('.').commit('Commit 2');

    // Run strip merge again
    await git.checkout(releaseBranch);
    await gitStripMerge(git, baseBranch, excludePaths);

    expect(fileExists('main.tf')).toBeTruthy();
    expect(fileExists('src/some.js')).toBeFalsy();

    // Total number of commits should be 7
    commitCount = await git.raw(['rev-list', '--count', releaseBranch]);
    expect(Number(commitCount)).toBe(7);
  });

  test('Commit only non ignored files', async () => {
    const excludePaths = ['src/**/*'];

    createFile('main.tf', baseDir);
    expect(fileExists('main.tf')).toBeTruthy();
    await git.add('.').commit('Commit 1');

    createFile('variables.tf', baseDir);
    expect(fileExists('variables.tf')).toBeTruthy();
    await git.add('.').commit('Commit 2');

    let commitCount = await git.raw(['rev-list', '--count', baseBranch]);
    expect(Number(commitCount)).toBe(3);

    // Run strip merge
    await git.checkout(releaseBranch);
    await gitStripMerge(git, baseBranch, excludePaths);

    // Total number of commits should be 4 (No Delete commit)
    // - Initial Commit
    // - Commit 1
    // - Commit 2
    // - Merge Commit
    commitCount = await git.raw(['rev-list', '--count', releaseBranch]);
    expect(Number(commitCount)).toBe(4);
  });
});
