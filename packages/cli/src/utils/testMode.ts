/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Determines if the CLI is running in integration test mode.
 *
 * @returns true if running in integration test mode, false otherwise
 */
export function isIntegrationTestMode(): boolean {
  return !!process.env['INTEGRATION_TEST_FILE_DIR'];
}

/**
 * Determines if the CLI should skip authentication.
 * This includes:
 * - Using fake responses (--fake-responses or --record-responses)
 * - Running in integration test mode
 *
 * @param fakeResponses - Path to fake responses file (from argv or config)
 * @param recordResponses - Path to record responses file (from argv or config)
 * @returns true if authentication should be skipped, false otherwise
 */
export function shouldSkipAuth(
  fakeResponses?: string,
  recordResponses?: string,
): boolean {
  return !!(fakeResponses || recordResponses || isIntegrationTestMode());
}
