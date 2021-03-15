const path = require('path');
const core = require('@actions/core');
const simpleGit = require('simple-git');

const stripMerge = require('./git-strip-merge.js');

async function run() {
  const baseDir = path.join(process.cwd());
  const git = simpleGit({ baseDir });
  const releaseTag = core.getInput('release-tag', { required: true });
  const excluded = core.getInput('exclude', { required: true });
  const releaseBranchName = core.getInput('release-branch', { required: true });
  const upstreamBranchName = core.getInput('upstream-branch', {
    required: true,
  });

  let excludedPatterns = [];

  // Try to parse the `exclude` input
  try {
    const parsed = JSON.parse(excluded);
    if (
      Array.isArray(parsed) &&
      parsed.find((item) => typeof item !== 'string') === undefined
    ) {
      excludedPatterns = parsed;
    }
  } catch (error) {
    if (excluded) {
      excludedPatterns = [excluded];
    }
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

  // Push tag back to repo
  git.pushTags('origin');
}

try {
  run();
} catch (error) {
  console.log(error);
}
