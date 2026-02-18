# GitHub Actions Setup Guide

This guide explains how to set up and configure GitHub Actions workflows for the Gemini CLI project.

## Overview

The Gemini CLI project uses GitHub Actions for continuous integration, automated testing, and release management. This document covers:

- Required secrets and variables
- Workflow permissions
- Troubleshooting common issues
- Best practices

## Required Secrets

To use all workflows in this repository, you may need to configure the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### Essential Secrets

#### `GEMINI_API_KEY`

- **Purpose**: Required for running integration tests and evaluations that interact with the Gemini API
- **Required for**: CI tests, E2E tests, evaluations
- **How to get**: Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Note**: Tests that require this will be skipped if not available

#### `GITHUB_TOKEN`

- **Purpose**: Automatically provided by GitHub Actions, used for most GitHub API operations
- **Required for**: All workflows
- **How to get**: Automatically available, no configuration needed
- **Permissions**: Configured per workflow in the `permissions` block

### Optional Secrets

#### `GEMINI_CLI_ROBOT_GITHUB_PAT`

- **Purpose**: Personal Access Token for advanced GitHub operations (cross-repo status updates, etc.)
- **Required for**: Some advanced workflows (merge queue skipper, cross-repo operations)
- **How to get**: Create a Personal Access Token in GitHub Settings → Developer settings → Personal access tokens
- **Permissions needed**: `repo`, `workflow`
- **Note**: Workflows will gracefully degrade if not available

#### `NPM_TOKEN`

- **Purpose**: Required for publishing packages to npm
- **Required for**: Release workflows (when publishing to npm)
- **How to get**: Create a token in npm account settings
- **Note**: Publishing will be skipped if not available

## Workflow Permissions

All workflows use the principle of least privilege. Here's what each workflow requires:

### CI Workflow (`.github/workflows/ci.yml`)

```yaml
permissions:
  checks: 'write' # For publishing test results
  contents: 'read' # For checking out code
  statuses: 'write' # For setting commit statuses
```

### Basic CI Workflow (`.github/workflows/basic-ci.yml`)

```yaml
permissions:
  contents: 'read' # For checking out code
  checks: 'write' # For publishing test results
  pull-requests: 'read' # For reading PR information
```

### Auto Label Workflow (`.github/workflows/auto-label.yml`)

```yaml
permissions:
  contents: 'read' # For checking out code
  issues: 'write' # For labeling issues
  pull-requests: 'write' # For labeling PRs
```

### Auto Assign Workflow (`.github/workflows/auto-assign.yml`)

```yaml
permissions:
  contents: 'read' # For checking out code
  pull-requests: 'write' # For assigning reviewers
```

### Release Workflow (`.github/workflows/release.yml`)

```yaml
permissions:
  contents: 'write' # For creating releases and pushing tags
  pull-requests: 'write' # For creating release PRs
  packages: 'write' # For publishing packages
```

## Runner Configuration

All workflows have been updated to use standard GitHub-hosted runners:

- **Linux jobs**: `ubuntu-latest`
- **macOS jobs**: `macos-latest`
- **Windows jobs**: `windows-latest`

### Previous Custom Runners

If you're migrating from custom runners:

- `gemini-cli-ubuntu-16-core` → `ubuntu-latest`
- `gemini-cli-windows-16-core` → `windows-latest`

The standard runners provide:

- No additional setup required
- Better portability across forks
- Reliable availability
- Sufficient resources for most workflows

### When Standard Runners May Not Be Enough

For very large projects or intensive operations, you may need:

- Larger runners (GitHub Enterprise)
- Self-hosted runners (for specific requirements)
- Build caching optimization
- Matrix strategy for parallelization

## Configuring Secrets

### In Your Repository

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the appropriate name and value

### In Your Fork

If you're working on a fork:

1. You'll need to configure secrets in your fork's settings
2. Some workflows use `pull_request_target` to safely access secrets in fork PRs
3. Be cautious with secrets in fork PRs - they should only run on trusted code

## Troubleshooting

### Common Issues

#### Issue: "Resource not accessible by integration"

**Cause**: Insufficient permissions for the `GITHUB_TOKEN`

**Solution**:

1. Check the workflow's `permissions` block
2. Ensure your repository settings allow the necessary permissions
3. For organization repos, check organization-level restrictions

#### Issue: "Secret not found"

**Cause**: Required secret is not configured

**Solution**:

1. Check if the secret is actually needed for your use case
2. Many workflows gracefully handle missing secrets
3. Add the secret in repository settings if needed

#### Issue: Workflows not triggering

**Cause**: Multiple possible causes

**Solution**:

1. Check the workflow's `on:` triggers
2. Ensure the branch/path filters match
3. Check if workflows are disabled in repository settings
4. Verify the workflow YAML is valid (use `yamllint`)

#### Issue: "Action not allowed"

**Cause**: GitHub Actions restrictions in organization settings

**Solution**:

1. Go to Organization Settings → Actions → General
2. Update "Actions permissions" to allow required actions
3. If using organization-level restrictions, add specific actions to allowlist

### Debugging Workflows

#### Enable Debug Logging

Add these secrets to your repository:

- `ACTIONS_RUNNER_DEBUG`: `true`
- `ACTIONS_STEP_DEBUG`: `true`

This will provide verbose logging in workflow runs.

#### Re-run Workflows

1. Go to the Actions tab
2. Select the failed workflow run
3. Click "Re-run jobs" → "Re-run failed jobs"

#### Local Testing

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run a workflow
act -j job_name
```

## Best Practices

### 1. Pin Action Versions

Always use commit SHA or specific version tags:

```yaml
# Good: Pinned to commit SHA
uses: 'actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8'

# Acceptable: Pinned to version
uses: 'actions/checkout@v5'

# Bad: Using a branch
uses: 'actions/checkout@main'
```

### 2. Minimize Permissions

Only request the permissions you need:

```yaml
permissions:
  contents: 'read' # Only read, not write
  pull-requests: 'write' # Only for PR operations
```

### 3. Use Conditions for Secrets

Always check if a secret exists before using it:

```yaml
- name: 'Use secret'
  if: "${{ secrets.MY_SECRET != '' }}"
  env:
    SECRET: '${{ secrets.MY_SECRET }}'
  run: 'use-the-secret'
```

### 4. Cache Dependencies

Use caching to speed up workflows:

```yaml
- uses: 'actions/setup-node@v4'
  with:
    node-version-file: '.nvmrc'
    cache: 'npm' # Cache npm dependencies
```

### 5. Use Concurrency Control

Prevent wasted resources from duplicate runs:

```yaml
concurrency:
  group: '${{ github.workflow }}-${{ github.head_ref || github.ref }}'
  cancel-in-progress: true
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Using Secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

## Getting Help

If you encounter issues not covered in this guide:

1. Check existing [GitHub Issues](../../issues)
2. Review [GitHub Actions documentation](https://docs.github.com/en/actions)
3. Open a new issue with:
   - Workflow name
   - Error message
   - Steps to reproduce
   - Link to failed workflow run (if public)
