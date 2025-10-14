/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { TestRig } from './test-helper.js';

describe('Interactive Mode', () => {
  let rig: TestRig;

  beforeEach(() => {
    rig = new TestRig();
  });

  afterEach(async () => {
    await rig.cleanup();
  });

  it('should trigger chat compression with /compress command', async () => {
    rig.setup('interactive-compress-success');

    const run = await rig.runInteractive();

    // Generate a long context to make compression viable.
    const longPrompt =
      'Write a 200 word story about a robot. The story MUST end with the following output: THE_END';

    await run.type(longPrompt);
    await run.type('\r');

    // Wait for the specific end marker.
    await run.expectText('THE_END', 30000);

    await run.type('/compress');
    // A small delay to allow React to re-render the command list.
    await new Promise((resolve) => setTimeout(resolve, 100));
    await run.type('\r');

    const foundEvent = await rig.waitForTelemetryEvent(
      'chat_compression',
      90000,
    );
    expect(foundEvent, 'chat_compression telemetry event was not found').toBe(
      true,
    );
  });

  it('should handle /compress command on empty history', async () => {
    rig.setup('interactive-compress-empty');

    const run = await rig.runInteractive();

    await run.type('/compress');
    // This accounts for slower start up times for windows
    const delay = process.platform === 'win32' ? 5000 : 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));
    await run.type('\r');
    await run.expectText('Nothing to compress.', 25000);

    // Verify no telemetry event is logged for NOOP
    const foundEvent = await rig.waitForTelemetryEvent(
      'chat_compression',
      5000, // Short timeout as we expect it not to happen
    );
    expect(
      foundEvent,
      'chat_compression telemetry event should not be found for NOOP',
    ).toBe(false);
  });
});
