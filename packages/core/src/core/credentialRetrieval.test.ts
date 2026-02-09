/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutomaticCredentialRetriever } from './credentialRetrieval.js';

// Mock the dependencies
vi.mock('./apiKeyCredentialStorage.js', () => ({
  loadApiKey: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

import { loadApiKey } from './apiKeyCredentialStorage.js';
import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

describe('AutomaticCredentialRetriever', () => {
  let retriever: AutomaticCredentialRetriever;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    retriever = new AutomaticCredentialRetriever();
    originalEnv = { ...process.env };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getFromEnvironment', () => {
    it('should return GEMINI_API_KEY if present', async () => {
      process.env['GEMINI_API_KEY'] = 'test-gemini-key';

      const result = await retriever.getFromEnvironment();

      expect(result).toEqual({
        source: 'environment:GEMINI_API_KEY',
        value: 'test-gemini-key',
        authType: 'gemini-api-key',
      });
    });

    it('should return GOOGLE_API_KEY if GEMINI_API_KEY is not present', async () => {
      delete process.env['GEMINI_API_KEY'];
      process.env['GOOGLE_API_KEY'] = 'test-google-key';

      const result = await retriever.getFromEnvironment();

      expect(result).toEqual({
        source: 'environment:GOOGLE_API_KEY',
        value: 'test-google-key',
        authType: 'vertex-ai',
      });
    });

    it('should return null if no API keys in environment', async () => {
      delete process.env['GEMINI_API_KEY'];
      delete process.env['GOOGLE_API_KEY'];

      const result = await retriever.getFromEnvironment();

      expect(result).toBeNull();
    });

    it('should prioritize GEMINI_API_KEY over GOOGLE_API_KEY', async () => {
      process.env['GEMINI_API_KEY'] = 'test-gemini-key';
      process.env['GOOGLE_API_KEY'] = 'test-google-key';

      const result = await retriever.getFromEnvironment();

      expect(result?.source).toBe('environment:GEMINI_API_KEY');
      expect(result?.value).toBe('test-gemini-key');
    });
  });

  describe('getFromStoredCredentials', () => {
    it('should return stored API key if available', async () => {
      vi.mocked(loadApiKey).mockResolvedValue('stored-api-key');

      const result = await retriever.getFromStoredCredentials();

      expect(result).toEqual({
        source: 'stored-credentials',
        value: 'stored-api-key',
        authType: 'gemini-api-key',
      });
    });

    it('should return null if no stored API key', async () => {
      vi.mocked(loadApiKey).mockResolvedValue(null);

      const result = await retriever.getFromStoredCredentials();

      expect(result).toBeNull();
    });

    it('should return null and log warning on error', async () => {
      vi.mocked(loadApiKey).mockRejectedValue(new Error('Storage error'));

      const result = await retriever.getFromStoredCredentials();

      expect(result).toBeNull();
    });
  });

  describe('getFromGcloudCLI', () => {
    it('should return gcloud credentials if available', async () => {
      // Mock exec to simulate gcloud being available
      vi.mocked(exec).mockImplementation(
        (
          command: string,
          callback?: (
            error: Error | null,
            result: { stdout: string; stderr: string },
          ) => void,
        ) => {
          if (command === 'which gcloud') {
            callback?.(null, { stdout: '/usr/bin/gcloud', stderr: '' });
          } else if (command.includes('gcloud config get-value account')) {
            callback?.(null, { stdout: 'user@example.com\n', stderr: '' });
          } else if (command.includes('gcloud auth print-access-token')) {
            callback?.(null, { stdout: 'ya29.test-token\n', stderr: '' });
          }
          return {} as ReturnType<typeof exec>;
        },
      );

      const result = await retriever.getFromGcloudCLI();

      expect(result).toEqual({
        source: 'gcloud-cli',
        value: 'ya29.test-token',
        authType: 'oauth-personal',
      });
    });

    it('should return null if gcloud is not installed', async () => {
      vi.mocked(exec).mockImplementation(
        (
          command: string,
          callback?: (
            error: Error | null,
            result: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback?.(new Error('gcloud not found'), { stdout: '', stderr: '' });
          return {} as ReturnType<typeof exec>;
        },
      );

      const result = await retriever.getFromGcloudCLI();

      expect(result).toBeNull();
    });

    it('should return null if gcloud has no active account', async () => {
      vi.mocked(exec).mockImplementation(
        (
          command: string,
          callback?: (
            error: Error | null,
            result: { stdout: string; stderr: string },
          ) => void,
        ) => {
          if (command === 'which gcloud') {
            callback?.(null, { stdout: '/usr/bin/gcloud', stderr: '' });
          } else if (command.includes('gcloud config get-value account')) {
            callback?.(null, { stdout: '', stderr: '' });
          }
          return {} as ReturnType<typeof exec>;
        },
      );

      const result = await retriever.getFromGcloudCLI();

      expect(result).toBeNull();
    });
  });

  describe('getFromADC', () => {
    it('should return ADC path if GOOGLE_APPLICATION_CREDENTIALS is set', async () => {
      process.env['GOOGLE_APPLICATION_CREDENTIALS'] =
        '/path/to/credentials.json';
      vi.mocked(existsSync).mockReturnValue(true);

      const result = await retriever.getFromADC();

      expect(result).toEqual({
        source: 'application-default-credentials',
        value: '/path/to/credentials.json',
        authType: 'vertex-ai',
      });
    });

    it('should detect user credentials from default ADC location', async () => {
      delete process.env['GOOGLE_APPLICATION_CREDENTIALS'];
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify({
          type: 'authorized_user',
          client_id: 'test-client-id',
        }),
      );

      const result = await retriever.getFromADC();

      expect(result?.source).toBe('application-default-credentials:user');
      expect(result?.authType).toBe('oauth-personal');
    });

    it('should detect service account from default ADC location', async () => {
      delete process.env['GOOGLE_APPLICATION_CREDENTIALS'];
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify({
          type: 'service_account',
          project_id: 'test-project',
        }),
      );

      const result = await retriever.getFromADC();

      expect(result?.source).toBe(
        'application-default-credentials:service-account',
      );
      expect(result?.authType).toBe('vertex-ai');
    });

    it('should return null if ADC file does not exist', async () => {
      delete process.env['GOOGLE_APPLICATION_CREDENTIALS'];
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await retriever.getFromADC();

      expect(result).toBeNull();
    });
  });

  describe('retrieveCredentials', () => {
    it('should return environment credentials first', async () => {
      process.env['GEMINI_API_KEY'] = 'env-key';
      vi.mocked(loadApiKey).mockResolvedValue('stored-key');

      const result = await retriever.retrieveCredentials();

      expect(result?.source).toBe('environment:GEMINI_API_KEY');
      expect(result?.value).toBe('env-key');
    });

    it('should fall back to stored credentials if no env vars', async () => {
      delete process.env['GEMINI_API_KEY'];
      delete process.env['GOOGLE_API_KEY'];
      vi.mocked(loadApiKey).mockResolvedValue('stored-key');

      const result = await retriever.retrieveCredentials();

      expect(result?.source).toBe('stored-credentials');
      expect(result?.value).toBe('stored-key');
    });

    it('should return null if no credentials found', async () => {
      delete process.env['GEMINI_API_KEY'];
      delete process.env['GOOGLE_API_KEY'];
      vi.mocked(loadApiKey).mockResolvedValue(null);
      vi.mocked(exec).mockImplementation(
        (
          command: string,
          callback?: (
            error: Error | null,
            result: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback?.(new Error('not found'), { stdout: '', stderr: '' });
          return {} as ReturnType<typeof exec>;
        },
      );
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await retriever.retrieveCredentials();

      expect(result).toBeNull();
    });
  });

  describe('getAllAvailableCredentials', () => {
    it('should return all available credential sources', async () => {
      process.env['GEMINI_API_KEY'] = 'env-key';
      vi.mocked(loadApiKey).mockResolvedValue('stored-key');
      vi.mocked(exec).mockImplementation(
        (
          command: string,
          callback?: (
            error: Error | null,
            result: { stdout: string; stderr: string },
          ) => void,
        ) => {
          if (command === 'which gcloud') {
            callback?.(null, { stdout: '/usr/bin/gcloud', stderr: '' });
          } else if (command.includes('gcloud config get-value account')) {
            callback?.(null, { stdout: 'user@example.com\n', stderr: '' });
          } else if (command.includes('gcloud auth print-access-token')) {
            callback?.(null, { stdout: 'ya29.test-token\n', stderr: '' });
          }
          return {} as ReturnType<typeof exec>;
        },
      );

      const result = await retriever.getAllAvailableCredentials();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].source).toBe('environment:GEMINI_API_KEY');
      expect(result[1].source).toBe('stored-credentials');
    });

    it('should return empty array if no credentials available', async () => {
      delete process.env['GEMINI_API_KEY'];
      delete process.env['GOOGLE_API_KEY'];
      vi.mocked(loadApiKey).mockResolvedValue(null);
      vi.mocked(exec).mockImplementation(
        (
          command: string,
          callback?: (
            error: Error | null,
            result: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback?.(new Error('not found'), { stdout: '', stderr: '' });
          return {} as ReturnType<typeof exec>;
        },
      );
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await retriever.getAllAvailableCredentials();

      expect(result).toEqual([]);
    });
  });
});
