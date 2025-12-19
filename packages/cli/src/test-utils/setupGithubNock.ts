/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import nock from 'nock';

/**
 * Helper to set up nock stubs for GitHub raw content downloads
 * used by setupGithubCommand tests.
 */

const GITHUB_HOST = 'https://raw.githubusercontent.com';
const REPO_PATH = '/google-github-actions/run-gemini-cli';
const SOURCE_DIR = 'examples/workflows';

// Workflow and command paths that need to be mocked
const GITHUB_WORKFLOW_PATHS = [
  'gemini-dispatch/gemini-dispatch.yml',
  'gemini-assistant/gemini-invoke.yml',
  'issue-triage/gemini-triage.yml',
  'issue-triage/gemini-scheduled-triage.yml',
  'pr-review/gemini-review.yml',
];

const GITHUB_COMMANDS_PATHS = [
  'gemini-assistant/gemini-invoke.toml',
  'issue-triage/gemini-scheduled-triage.toml',
  'issue-triage/gemini-triage.toml',
  'pr-review/gemini-review.toml',
];

/**
 * Install nock interceptors for GitHub raw content downloads.
 * @param releaseTag - The release tag to use in the URL (e.g., 'v1.2.3')
 */
export function installGithubNock(releaseTag: string = 'v1.2.3'): void {
  // Disable all real network connections during tests
  nock.disableNetConnect();

  const allPaths = [...GITHUB_WORKFLOW_PATHS, ...GITHUB_COMMANDS_PATHS];

  // Set up interceptors for each file path
  allPaths.forEach((filePath) => {
    const urlPath = `/refs/tags/${releaseTag}/${SOURCE_DIR}/${filePath}`;
    const filename = filePath.split('/').pop() || filePath;

    nock(GITHUB_HOST)
      .get(`${REPO_PATH}${urlPath}`)
      .reply(200, `name: mock ${filename}\n# Mock content for ${filename}`, {
        'Content-Type': 'text/plain',
      });
  });
}

/**
 * Clean up nock after tests and re-enable network connections.
 */
export function cleanupGithubNock(): void {
  nock.cleanAll();
  nock.restore();
  nock.enableNetConnect();
}

/**
 * Restore nock to its initial state (for use between tests).
 */
export function resetGithubNock(): void {
  nock.cleanAll();
}
