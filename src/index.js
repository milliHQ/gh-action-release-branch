const core = require('@actions/core');
const github = require('@actions/github');
const simpleGit = require('simple-git');

const stripMerge = require('./git-strip-merge.js');
const { getInputAsArray } = require('./utils.js');

async function run() {
  const baseDir = process.cwd();
  const git = simpleGit({ baseDir });
  const releaseTag = core.getInput('release-tag', { required: true });
  const excludedPatterns = getInputAsArray('exclude', { required: true });
  const releaseBranchName = core.getInput('release-branch', { required: true });
  // Upstream branch is the branch where the workflow is triggered from
  // github.context.ref has the format refs/heads/<branch-name>
  const upstreamBranchName = github.context.ref.substring('refs/heads/'.length);

  if (!upstreamBranchName) {
    core.setFailed(
      `Failed to get the upstream branch name from the GitHub context. Got: ${github.context.ref}`
    );
  }

  // Push commits & tags on behalf of GitHub Actions bot
  // https://github.com/actions/checkout/issues/13#issuecomment-724415212
  await git.addConfig('user.name', 'github-actions[bot]');
  await git.addConfig(
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com'
  );

  // Switch to the release branch
  await git.checkout(releaseBranchName);
  await stripMerge(git, upstreamBranchName, excludedPatterns);

  core.info(`Creating new tag ${releaseTag}`);
  await git.addAnnotatedTag(releaseTag, `Release ${releaseTag}`);

  // Push commits & tag back to repo
  git.push('origin', releaseBranchName);
  git.pushTags('origin');
}

try {
  run();
} catch (error) {
  console.log(error);
}
