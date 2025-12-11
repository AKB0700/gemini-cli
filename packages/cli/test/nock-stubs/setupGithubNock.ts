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

  // If tests need to contact localhost (rare), allow it explicitly:
  // nock.enableNetConnect('127.0.0.1');

  // Mock all workflow and command file downloads
  // The test expects the filename to be returned as content
  const workflows = [
    'gemini-dispatch/gemini-dispatch.yml',
    'gemini-assistant/gemini-invoke.yml',
    'issue-triage/gemini-triage.yml',
    'issue-triage/gemini-scheduled-triage.yml',
    'pr-review/gemini-review.yml',
  ];

  const commands = [
    'gemini-assistant/gemini-invoke.toml',
    'issue-triage/gemini-scheduled-triage.toml',
    'issue-triage/gemini-triage.toml',
    'pr-review/gemini-review.toml',
  ];

  const allPaths = [...workflows, ...commands];

  const scope = nock('https://raw.githubusercontent.com');

  // For each file path, intercept the request and return the filename as content
  for (const filePath of allPaths) {
    const filename = filePath.split('/').pop() || '';
    scope
      .get(`/google-github-actions/run-gemini-cli/refs/tags/v1.2.3/examples/workflows/${filePath}`)
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
