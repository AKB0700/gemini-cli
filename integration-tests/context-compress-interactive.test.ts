/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { TestRig } from './test-helper.js';

describe.skip('Interactive Mode', () => {
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
    // We ask for a specific end marker to reliably detect when generation is done.
    const longPrompt =
      'Write a repetitive list of 500 items. Do not use markdown. At the very end of your response, write exactly: END_OF_LONG_RESPONSE';

    await run.type(longPrompt);
    await run.type('\r');

    // Wait for the specific end marker.
    await run.expectText('END_OF_LONG_RESPONSE', 30000);

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
    // A 3s delay has been added to account for windows slash command loading
    // being slightly slower.
    await new Promise((resolve) => setTimeout(resolve, 3000));
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
