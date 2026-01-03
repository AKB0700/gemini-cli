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
  // Skip authentication when using fake responses for testing
  if (config.fakeResponses) {
    try {
      // Still need to call refreshAuth to initialize the FakeContentGenerator
      // Use a dummy auth type since it won't be used
      await config.refreshAuth('gemini-api-key' as AuthType);
    } catch (e) {
      return `Failed to initialize fake responses. Message: ${getErrorMessage(e)}`;
    }
    return null;
  }

  if (!authType) {
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
