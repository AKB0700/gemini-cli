# n8n Integration with Gemini CLI

This guide explains how to integrate [n8n](https://n8n.io/), a powerful workflow
automation platform, with Gemini CLI through the included n8n MCP (Model Context
Protocol) server.

## Overview

The n8n MCP server enables Gemini CLI to:

- List and inspect your n8n workflows
- Execute workflows with custom input data
- Monitor workflow execution history
- Activate and deactivate workflows
- Automate complex tasks through AI-driven workflow orchestration

## What is n8n?

n8n is an open-source workflow automation tool that allows you to connect
different services and automate tasks without writing code. It provides:

- **400+ integrations** with popular services (Slack, Gmail, GitHub, databases,
  etc.)
- **Visual workflow builder** with drag-and-drop interface
- **Self-hosted or cloud** deployment options
- **REST API** for programmatic access
- **Webhook triggers** for real-time automation

## Prerequisites

Before setting up the n8n MCP server, ensure you have:

1. **n8n instance**: Either self-hosted or cloud-based
   - Self-hosted: [Installation guide](https://docs.n8n.io/hosting/)
   - Cloud: [Sign up for n8n.cloud](https://n8n.io/cloud/)

2. **n8n API access**: API must be enabled
   - Self-hosted: Enabled by default
   - Cloud: Available on paid plans

3. **API key**: Generated from n8n settings
   - Navigate to Settings → API
   - Generate a new API key
   - Save it securely

4. **Node.js 20+**: Required for the MCP server

## Installation

### Step 1: Install Dependencies

The n8n MCP server is included in the Gemini CLI repository. If you're using a
packaged version of Gemini CLI, dependencies should already be installed. For
development:

```bash
cd packages/n8n-mcp-server
npm install
```

### Step 2: Configure Environment Variables

Set your n8n connection details as environment variables:

```bash
# For self-hosted n8n (default port 5678)
export N8N_API_URL="http://localhost:5678"
export N8N_API_KEY="your-api-key-here"

# For n8n cloud
export N8N_API_URL="https://your-instance.n8n.cloud"
export N8N_API_KEY="your-cloud-api-key"
```

**Important**: Never commit API keys to version control. Use environment
variables or a secure secrets manager.

### Step 3: Configure Gemini CLI

Add the n8n MCP server to your Gemini CLI settings file.

**User-level configuration** (`~/.gemini/settings.json`):

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-api-key-here"
      },
      "alwaysAllow": [
        "n8n_list_workflows",
        "n8n_get_workflow",
        "n8n_get_executions"
      ],
      "alwaysConfirm": ["n8n_execute_workflow", "n8n_activate_workflow"]
    }
  }
}
```

**Project-level configuration** (`.gemini/settings.json` in your project):

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["${workspaceFolder}/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "${env:N8N_API_URL}",
        "N8N_API_KEY": "${env:N8N_API_KEY}"
      }
    }
  }
}
```

### Step 4: Verify Installation

Start Gemini CLI and check if n8n tools are available:

```bash
gemini
```

In the CLI, run:

```
> /mcp
```

You should see the n8n server listed with its five available tools.

## Available Tools

### 1. n8n_list_workflows

Lists all workflows in your n8n instance.

**Parameters:**

- `active` (optional boolean): Filter by active status

**Example prompts:**

```
> List all my n8n workflows
> Show me only active n8n workflows
> What automations do I have in n8n?
```

### 2. n8n_get_workflow

Retrieves detailed information about a specific workflow.

**Parameters:**

- `workflow_id` (required string): The workflow ID

**Example prompts:**

```
> Show me details of n8n workflow 123
> What does my customer onboarding workflow do?
> Get information about workflow ID 456
```

### 3. n8n_execute_workflow

Executes a workflow with optional input data.

**Parameters:**

- `workflow_id` (required string): The workflow ID
- `input_data` (optional object): JSON data to pass to the workflow

**Example prompts:**

```
> Execute n8n workflow 789
> Run my data processing workflow with input: {"file": "data.csv"}
> Trigger the customer onboarding workflow for user "john@example.com"
```

### 4. n8n_get_executions

Retrieves recent workflow execution history.

**Parameters:**

- `workflow_id` (optional string): Filter by workflow
- `limit` (optional number): Max results (1-100, default 10)

**Example prompts:**

```
> Show me recent n8n executions
> Get the last 20 runs of workflow 123
> What's the execution history for my email workflow?
```

### 5. n8n_activate_workflow

Activates or deactivates a workflow.

**Parameters:**

- `workflow_id` (required string): The workflow ID
- `active` (required boolean): true to activate, false to deactivate

**Example prompts:**

```
> Activate n8n workflow 123
> Turn off my weekend notification workflow
> Deactivate workflow ID 456
```

## Usage Examples

### Example 1: Automated Data Processing

**Scenario**: You have a data processing workflow in n8n that transforms CSV
files.

```
User: I need to process the customer data from the latest export. Can you run my n8n data transformation workflow?

Gemini: I'll list your workflows to find the data transformation one.
[Executes n8n_list_workflows]

I found "Customer Data Transformer" (ID: 123). I'll execute it now.
[Executes n8n_execute_workflow with workflow_id=123]

✓ Workflow execution started successfully!
Execution ID: exec-abc123
Status: Finished
The data has been processed and is ready in your output folder.
```

### Example 2: Monitoring Workflow Status

**Scenario**: Check if your automated workflows are running correctly.

```
User: Have my n8n automations been running successfully today?

Gemini: Let me check your recent n8n executions.
[Executes n8n_get_executions with limit=20]

Here's the status of your workflows today:
✓ Customer Onboarding - 5 successful runs
✓ Daily Data Sync - 3 successful runs
✗ Email Notifications - 1 failed run (2 hours ago)

The email notification workflow failed. Would you like me to investigate the error?
```

### Example 3: Workflow Management

**Scenario**: Temporarily disable notifications during maintenance.

```
User: We're doing system maintenance. Please disable all notification workflows in n8n.

Gemini: I'll list your workflows to find notification-related ones.
[Executes n8n_list_workflows]

Found these notification workflows:
- Email Notifications (ID: 456)
- Slack Alerts (ID: 789)

I'll deactivate them now.
[Executes n8n_activate_workflow for each with active=false]

✓ Email Notifications deactivated
✓ Slack Alerts deactivated

Your notification workflows are now disabled. Remember to re-activate them after maintenance!
```

### Example 4: Workflow Orchestration

**Scenario**: Run multiple dependent workflows in sequence.

```
User: Execute my data collection workflow, wait for it to complete, then run the analysis workflow.

Gemini: I'll start the data collection workflow first.
[Executes n8n_execute_workflow with workflow_id for data collection]

Data collection completed successfully (Execution ID: exec-123).

Now running the analysis workflow...
[Executes n8n_execute_workflow with workflow_id for analysis]

Analysis completed! The results are available in your dashboard.
```

## Advanced Configuration

### Trust Levels

Configure different trust levels for read vs. write operations:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "$N8N_API_KEY"
      },
      "alwaysAllow": [
        "n8n_list_workflows",
        "n8n_get_workflow",
        "n8n_get_executions"
      ],
      "alwaysConfirm": ["n8n_execute_workflow", "n8n_activate_workflow"]
    }
  }
}
```

This configuration:

- **Auto-allows** read operations (listing, viewing)
- **Requires confirmation** for write operations (executing, activating)

### Custom n8n Installation

For n8n running on a custom domain or port:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "https://automation.mycompany.com",
        "N8N_API_KEY": "$N8N_API_KEY"
      }
    }
  }
}
```

### Multiple n8n Instances

Connect to multiple n8n instances (e.g., dev and prod):

```json
{
  "mcpServers": {
    "n8n-prod": {
      "command": "node",
      "args": ["packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "https://n8n-prod.company.com",
        "N8N_API_KEY": "$N8N_PROD_API_KEY"
      }
    },
    "n8n-dev": {
      "command": "node",
      "args": ["packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "$N8N_DEV_API_KEY"
      }
    }
  }
}
```

## Troubleshooting

### Connection Failed

**Problem**: "Failed to connect to n8n"

**Solutions**:

1. Verify n8n is running:
   ```bash
   curl http://localhost:5678/healthz
   ```
2. Check `N8N_API_URL` is correct
3. Verify firewall/network settings
4. Ensure n8n API is enabled

### Authentication Error

**Problem**: "n8n API error (401): Unauthorized"

**Solutions**:

1. Verify API key is correct
2. Regenerate API key in n8n settings (Settings → API)
3. Check API key hasn't expired
4. Ensure API key has necessary permissions

### Workflow Execution Failed

**Problem**: Workflow execution returns an error

**Solutions**:

1. Verify workflow is active in n8n
2. Check workflow has proper trigger configuration
3. Validate input data format
4. Review workflow logs in n8n UI
5. Test workflow manually in n8n first

### Tools Not Appearing

**Problem**: n8n tools don't show up in `/mcp`

**Solutions**:

1. Restart Gemini CLI
2. Check MCP server logs for errors
3. Verify n8n MCP server path in settings.json
4. Run: `node packages/n8n-mcp-server/index.js` manually to test

## Use Cases

### 1. Customer Onboarding Automation

```
> When a new customer signs up, execute my n8n onboarding workflow with their email and company details
```

### 2. Data Pipeline Management

```
> Run my daily ETL workflow and send me a summary of the results
```

### 3. Notification Control

```
> Disable weekend notifications and re-enable them on Monday morning
```

### 4. Monitoring and Alerts

```
> Check if any of my critical n8n workflows failed in the last 24 hours
```

### 5. Workflow Debugging

```
> Show me the execution details of workflow 123 to understand why it failed
```

### 6. Multi-Step Automation

```
> Execute data collection, wait for completion, run transformation, then send results via email workflow
```

## Security Best Practices

1. **API Key Management**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly
   - Use separate keys for dev/prod

2. **Trust Configuration**
   - Use `alwaysAllow` only for read operations
   - Require confirmation for write operations
   - Review tool permissions regularly

3. **Network Security**
   - Use HTTPS for cloud n8n instances
   - Implement firewall rules for self-hosted
   - Use VPN for remote access

4. **Access Control**
   - Use API keys with minimal permissions
   - Create dedicated API keys for Gemini CLI
   - Monitor API usage in n8n

## Performance Tips

1. **Workflow Optimization**
   - Design workflows to be idempotent
   - Use appropriate error handling
   - Implement timeouts

2. **MCP Server**
   - Configure reasonable timeout values
   - Monitor system resources
   - Use connection pooling if needed

3. **API Usage**
   - Respect n8n API rate limits
   - Cache workflow lists when possible
   - Batch operations when appropriate

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [n8n Community Forum](https://community.n8n.io/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Gemini CLI MCP Server Guide](./mcp-server.md)

## Getting Help

- **n8n MCP Server Issues**:
  [GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)
- **n8n Support**: [n8n Community](https://community.n8n.io/)
- **Gemini CLI Discussions**:
  [GitHub Discussions](https://github.com/google-gemini/gemini-cli/discussions)

## Contributing

Contributions to the n8n MCP server are welcome! Please see:

- [Contributing Guide](../../CONTRIBUTING.md)
- [n8n MCP Server README](../../packages/n8n-mcp-server/README.md)

## License

The n8n MCP server is part of Gemini CLI and is licensed under
[Apache License 2.0](../../LICENSE).
