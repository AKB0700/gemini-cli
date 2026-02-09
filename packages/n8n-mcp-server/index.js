/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-env node */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

/**
 * n8n MCP Server for Gemini CLI
 *
 * This MCP server provides integration between Gemini CLI and n8n workflow automation.
 * It exposes n8n workflows as tools that can be executed by the Gemini AI agent.
 *
 * Environment Variables:
 * - N8N_API_URL: Base URL of your n8n instance (e.g., http://localhost:5678)
 * - N8N_API_KEY: API key for authenticating with n8n
 */

const N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

const server = new McpServer({
  name: 'n8n-automation-server',
  version: '0.1.0',
});

/**
 * Helper function to make authenticated requests to n8n API
 */
async function n8nApiRequest(endpoint, options = {}) {
  const url = `${N8N_API_URL}/api/v1${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to connect to n8n: ${error.message}`);
  }
}

/**
 * Tool: list_workflows
 * Lists all workflows available in the n8n instance
 */
server.registerTool(
  'n8n_list_workflows',
  {
    description:
      'Lists all workflows available in your n8n instance. Returns workflow IDs, names, and active status.',
    inputSchema: z.object({
      active: z
        .boolean()
        .optional()
        .describe(
          'Filter by active status. If true, only active workflows are returned.',
        ),
    }).shape,
  },
  async ({ active }) => {
    try {
      let endpoint = '/workflows';
      if (active !== undefined) {
        endpoint += `?active=${active}`;
      }

      const workflows = await n8nApiRequest(endpoint);

      const workflowList = workflows.data || workflows;
      const formattedWorkflows = workflowList.map((wf) => ({
        id: wf.id,
        name: wf.name,
        active: wf.active,
        tags: wf.tags || [],
        createdAt: wf.createdAt,
        updatedAt: wf.updatedAt,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: formattedWorkflows.length,
                workflows: formattedWorkflows,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  },
);

/**
 * Tool: get_workflow
 * Gets details of a specific workflow
 */
server.registerTool(
  'n8n_get_workflow',
  {
    description:
      'Gets detailed information about a specific n8n workflow, including its nodes and connections.',
    inputSchema: z.object({
      workflow_id: z.string().describe('The ID of the workflow to retrieve'),
    }).shape,
  },
  async ({ workflow_id }) => {
    try {
      const workflow = await n8nApiRequest(`/workflows/${workflow_id}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                id: workflow.id,
                name: workflow.name,
                active: workflow.active,
                nodes: workflow.nodes?.length || 0,
                connections: Object.keys(workflow.connections || {}).length,
                tags: workflow.tags || [],
                settings: workflow.settings,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  },
);

/**
 * Tool: execute_workflow
 * Executes a workflow by ID or name
 */
server.registerTool(
  'n8n_execute_workflow',
  {
    description:
      'Executes an n8n workflow with optional input data. The workflow must be active or have a webhook trigger.',
    inputSchema: z.object({
      workflow_id: z.string().describe('The ID of the workflow to execute'),
      input_data: z
        .record(z.any())
        .optional()
        .describe('Optional input data to pass to the workflow'),
    }).shape,
  },
  async ({ workflow_id, input_data = {} }) => {
    try {
      // Execute workflow via webhook or test execution
      const result = await n8nApiRequest(`/workflows/${workflow_id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ data: input_data }),
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                executionId: result.executionId || result.id,
                finished: result.finished,
                data: result.data,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message,
              hint: 'Make sure the workflow is active or has a webhook trigger configured.',
            }),
          },
        ],
        isError: true,
      };
    }
  },
);

/**
 * Tool: get_executions
 * Gets recent workflow executions
 */
server.registerTool(
  'n8n_get_executions',
  {
    description:
      'Gets recent workflow executions with their status and results. Useful for monitoring automation runs.',
    inputSchema: z.object({
      workflow_id: z
        .string()
        .optional()
        .describe('Optional workflow ID to filter executions'),
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(10)
        .describe('Maximum number of executions to return (1-100, default 10)'),
    }).shape,
  },
  async ({ workflow_id, limit = 10 }) => {
    try {
      let endpoint = `/executions?limit=${limit}`;
      if (workflow_id) {
        endpoint += `&workflowId=${workflow_id}`;
      }

      const executions = await n8nApiRequest(endpoint);

      const executionList = executions.data || executions;
      const formattedExecutions = executionList.map((exec) => ({
        id: exec.id,
        workflowId: exec.workflowId,
        workflowName: exec.workflowData?.name,
        finished: exec.finished,
        mode: exec.mode,
        startedAt: exec.startedAt,
        stoppedAt: exec.stoppedAt,
        status: exec.finished
          ? 'success'
          : exec.stoppedAt
            ? 'error'
            : 'running',
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: formattedExecutions.length,
                executions: formattedExecutions,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  },
);

/**
 * Tool: activate_workflow
 * Activates or deactivates a workflow
 */
server.registerTool(
  'n8n_activate_workflow',
  {
    description:
      'Activates or deactivates an n8n workflow. Active workflows can be triggered automatically.',
    inputSchema: z.object({
      workflow_id: z
        .string()
        .describe('The ID of the workflow to activate/deactivate'),
      active: z
        .boolean()
        .describe('Set to true to activate, false to deactivate'),
    }).shape,
  },
  async ({ workflow_id, active }) => {
    try {
      const result = await n8nApiRequest(`/workflows/${workflow_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                workflowId: result.id,
                name: result.name,
                active: result.active,
                message: `Workflow "${result.name}" ${active ? 'activated' : 'deactivated'} successfully`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message,
            }),
          },
        ],
        isError: true,
      };
    }
  },
);

// Connect the server using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
