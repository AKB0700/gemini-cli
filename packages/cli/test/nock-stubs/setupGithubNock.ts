/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import nock from 'nock';

/**
 * Install a nock stub to intercept the specific raw.githubusercontent.com
 * request used by setupGithubCommand tests and return a small mock workflow.
 *
 * This function also disables real network connections to avoid flakiness.
 */
export function installSetupGithubNock() {
  // Prevent any real network calls during tests (except those explicitly allowed)
  nock.disableNetConnect();

  // If tests need to contact localhost during the run, allow it explicitly:
  // nock.enableNetConnect('127.0.0.1');

  const scope = nock('https://raw.githubusercontent.com')
    .persist() // Allow the same interceptor to be used multiple times
    .get(
      /\/google-github-actions\/run-gemini-cli\/refs\/tags\/v1\.2\.3\/examples\/workflows\/.*/,
    )
    .reply(function (uri) {
      // Extract the filename from the URL to return it as content
      // This matches the existing test behavior where the filename is returned as content
      const filename = uri.split('/').pop() || 'unknown';
      return [
        200,
        filename,
        {
          'Content-Type': 'text/plain',
        },
      ];
    });

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
