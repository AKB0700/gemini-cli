/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { debugLogger } from '../utils/debugLogger.js';
import { loadApiKey } from './apiKeyCredentialStorage.js';

const execAsync = promisify(exec);

export interface CredentialSource {
  source: string;
  value: string | null;
  authType?: string;
}

/**
 * Attempts to retrieve credentials from various sources automatically.
 * Checks multiple locations in priority order:
 * 1. Environment variables
 * 2. Stored credentials (keychain/file)
 * 3. Google Cloud SDK (gcloud CLI)
 * 4. Application Default Credentials (ADC)
 */
export class AutomaticCredentialRetriever {
  /**
   * Retrieve API key from environment variable
   */
  async getFromEnvironment(): Promise<CredentialSource | null> {
    const geminiApiKey = process.env['GEMINI_API_KEY'];
    if (geminiApiKey) {
      debugLogger.log('Found GEMINI_API_KEY in environment variables');
      return {
        source: 'environment:GEMINI_API_KEY',
        value: geminiApiKey,
        authType: 'gemini-api-key',
      };
    }

    const googleApiKey = process.env['GOOGLE_API_KEY'];
    if (googleApiKey) {
      debugLogger.log('Found GOOGLE_API_KEY in environment variables');
      return {
        source: 'environment:GOOGLE_API_KEY',
        value: googleApiKey,
        authType: 'vertex-ai',
      };
    }

    return null;
  }

  /**
   * Retrieve API key from stored credentials (keychain or file)
   */
  async getFromStoredCredentials(): Promise<CredentialSource | null> {
    try {
      const apiKey = await loadApiKey();
      if (apiKey) {
        debugLogger.log('Found API key in stored credentials');
        return {
          source: 'stored-credentials',
          value: apiKey,
          authType: 'gemini-api-key',
        };
      }
    } catch (error) {
      debugLogger.warn(
        'Failed to load API key from stored credentials:',
        error,
      );
    }
    return null;
  }

  /**
   * Retrieve credentials from Google Cloud SDK (gcloud CLI)
   * This checks if gcloud is configured and has active credentials
   */
  async getFromGcloudCLI(): Promise<CredentialSource | null> {
    try {
      // Check if gcloud is installed
      await execAsync('which gcloud');

      // Get the active account
      const { stdout: account } = await execAsync(
        'gcloud config get-value account 2>/dev/null',
      );

      if (account && account.trim()) {
        debugLogger.log(`Found gcloud active account: ${account.trim()}`);

        // Try to get an access token
        try {
          const { stdout: token } = await execAsync(
            'gcloud auth print-access-token 2>/dev/null',
          );

          if (token && token.trim()) {
            return {
              source: 'gcloud-cli',
              value: token.trim(),
              authType: 'oauth-personal',
            };
          }
        } catch (tokenError) {
          debugLogger.warn(
            'Could not get access token from gcloud:',
            tokenError,
          );
        }
      }
    } catch (_error) {
      // gcloud not available or not configured
      debugLogger.log('gcloud CLI not available or not configured');
    }
    return null;
  }

  /**
   * Retrieve credentials from Application Default Credentials (ADC)
   * Checks the well-known ADC file location
   */
  async getFromADC(): Promise<CredentialSource | null> {
    try {
      const adcPath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];

      if (adcPath && existsSync(adcPath)) {
        debugLogger.log(`Found ADC credentials at: ${adcPath}`);
        return {
          source: 'application-default-credentials',
          value: adcPath,
          authType: 'vertex-ai',
        };
      }

      // Check default ADC location
      const defaultAdcPath = join(
        homedir(),
        '.config',
        'gcloud',
        'application_default_credentials.json',
      );

      if (existsSync(defaultAdcPath)) {
        try {
          const content = await readFile(defaultAdcPath, 'utf-8');
          const creds = JSON.parse(content);

          if (creds.type === 'authorized_user' || creds.client_id) {
            debugLogger.log('Found ADC user credentials');
            return {
              source: 'application-default-credentials:user',
              value: defaultAdcPath,
              authType: 'oauth-personal',
            };
          }

          if (creds.type === 'service_account') {
            debugLogger.log('Found ADC service account credentials');
            return {
              source: 'application-default-credentials:service-account',
              value: defaultAdcPath,
              authType: 'vertex-ai',
            };
          }
        } catch (parseError) {
          debugLogger.warn('Failed to parse ADC credentials:', parseError);
        }
      }
    } catch (error) {
      debugLogger.warn('Failed to check ADC credentials:', error);
    }
    return null;
  }

  /**
   * Automatically detect and retrieve credentials from all available sources
   * Returns the first available credential found in priority order
   */
  async retrieveCredentials(): Promise<CredentialSource | null> {
    debugLogger.log('Starting automatic credential retrieval...');

    // Priority 1: Environment variables
    const envCred = await this.getFromEnvironment();
    if (envCred) {
      return envCred;
    }

    // Priority 2: Stored credentials
    const storedCred = await this.getFromStoredCredentials();
    if (storedCred) {
      return storedCred;
    }

    // Priority 3: Google Cloud SDK (gcloud)
    const gcloudCred = await this.getFromGcloudCLI();
    if (gcloudCred) {
      return gcloudCred;
    }

    // Priority 4: Application Default Credentials (ADC)
    const adcCred = await this.getFromADC();
    if (adcCred) {
      return adcCred;
    }

    debugLogger.log('No credentials found from any source');
    return null;
  }

  /**
   * Get all available credential sources (for debugging/display purposes)
   */
  async getAllAvailableCredentials(): Promise<CredentialSource[]> {
    const credentials: CredentialSource[] = [];

    const envCred = await this.getFromEnvironment();
    if (envCred) credentials.push(envCred);

    const storedCred = await this.getFromStoredCredentials();
    if (storedCred) credentials.push(storedCred);

    const gcloudCred = await this.getFromGcloudCLI();
    if (gcloudCred) credentials.push(gcloudCred);

    const adcCred = await this.getFromADC();
    if (adcCred) credentials.push(adcCred);

    return credentials;
  }
}

/**
 * Singleton instance for automatic credential retrieval
 */
export const credentialRetriever = new AutomaticCredentialRetriever();
