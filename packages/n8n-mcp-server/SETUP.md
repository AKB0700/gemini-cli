# Example: n8n MCP Server Configuration

# This file shows example configurations for using the n8n MCP server

# with Gemini CLI. Copy the relevant section to your settings.json file.

## Basic Configuration (Self-hosted n8n)

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "n8n-api-key-here"
      }
    }
  }
}
```

## Cloud n8n Configuration

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

## Configuration with Trust Settings

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "n8n-api-key-here"
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

## Using Environment Variables

Best practice: Store sensitive data in environment variables

### Set environment variables:

```bash
export N8N_API_URL="http://localhost:5678"
export N8N_API_KEY="your-secret-api-key"
```

### Reference them in settings.json:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "${env:N8N_API_URL}",
        "N8N_API_KEY": "${env:N8N_API_KEY}"
      }
    }
  }
}
```

## Multiple n8n Instances (Dev + Prod)

```json
{
  "mcpServers": {
    "n8n-prod": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "https://n8n-prod.company.com",
        "N8N_API_KEY": "${env:N8N_PROD_KEY}"
      },
      "alwaysConfirm": ["n8n_execute_workflow", "n8n_activate_workflow"]
    },
    "n8n-dev": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "${env:N8N_DEV_KEY}"
      },
      "alwaysAllow": ["n8n_execute_workflow", "n8n_activate_workflow"]
    }
  }
}
```

## Configuration with Tool Filtering

Only enable specific tools:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "n8n-api-key-here"
      },
      "includeTools": ["n8n_list_workflows", "n8n_get_executions"]
    }
  }
}
```

Or exclude specific tools:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/gemini-cli/packages/n8n-mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "n8n-api-key-here"
      },
      "excludeTools": ["n8n_activate_workflow"]
    }
  }
}
```

## Finding Your Configuration File

The settings.json file location depends on your OS:

- **Linux/macOS**: `~/.gemini/settings.json`
- **Windows**: `%USERPROFILE%\.gemini\settings.json`

You can also use project-specific settings:

- **Project**: `.gemini/settings.json` (in your project root)

## Getting Your n8n API Key

1. Open your n8n instance
2. Navigate to **Settings** → **API**
3. Click **Create API Key**
4. Copy the generated key
5. Store it securely (never commit to git)

For cloud n8n, the API feature may require a paid plan.

## Verifying Configuration

After adding configuration, start Gemini CLI and run:

```
> /mcp
```

You should see `n8n - Connected` with 5 tools listed.

## Troubleshooting

### Server not connecting

- Verify n8n is running
- Check API key is correct
- Ensure path to index.js is absolute

### Permission denied

- Make sure index.js is readable
- Check node is in your PATH

### API errors

- Regenerate API key in n8n
- Verify API is enabled in n8n settings
- Check network connectivity

For more help, see:

- [Full documentation](./README.md)
- [Testing guide](./TESTING.md)
- [GitHub issues](https://github.com/google-gemini/gemini-cli/issues)
