const path = require('path');
const core = require('@actions/core');
const simpleGit = require('simple-git');

const stripMerge = require('./git-strip-merge.js');

async function run() {
  const baseDir = path.join(process.cwd());
  const git = simpleGit({ baseDir });
  const releaseTag = core.getInput('release-tag', { required: true });
  const releaseBranchName = 'release';
  const upstreamBranchName = 'main';

  // Push commits & tags on behalf of GitHub Actions bot
  // https://github.com/actions/checkout/issues/13#issuecomment-724415212
  await git.addConfig('user.name', 'github-actions[bot]');
  await git.addConfig(
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com'
  );

  // Switch to the release branch
  await git.checkout(releaseBranchName);
  await stripMerge(git, upstreamBranchName, ['src/*']);

  core.info(`Creating new tag ${releaseTag}`);
  await git.addAnnotatedTag(releaseTag, `Release ${releaseTag}`);

  // Push tag back to repo
  git.pushTags('origin');
}

try {
  run();
} catch (error) {
  console.log(error);
}
