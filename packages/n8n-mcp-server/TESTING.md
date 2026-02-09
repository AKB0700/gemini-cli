# n8n MCP Server Testing Guide

This document provides instructions for testing and validating the n8n MCP
server integration with Gemini CLI.

## Prerequisites

Before testing, ensure you have:

1. A running n8n instance (local or cloud)
2. An n8n API key
3. At least one workflow created in n8n
4. Gemini CLI installed and configured

## Quick Syntax Validation

To verify the n8n MCP server code is syntactically correct:

```bash
cd packages/n8n-mcp-server
node --check index.js
```

Expected output: No errors (silent success)

## Manual Testing Without Gemini CLI

You can test the n8n MCP server independently to verify it can connect to your
n8n instance:

### 1. Test Basic Connectivity

```bash
# Set environment variables
export N8N_API_URL="http://localhost:5678"
export N8N_API_KEY="your-api-key"

# Test n8n API directly
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "${N8N_API_URL}/api/v1/workflows"
```

Expected: JSON response with your workflows

### 2. Test MCP Server Communication

The MCP server uses stdio transport, which means it communicates via
stdin/stdout. Testing this manually is complex, but you can verify it starts
without errors:

```bash
cd packages/n8n-mcp-server
export N8N_API_URL="http://localhost:5678"
export N8N_API_KEY="your-api-key"

# The server will wait for input on stdin
node index.js
# Press Ctrl+C to exit
```

Expected: Server starts without errors and waits for input

## Testing With Gemini CLI

### 1. Configure Gemini CLI

Add to your `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/absolute/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 2. Start Gemini CLI

```bash
gemini
```

### 3. Check MCP Server Status

In the Gemini CLI, run:

```
> /mcp
```

Expected output should include:

```
n8n - Connected
  Tools (5):
    - n8n_list_workflows
    - n8n_get_workflow
    - n8n_execute_workflow
    - n8n_get_executions
    - n8n_activate_workflow
```

### 4. Test Each Tool

#### Test 1: List Workflows

```
> List all my n8n workflows
```

Expected: Gemini should call `n8n_list_workflows` and display your workflows

#### Test 2: Get Workflow Details

```
> Show me details of n8n workflow [ID]
```

(Replace [ID] with an actual workflow ID from the previous test)

Expected: Gemini should call `n8n_get_workflow` and display workflow details

#### Test 3: Get Executions

```
> Show me recent n8n executions
```

Expected: Gemini should call `n8n_get_executions` and display execution history

#### Test 4: Execute Workflow (if you have an active workflow)

```
> Execute n8n workflow [ID]
```

Expected: Gemini should ask for confirmation, then execute the workflow

#### Test 5: Activate/Deactivate Workflow

```
> Deactivate n8n workflow [ID]
```

Expected: Gemini should ask for confirmation, then deactivate the workflow

## Troubleshooting Test Failures

### Server Not Listed in /mcp

**Possible causes:**

1. Path to index.js is incorrect in settings.json
2. Environment variables not set properly
3. n8n instance not accessible

**Solutions:**

- Verify the absolute path to index.js
- Check environment variables are correct
- Test n8n API directly with curl

### Tools Execute But Return Errors

**Possible causes:**

1. n8n API key invalid
2. n8n API not enabled
3. Network connectivity issues
4. Workflow doesn't exist

**Solutions:**

- Regenerate n8n API key
- Verify n8n API is enabled in settings
- Check firewall/network configuration
- Verify workflow IDs are correct

### Connection Timeout

**Possible causes:**

1. n8n instance not running
2. Wrong URL in N8N_API_URL
3. Firewall blocking connection

**Solutions:**

- Ensure n8n is running: `curl http://localhost:5678/healthz`
- Verify URL is correct
- Check firewall rules

## Test Results Documentation

When testing, document your results:

### Environment

- n8n version: \_\_\_
- n8n type: (self-hosted/cloud)
- Gemini CLI version: \_\_\_
- Node.js version: \_\_\_

### Test Results

| Test                   | Status | Notes |
| ---------------------- | ------ | ----- |
| Syntax validation      | ✓/✗    |       |
| MCP server starts      | ✓/✗    |       |
| Server appears in /mcp | ✓/✗    |       |
| n8n_list_workflows     | ✓/✗    |       |
| n8n_get_workflow       | ✓/✗    |       |
| n8n_get_executions     | ✓/✗    |       |
| n8n_execute_workflow   | ✓/✗    |       |
| n8n_activate_workflow  | ✓/✗    |       |

## Performance Testing

### Response Time Test

Test how long each operation takes:

1. List 10 workflows
2. Get details of 5 workflows
3. Get last 20 executions

Document response times to identify any performance issues.

### Concurrent Operations

Test multiple operations in sequence:

```
> List all workflows, then get details for the first three
```

Expected: Operations execute sequentially without errors

## Security Testing

### API Key Protection

Verify API keys are not exposed:

1. Check that API keys are not logged in Gemini CLI output
2. Verify API keys are not sent to the Gemini model
3. Ensure API keys are stored securely in environment variables

### Confirmation Prompts

Verify that destructive operations require confirmation:

1. Executing workflows should prompt for confirmation
2. Activating/deactivating workflows should prompt for confirmation
3. Read-only operations (list, get) should not require confirmation

## Integration Testing

Test realistic workflows:

### Scenario 1: Workflow Management

```
1. List all workflows
2. Find an inactive workflow
3. Activate it
4. Execute it
5. Check execution status
6. Deactivate it
```

### Scenario 2: Monitoring

```
1. Get recent executions
2. Check for any failures
3. Get details of failed workflow
4. Review workflow configuration
```

### Scenario 3: Automation

```
1. Execute data collection workflow
2. Wait for completion
3. Execute analysis workflow
4. Check results
```

## Reporting Issues

When reporting issues, include:

1. Full error message
2. n8n version and configuration
3. Gemini CLI version
4. Steps to reproduce
5. Expected vs actual behavior
6. Test results table (above)

Submit issues to: https://github.com/google-gemini/gemini-cli/issues

## Success Criteria

The integration is working correctly when:

✓ All 5 tools are discoverable via `/mcp` ✓ List workflows returns your n8n
workflows ✓ Get workflow returns correct details ✓ Execute workflow triggers
workflow execution ✓ Get executions shows execution history ✓
Activate/deactivate changes workflow status ✓ Error messages are clear and
actionable ✓ Confirmation prompts appear for write operations ✓ API keys remain
secure throughout
