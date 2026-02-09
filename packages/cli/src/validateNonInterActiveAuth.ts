/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Config } from '@google/gemini-cli-core';
import {
  AuthType,
  debugLogger,
  OutputFormat,
  ExitCodes,
  credentialRetriever,
} from '@google/gemini-cli-core';
import { USER_SETTINGS_PATH } from './config/settings.js';
import { validateAuthMethod } from './config/auth.js';
import { type LoadedSettings } from './config/settings.js';
import { handleError } from './utils/errors.js';
import { runExitCleanup } from './utils/cleanup.js';

async function getAuthTypeFromEnv(): Promise<AuthType | undefined> {
  if (process.env['GOOGLE_GENAI_USE_GCA'] === 'true') {
    return AuthType.LOGIN_WITH_GOOGLE;
  }
  if (process.env['GOOGLE_GENAI_USE_VERTEXAI'] === 'true') {
    return AuthType.USE_VERTEX_AI;
  }
  if (process.env['GEMINI_API_KEY']) {
    return AuthType.USE_GEMINI;
  }

  // Try automatic credential retrieval
  debugLogger.log(
    'No explicit auth type found, attempting automatic credential retrieval...',
  );
  const credential = await credentialRetriever.retrieveCredentials();

  if (credential) {
    debugLogger.log(
      `Automatically detected credentials from: ${credential.source}`,
    );

    // Set the appropriate environment variable based on the credential source
    if (credential.authType === 'gemini-api-key' && credential.value) {
      process.env['GEMINI_API_KEY'] = credential.value;
      return AuthType.USE_GEMINI;
    }

    if (credential.authType === 'vertex-ai') {
      return AuthType.USE_VERTEX_AI;
    }

    if (credential.authType === 'oauth-personal') {
      return AuthType.LOGIN_WITH_GOOGLE;
    }
  }

  return undefined;
}

export async function validateNonInteractiveAuth(
  configuredAuthType: AuthType | undefined,
  useExternalAuth: boolean | undefined,
  nonInteractiveConfig: Config,
  settings: LoadedSettings,
) {
  try {
    const effectiveAuthType =
      configuredAuthType || (await getAuthTypeFromEnv());

    const enforcedType = settings.merged.security.auth.enforcedType;
    if (enforcedType && effectiveAuthType !== enforcedType) {
      const message = effectiveAuthType
        ? `The enforced authentication type is '${enforcedType}', but the current type is '${effectiveAuthType}'. Please re-authenticate with the correct type.`
        : `The auth type '${enforcedType}' is enforced, but no authentication is configured.`;
      throw new Error(message);
    }

    if (!effectiveAuthType) {
      const message =
        `No authentication credentials found. Please:\n` +
        `1. Set GEMINI_API_KEY, GOOGLE_GENAI_USE_VERTEXAI, or GOOGLE_GENAI_USE_GCA environment variable, OR\n` +
        `2. Configure auth method in ${USER_SETTINGS_PATH}, OR\n` +
        `3. Authenticate with 'gcloud auth login' (credentials will be auto-detected)\n\n` +
        `Automatic credential detection checked:\n` +
        `- Environment variables (GEMINI_API_KEY, GOOGLE_API_KEY)\n` +
        `- Stored credentials (keychain/file)\n` +
        `- Google Cloud SDK (gcloud CLI)\n` +
        `- Application Default Credentials (ADC)`;
      throw new Error(message);
    }

    const authType: AuthType = effectiveAuthType;

    if (!useExternalAuth) {
      const err = validateAuthMethod(String(authType));
      if (err != null) {
        throw new Error(err);
      }
    }

    return authType;
  } catch (error) {
    if (nonInteractiveConfig.getOutputFormat() === OutputFormat.JSON) {
      handleError(
        error instanceof Error ? error : new Error(String(error)),
        nonInteractiveConfig,
        ExitCodes.FATAL_AUTHENTICATION_ERROR,
      );
    } else {
      debugLogger.error(error instanceof Error ? error.message : String(error));
      await runExitCleanup();
      process.exit(ExitCodes.FATAL_AUTHENTICATION_ERROR);
    }
  }
}
