/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import nock from 'nock';

export function installSetupGithubNock() {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');

  const replyBody = `name: mock workflow
on: [push]
jobs:
  noop:
    runs-on: ubuntu-latest
    steps: []`;
  const headers = { 'Content-Type': 'text/yaml; charset=utf-8' };

  // Precise single-use stubs
  nock('https://raw.githubusercontent.com')
    .get(/\/run-gemini-cli\/refs\/tags\/[^/]+\/.*gemini-dispatch\.yml(\?.*)?$/)
    .reply((uri) => {
      console.log('[nock] hit tag-variant:', uri);
      return [200, replyBody, headers];
    });

  nock('https://raw.githubusercontent.com')
    .get(/\/run-gemini-cli\/refs\/heads\/[^/]+\/.*gemini-dispatch\.yml(\?.*)?$/)
    .reply((uri) => {
      console.log('[nock] hit head-variant:', uri);
      return [200, replyBody, headers];
    });

  // Generic persistent fallback: logs a WARN so we can add a precise stub later
  nock('https://raw.githubusercontent.com')
    .persist()
    .get(/gemini-dispatch\.yml(\?.*)?$/)
    .reply((uri) => {
      console.warn(
        '[nock][FALLBACK WARN] generic stub hit; consider adding a precise stub for:',
        uri,
      );
      return [200, replyBody, headers];
    });

  console.log(
    '[nock] install: mixed stubs (precise single-use + persistent fallback)',
  );
}

export function cleanupSetupGithubNock() {
  console.log('[nock] pendingMocks before cleanup:', nock.pendingMocks());
  nock.cleanAll();
  nock.enableNetConnect();
  console.log('[nock] cleanup complete');
}
