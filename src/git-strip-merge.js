/**
 * Git release flow that deletes files from branch before merging
 * --
 * Original by Rodrigo Silva, adapted for JavaScript
 * https://stackoverflow.com/a/10220276/831465
 * --
 * Copyright (C) 2012 Rodrigo Silva (MestreLion) <linux@rodrigosilva.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not see <http://www.gnu.org/licenses/gpl.html>
 */
module.exports = async function gitStripMerge(
  git,
  branch,
  excludePaths,
  {
    deleteCommitMessage = 'delete commit',
    mergeCommitMessage = 'merge commit',
  } = {}
) {
  async function gitBranch(refName) {
    // Get current head
    const output = await git.raw(['symbolic-ref', refName]);

    // Extract branchName from refName
    const match = output.match(/refs\/heads\/(.*)/);
    if (match && match[1]) {
      return match[1];
    }

    return git.revparse(refName);
  }

  const original = await gitBranch('HEAD');
  const branchSha = await git.revparse(branch);

  await git.checkout(original);

  await git.checkout(branchSha);
  await git.raw(['rm', '-rf', ...excludePaths]);
  await git.commit(deleteCommitMessage);
  const newSha = await git.revparse('HEAD');
  await git.checkout(original);
  await git.merge(['-m', mergeCommitMessage, newSha, '--no-ff']);
};
