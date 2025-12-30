/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type AuthType,
  type Config,
  getErrorMessage,
} from '@google/gemini-cli-core';

/**
 * Handles the initial authentication flow.
 * @param config The application config.
 * @param authType The selected auth type.
 * @returns An error message if authentication fails, otherwise null.
 */
export async function performInitialAuth(
  config: Config,
  authType: AuthType | undefined,
): Promise<string | null> {
  if (!authType) {
    return null;
  }

  // Skip auth validation if using fake responses (test mode)
  const usingFakeResponses = config.fakeResponses || config.recordResponses;
  const isIntegrationTest = !!process.env['INTEGRATION_TEST_FILE_DIR'];

  if (usingFakeResponses || isIntegrationTest) {
    return null;
  }

  try {
    await config.refreshAuth(authType);
    // The console.log is intentionally left out here.
    // We can add a dedicated startup message later if needed.
  } catch (e) {
    return `Failed to login. Message: ${getErrorMessage(e)}`;
  }

  return null;
}
