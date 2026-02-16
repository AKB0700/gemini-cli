#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { execSync } from 'node:child_process';

/**
 * Script to check for and optionally fix npm security vulnerabilities
 * Usage:
 *   node scripts/check-and-fix-vulnerabilities.js [--fix] [--force]
 *
 * Options:
 *   --fix    Automatically fix vulnerabilities using npm audit fix
 *   --force  Use npm audit fix --force for breaking changes (use with caution)
 */

const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const useForce = args.includes('--force');

console.log('🔍 Checking for security vulnerabilities...\n');

try {
  // Run npm audit and capture output
  const auditResult = execSync('npm audit --json', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const audit = JSON.parse(auditResult);
  const vulnerabilities = audit.metadata?.vulnerabilities || {};
  const total =
    (vulnerabilities.low || 0) +
    (vulnerabilities.moderate || 0) +
    (vulnerabilities.high || 0) +
    (vulnerabilities.critical || 0);

  if (total === 0) {
    console.log('✅ No vulnerabilities found!');
    process.exit(0);
  }

  console.log(`⚠️  Found ${total} vulnerabilities:`);
  console.log(`   - Critical: ${vulnerabilities.critical || 0}`);
  console.log(`   - High: ${vulnerabilities.high || 0}`);
  console.log(`   - Moderate: ${vulnerabilities.moderate || 0}`);
  console.log(`   - Low: ${vulnerabilities.low || 0}`);
  console.log();

  if (shouldFix) {
    console.log('🔧 Attempting to fix vulnerabilities...\n');

    const fixCommand = useForce ? 'npm audit fix --force' : 'npm audit fix';

    try {
      execSync(fixCommand, { stdio: 'inherit' });
      console.log('\n✅ Vulnerabilities fixed successfully!');
      console.log('   Please run tests to ensure nothing broke.');

      // Check if vulnerabilities remain
      const reauditResult = execSync('npm audit --json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      const reaudit = JSON.parse(reauditResult);
      const remainingVulns = reaudit.metadata?.vulnerabilities || {};
      const remainingTotal =
        (remainingVulns.low || 0) +
        (remainingVulns.moderate || 0) +
        (remainingVulns.high || 0) +
        (remainingVulns.critical || 0);

      if (remainingTotal > 0) {
        console.log(`\n⚠️  ${remainingTotal} vulnerabilities still remain.`);
        console.log(
          '   These may require manual intervention or breaking changes.',
        );
        console.log(
          '   Run with --force to attempt fixing with breaking changes (use with caution).',
        );
        process.exit(1);
      }
    } catch (error) {
      console.error('\n❌ Failed to fix vulnerabilities:', error.message);
      process.exit(1);
    }
  } else {
    console.log(
      '💡 Run with --fix to automatically fix these vulnerabilities.',
    );
    console.log('   Example: npm run check-vulnerabilities -- --fix');
    process.exit(1);
  }
} catch (error) {
  // npm audit returns non-zero exit code when vulnerabilities exist
  // Try to parse the error output as JSON
  if (error.stdout) {
    try {
      const audit = JSON.parse(error.stdout);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};
      const total =
        (vulnerabilities.low || 0) +
        (vulnerabilities.moderate || 0) +
        (vulnerabilities.high || 0) +
        (vulnerabilities.critical || 0);

      if (total === 0) {
        console.log('✅ No vulnerabilities found!');
        process.exit(0);
      }

      console.log(`⚠️  Found ${total} vulnerabilities:`);
      console.log(`   - Critical: ${vulnerabilities.critical || 0}`);
      console.log(`   - High: ${vulnerabilities.high || 0}`);
      console.log(`   - Moderate: ${vulnerabilities.moderate || 0}`);
      console.log(`   - Low: ${vulnerabilities.low || 0}`);
      console.log();

      if (shouldFix) {
        console.log('🔧 Attempting to fix vulnerabilities...\n');

        const fixCommand = useForce ? 'npm audit fix --force' : 'npm audit fix';

        try {
          execSync(fixCommand, { stdio: 'inherit' });
          console.log('\n✅ Vulnerabilities fixed successfully!');
          console.log('   Please run tests to ensure nothing broke.');
          process.exit(0);
        } catch (fixError) {
          console.error(
            '\n❌ Failed to fix vulnerabilities:',
            fixError.message,
          );
          process.exit(1);
        }
      } else {
        console.log(
          '💡 Run with --fix to automatically fix these vulnerabilities.',
        );
        console.log('   Example: npm run check-vulnerabilities -- --fix');
        process.exit(1);
      }
    } catch {
      console.error('❌ Error parsing audit results:', error);
      process.exit(1);
    }
  } else {
    console.error('❌ Error running npm audit:', error.message);
    process.exit(1);
  }
}
