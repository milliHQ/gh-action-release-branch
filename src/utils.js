const core = require('@actions/core');

/**
 * Parse a multiline input as string
 *
 * @param {string} name
 * @param {*} options
 * @returns
 */
function getInputAsArray(name, options) {
  return core
    .getInput(name, options)
    .split('\n')
    .map((s) => s.trim())
    .filter((x) => x !== '');
}

export { getInputAsArray };
