# CI/CD Guide

This guide explains the Continuous Integration and Continuous Deployment (CI/CD) workflows used in the Gemini CLI project.

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Triggering Workflows](#triggering-workflows)
- [Understanding Workflow Results](#understanding-workflow-results)
- [Common Scenarios](#common-scenarios)

## Overview

The Gemini CLI project uses multiple GitHub Actions workflows to ensure code quality, run tests, and automate releases. These workflows run automatically on certain events (like push or pull request) or can be triggered manually.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Purpose**: Comprehensive continuous integration testing

**Triggers**:

- Push to `main` or `release/**` branches
- Pull requests to `main` or `release/**` branches
- Merge queue events
- Manual dispatch

**What it does**:

- Runs linting (ESLint, Prettier, actionlint, shellcheck, yamllint)
- Runs link checker to verify documentation links
- Runs tests on Linux (multiple Node versions)
- Runs tests on macOS (multiple Node versions)
- Runs tests on Windows
- Runs CodeQL security analysis
- Checks bundle size changes

**Typical duration**: 15-30 minutes

**Required for**: All PRs must pass this workflow before merging

### 2. Basic CI Workflow (`basic-ci.yml`)

**Purpose**: Quick basic checks for early feedback

**Triggers**:

- Push to `main` or `release/**` branches
- Pull requests to `main` or `release/**` branches
- Manual dispatch

**What it does**:

- Basic checks (lockfile, type checking, linting, formatting)
- Build verification
- Unit tests

**Typical duration**: 5-10 minutes

**Use case**: Fast feedback loop for basic issues

### 3. E2E Workflow (`chained_e2e.yml`)

**Purpose**: End-to-end integration testing

**Triggers**:

- Push to `main`
- Merge queue events
- After "Trigger E2E" workflow completes
- Manual dispatch

**What it does**:

- Runs E2E tests on Linux (with and without Docker sandbox)
- Runs E2E tests on macOS
- Runs E2E tests on Windows
- Runs evaluation tests

**Typical duration**: 30-60 minutes

**Note**: More resource-intensive than regular CI

### 4. Auto Label Workflow (`auto-label.yml`)

**Purpose**: Automatically label PRs and issues

**Triggers**:

- New pull request
- Pull request synchronization
- New issue

**What it does**:

- Labels PRs based on changed files (e.g., `pkg: cli`, `area: tests`)
- Labels PRs by size (e.g., `size/s`, `size/m`, `size/l`)
- Auto-detects issue type from title/body

**Typical duration**: < 1 minute

### 5. Auto Assign Workflow (`auto-assign.yml`)

**Purpose**: Automatically assign reviewers to PRs

**Triggers**:

- New pull request
- Pull request ready for review

**What it does**:

- Assigns reviewers based on file paths changed
- Assigns PR author to their own PR

**Typical duration**: < 1 minute

### 6. Release Workflow (`release.yml`)

**Purpose**: Automated release creation

**Triggers**:

- Manual dispatch only

**What it does**:

- Validates all tests pass
- Bumps version (patch/minor/major)
- Generates changelog
- Creates GitHub release
- Publishes to npm (if configured)

**Typical duration**: 10-20 minutes

**Required permissions**: Write access to repository

### 7. Nightly Evals (`evals-nightly.yml`)

**Purpose**: Run evaluations on a schedule

**Triggers**:

- Scheduled (daily at 1 AM UTC)
- Manual dispatch

**What it does**:

- Runs evaluation tests with multiple Gemini models
- Generates summary reports
- Uploads logs

**Typical duration**: 1-2 hours

## Triggering Workflows

### Automatic Triggers

Most workflows trigger automatically:

```bash
# Push to main - triggers CI, Basic CI
git push origin main

# Create PR - triggers CI, Basic CI, Auto Label, Auto Assign
gh pr create --base main --head feature-branch

# Merge PR - triggers CI, E2E (via merge queue)
gh pr merge --merge
```

### Manual Triggers

Some workflows can be triggered manually:

#### Via GitHub UI

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. Click **Run workflow** button
4. Fill in any required inputs
5. Click **Run workflow**

#### Via GitHub CLI

```bash
# Trigger CI workflow on a specific branch
gh workflow run ci.yml --ref feature-branch

# Trigger release workflow
gh workflow run release.yml \
  -f release_type=patch \
  -f dry_run=false

# Trigger E2E tests
gh workflow run chained_e2e.yml

# Trigger evals with specific test
gh workflow run evals-nightly.yml \
  -f test_name_pattern="test_name"
```

## Understanding Workflow Results

### Viewing Results

1. Go to the **Actions** tab in GitHub
2. Click on a workflow run to see details
3. Expand job sections to see individual steps
4. Click on a step to see detailed logs

### Status Indicators

- ✅ **Success**: All jobs completed successfully
- ❌ **Failure**: One or more jobs failed
- 🟡 **In Progress**: Workflow is currently running
- ⏸️ **Queued**: Waiting for a runner
- ⚫ **Cancelled**: Manually cancelled or cancelled by concurrency rules
- ⏭️ **Skipped**: Job was skipped due to conditions

### Reading Logs

Logs are organized hierarchically:

```
Workflow Run
├── Job 1
│   ├── Step 1
│   ├── Step 2
│   └── Step 3
└── Job 2
    ├── Step 1
    └── Step 2
```

Tips for reading logs:

- Expand failed steps first
- Look for error messages (usually in red)
- Check the summary at the top of each job
- Use browser search (Ctrl+F) to find specific errors

### Common Failure Patterns

#### Lint Failures

```
Error: ESLint found issues
```

**Solution**: Run `npm run lint:fix` locally

#### Test Failures

```
Error: 1 test failed
```

**Solution**: Run tests locally to reproduce and fix

#### Build Failures

```
Error: TypeScript compilation failed
```

**Solution**: Run `npm run build` locally and fix type errors

#### Permission Errors

```
Error: Resource not accessible by integration
```

**Solution**: Check workflow permissions in the YAML file

## Common Scenarios

### Scenario 1: Creating a Pull Request

When you create a PR:

1. **Auto Label** assigns labels based on files changed
2. **Auto Assign** assigns reviewers and the author
3. **Basic CI** runs for quick feedback (5-10 min)
4. **CI** runs comprehensive tests (15-30 min)

**What to do**:

- Wait for Basic CI to pass (quick feedback)
- Fix any issues found by Basic CI
- Wait for full CI to complete
- Address any reviewer feedback

### Scenario 2: Fixing a Failing Test

If a test fails in CI:

1. Check the test logs in the workflow run
2. Reproduce locally:
   ```bash
   npm test
   # or for a specific test
   npm test -- path/to/test.ts
   ```
3. Fix the issue
4. Push the fix - CI will re-run automatically

### Scenario 3: Creating a Release

To create a release:

1. Ensure `main` branch is stable (all tests passing)
2. Go to Actions → Release workflow
3. Click "Run workflow"
4. Select release type (patch/minor/major)
5. Choose dry run (optional, for testing)
6. Click "Run workflow"
7. Monitor the workflow execution
8. Verify the release was created successfully

### Scenario 4: Debugging a Workflow Failure

If a workflow fails mysteriously:

1. Check if it's a flaky test:
   - Re-run the workflow
   - If it passes, it might be flaky
2. Check recent changes:
   - Did someone change workflow files?
   - Did dependencies update?
3. Check GitHub Status:
   - Visit [githubstatus.com](https://www.githubstatus.com/)
   - GitHub Actions might be experiencing issues
4. Enable debug logging:
   - Add repository secrets `ACTIONS_RUNNER_DEBUG=true`
   - Re-run the workflow
   - Check detailed logs

### Scenario 5: Running E2E Tests on a Feature Branch

Sometimes you want to run E2E tests before merging:

```bash
# Via GitHub CLI
gh workflow run chained_e2e.yml \
  --ref feature-branch \
  -f head_sha=$(git rev-parse HEAD) \
  -f repo_name=$(git remote get-url origin | sed 's/.*://;s/.git$//')
```

Or use the GitHub UI:

1. Go to Actions → E2E (Chained)
2. Click "Run workflow"
3. Enter your branch name and commit SHA
4. Click "Run workflow"

## Performance Tips

### Speed Up CI Runs

1. **Use caching effectively**:
   - npm dependencies are cached automatically
   - Linter binaries are cached

2. **Run tests locally first**:
   ```bash
   npm run preflight  # Runs all checks locally
   ```

3. **Use draft PRs**:
   - Draft PRs skip some expensive checks
   - Mark PR ready when you want full CI

4. **Limit commit frequency**:
   - Squash minor commits before pushing
   - Use `git commit --amend` for small fixes

### Optimize Workflow Usage

1. **Cancel redundant runs**:
   - Workflows auto-cancel on new push (configured via `concurrency`)

2. **Use appropriate workflows**:
   - Use Basic CI for quick checks
   - Run full CI when closer to merge

3. **Run E2E selectively**:
   - E2E runs automatically on `main`
   - Manually trigger for feature branches if needed

## Monitoring and Alerts

### PR Status Checks

Required status checks are configured in branch protection:

- CI must pass
- CodeQL must pass
- All required reviewers must approve

### Email Notifications

You'll receive emails for:

- Workflow failures on your PRs
- Workflow failures on branches you pushed
- Workflow completions you triggered

Configure in GitHub Settings → Notifications

### Slack/Discord Integration

If your team uses Slack/Discord, you can set up workflow notifications:

1. Install GitHub app for your chat platform
2. Subscribe to specific workflow events
3. Get notified in real-time

## Best Practices

1. **Run tests locally before pushing**:
   ```bash
   npm run preflight
   ```

2. **Keep PRs small**:
   - Smaller PRs = faster CI
   - Easier to review
   - Less likely to conflict

3. **Fix failing tests immediately**:
   - Don't merge with failing tests
   - Fix or skip flaky tests properly

4. **Monitor workflow duration**:
   - If workflows get slower, investigate
   - Optimize or parallelize long-running tests

5. **Use workflow status badges**:
   ```markdown
   ![CI](https://github.com/owner/repo/workflows/CI/badge.svg)
   ```

## Troubleshooting

See [GitHub Actions Setup Guide](./github-actions-setup.md#troubleshooting) for detailed troubleshooting steps.

## Additional Resources

- [GitHub Actions Setup Guide](./github-actions-setup.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
