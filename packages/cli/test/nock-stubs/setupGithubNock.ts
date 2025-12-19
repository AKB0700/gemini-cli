/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import nock from 'nock';
import { GITHUB_WORKFLOW_PATHS, GITHUB_COMMANDS_PATHS } from '../../src/ui/commands/setupGithubCommand.js';

/**
 * Install a nock stub to intercept the specific raw.githubusercontent.com
 * request used by setupGithubCommand tests and return a small mock workflow.
 *
 * This function also disables real network connections to avoid flakiness.
 * 
 * @param releaseTag - The release tag to use for the mocked URLs (default: 'v1.2.3')
 */
export function installSetupGithubNock(releaseTag = 'v1.2.3') {
  // Prevent any real network calls during tests (except those explicitly allowed)
  nock.disableNetConnect();

  // If tests need to contact localhost (rare), allow it explicitly:
  // nock.enableNetConnect('127.0.0.1');

  // Mock all workflow and command file downloads
  // The test expects the filename to be returned as content
  const allPaths = [...GITHUB_WORKFLOW_PATHS, ...GITHUB_COMMANDS_PATHS];

  const scope = nock('https://raw.githubusercontent.com');

  // For each file path, intercept the request and return the filename as content
  for (const filePath of allPaths) {
    const filename = filePath.split('/').pop() || '';
    scope
      .get(`/google-github-actions/run-gemini-cli/refs/tags/${releaseTag}/examples/workflows/${filePath}`)
      .reply(200, filename, {
        'Content-Type': 'text/plain',
      });
  }

  return scope;
}

/**
 * Cleanup nock and re-enable network connections.
 * Call this in afterAll() of tests that installed the stub.
 */
export function cleanupSetupGithubNock() {
  nock.cleanAll();
  // Re-enable network connections for subsequent processes
  nock.enableNetConnect();
}

/**
 * Install a nock stub that returns 404 errors for all requests.
 * Useful for testing error handling.
 * 
 * @param releaseTag - The release tag to use for the mocked URLs (default: 'v1.2.3')
 */
export function installSetupGithubNockFailure(releaseTag = 'v1.2.3') {
  nock.disableNetConnect();
  
  // Use persist() to match all requests and return 404
  const scope = nock('https://raw.githubusercontent.com')
    .persist()
    .get(new RegExp(`/google-github-actions/run-gemini-cli/refs/tags/${releaseTag}/examples/workflows/.*`))
    .reply(404, 'Not Found');
  
  return scope;
}
