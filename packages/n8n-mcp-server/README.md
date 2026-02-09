# n8n MCP Server for Gemini CLI

This MCP (Model Context Protocol) server provides seamless integration between
[Gemini CLI](https://github.com/google-gemini/gemini-cli) and
[n8n](https://n8n.io/) workflow automation platform. It allows Gemini AI to
interact with your n8n workflows, execute automations, and monitor workflow
executions.

## Features

- 🔄 **List Workflows**: View all workflows in your n8n instance
- 📋 **Get Workflow Details**: Retrieve detailed information about specific
  workflows
- ▶️ **Execute Workflows**: Run workflows with custom input data
- 📊 **Monitor Executions**: Track workflow execution history and status
- 🎛️ **Activate/Deactivate**: Control workflow activation status
- 🔐 **Secure Authentication**: API key-based authentication with n8n

## Prerequisites

- Node.js 20 or higher
- A running n8n instance (self-hosted or cloud)
- n8n API key (for authentication)

## Available Tools

### 1. `n8n_list_workflows`

Lists all workflows available in your n8n instance.

**Parameters:**

- `active` (optional): Filter by active status

**Example usage:**

```
> List all my active n8n workflows
> Show me all n8n automations
```

### 2. `n8n_get_workflow`

Gets detailed information about a specific workflow.

**Parameters:**

- `workflow_id` (required): The ID of the workflow

**Example usage:**

```
> Get details for n8n workflow 123
> Show me information about workflow "customer-onboarding"
```

### 3. `n8n_execute_workflow`

Executes a workflow with optional input data.

**Parameters:**

- `workflow_id` (required): The ID of the workflow to execute
- `input_data` (optional): JSON object with input data

**Example usage:**

```
> Execute n8n workflow 456 with data: {"customer": "John Doe", "email": "john@example.com"}
> Run my data processing workflow
```

### 4. `n8n_get_executions`

Gets recent workflow execution history.

**Parameters:**

- `workflow_id` (optional): Filter by specific workflow
- `limit` (optional): Maximum number of results (1-100, default 10)

**Example usage:**

```
> Show me the last 10 n8n executions
> Get execution history for workflow 789
```

### 5. `n8n_activate_workflow`

Activates or deactivates a workflow.

**Parameters:**

- `workflow_id` (required): The ID of the workflow
- `active` (required): true to activate, false to deactivate

**Example usage:**

```
> Activate n8n workflow 123
> Deactivate my email notification workflow
```

## Installation and Setup

### Step 1: Install Dependencies

Navigate to the n8n MCP server directory and install dependencies:

```bash
cd packages/n8n-mcp-server
npm install
```

### Step 2: Configure Environment Variables

Set up your n8n connection details:

```bash
# Required: Your n8n instance URL
export N8N_API_URL="http://localhost:5678"

# Required: Your n8n API key
export N8N_API_KEY="your-api-key-here"
```

**Getting your n8n API Key:**

1. Open your n8n instance
2. Go to Settings > API
3. Generate a new API key
4. Copy and save it securely

### Step 3: Configure Gemini CLI

Add the n8n MCP server to your Gemini CLI settings file
(`~/.gemini/settings.json`):

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

For cloud-hosted n8n, use your cloud URL:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "https://your-instance.n8n.cloud",
        "N8N_API_KEY": "your-cloud-api-key"
      }
    }
  }
}
```

### Step 4: Verify Installation

Start Gemini CLI and verify the n8n tools are available:

```bash
gemini
```

In the Gemini CLI prompt, check for n8n tools:

```
> /mcp
```

You should see the n8n server listed with its available tools.

## Usage Examples

### Example 1: Listing Workflows

```
User: Show me all my active n8n workflows

Gemini: I'll list all active workflows in your n8n instance.
[Executes n8n_list_workflows with active=true]

Results:
- Customer Onboarding (ID: 123, Active: true)
- Daily Data Sync (ID: 456, Active: true)
- Email Notifications (ID: 789, Active: true)
```

### Example 2: Executing a Workflow

```
User: Run my customer onboarding workflow for a new user named Sarah with email sarah@example.com

Gemini: I'll execute the customer onboarding workflow with that data.
[Executes n8n_execute_workflow with workflow_id=123 and input data]

Execution started successfully!
Execution ID: exec-abc123
Status: Finished
```

### Example 3: Monitoring Executions

```
User: Check the status of my recent n8n automations

Gemini: I'll get the recent execution history.
[Executes n8n_get_executions]

Recent Executions:
1. Customer Onboarding - Success (2 minutes ago)
2. Daily Data Sync - Success (1 hour ago)
3. Email Notifications - Success (3 hours ago)
```

### Example 4: Managing Workflow Status

```
User: Deactivate the email notification workflow temporarily

Gemini: I'll deactivate that workflow for you.
[Executes n8n_activate_workflow with active=false]

Workflow "Email Notifications" has been deactivated successfully.
```

## Advanced Configuration

### Trust Settings

For sensitive workflows, configure trust settings in your Gemini CLI settings:

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

This configuration:

- Auto-allows read-only operations (listing, getting details)
- Requires confirmation for write operations (executing, activating)

### Custom n8n Instance

For self-hosted n8n with custom ports or paths:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://internal-server:8080/n8n",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to n8n"

**Solutions**:

1. Verify n8n is running: `curl http://localhost:5678/healthz`
2. Check `N8N_API_URL` environment variable
3. Ensure n8n API is enabled in settings
4. Check firewall/network settings

### Authentication Errors

**Problem**: "n8n API error (401): Unauthorized"

**Solutions**:

1. Verify your API key is correct
2. Regenerate API key in n8n settings
3. Check that API key has necessary permissions
4. Ensure API key isn't expired

### Execution Failures

**Problem**: Workflow execution fails

**Solutions**:

1. Ensure workflow is active
2. Check workflow has proper trigger configuration
3. Verify input data format matches workflow expectations
4. Review workflow execution logs in n8n UI

## Use Cases

### 1. Automated Customer Onboarding

```
> When a new customer signs up, execute my n8n onboarding workflow with their details
```

### 2. Data Processing Pipelines

```
> Run my data transformation workflow on the latest CSV file
```

### 3. Notification Management

```
> Activate the weekend notification workflow and deactivate the weekday one
```

### 4. Monitoring and Reporting

```
> Show me all failed n8n executions from today
```

### 5. Workflow Orchestration

```
> Execute the data collection workflow, wait for it to finish, then run the analysis workflow
```

## Security Best Practices

1. **API Key Security**: Never commit API keys to version control
2. **Environment Variables**: Use environment variables for credentials
3. **Trust Settings**: Configure appropriate trust levels for workflow
   operations
4. **Network Security**: Use HTTPS for cloud-hosted n8n instances
5. **Access Control**: Use API keys with minimal required permissions

## Contributing

This n8n MCP server is part of the Gemini CLI project. For contributions:

1. Follow the [Gemini CLI Contributing Guide](../../CONTRIBUTING.md)
2. Test thoroughly with different n8n setups
3. Add examples for new features
4. Update documentation

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [Gemini CLI Documentation](https://geminicli.com/docs/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## License

Apache License 2.0 - See [LICENSE](../../LICENSE) for details.

## Support

- File issues:
  [GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)
- Discussion:
  [GitHub Discussions](https://github.com/google-gemini/gemini-cli/discussions)
- n8n Community: [n8n Community Forum](https://community.n8n.io/)
