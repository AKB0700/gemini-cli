# Fork Notes

This document contains notes and guidelines for maintaining this fork of the
Gemini CLI project.

## Fork Information

- **Upstream Repository**:
  [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- **Fork Repository**:
  [AKB0700/gemini-cli](https://github.com/AKB0700/gemini-cli)
- **License**: Apache 2.0

## Purpose of This Fork

This fork maintains a customized version of the Gemini CLI with specific
modifications and enhancements while preserving the ability to sync with
upstream improvements.

## Keeping in Sync with Upstream

### Automated Sync (Recommended)

This fork uses a **GitHub Actions workflow** to automatically sync with
upstream:

- **Schedule:** Runs weekly on Mondays at 2:00 UTC
- **Workflow:** `.github/workflows/sync-upstream.yml`
- **What it does:**
  1. Fetches latest changes from upstream
  2. Attempts to merge into main branch
  3. Runs full preflight checks (build, lint, tests)
  4. Pushes merged changes if all checks pass
  5. Creates an issue if conflicts are detected

For a complete quick reference guide, see
[Fork Sync Automation Guide](./docs/fork-sync-automation.md).

**Manual trigger:** You can also trigger the sync manually:

1. Go to **Actions** → **Sync with Upstream**
2. Click **Run workflow**
3. Choose dry-run mode (optional) to test without pushing

**Monitoring:** Check the Actions tab regularly for sync status. The workflow
will:

- Create an issue labeled `upstream-sync` if merge conflicts occur
- Create an issue labeled `upstream-sync`, `bug`, `tests` if tests fail after
  merge
- Show a summary in the workflow run output

### Manual Sync (When Needed)

If the automated sync fails due to conflicts, follow these manual steps:

#### Adding Upstream Remote

If not already configured, add the upstream repository:

```bash
git remote add upstream https://github.com/google-gemini/gemini-cli.git
git fetch upstream
```

#### Syncing with Upstream

To sync with the latest upstream changes:

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Checkout your main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Resolve any conflicts if they occur
# Push the merged changes to your fork
git push origin main
```

### Handling Merge Conflicts

When conflicts arise during upstream sync:

1. Review conflicts carefully to preserve fork-specific modifications
2. Test thoroughly after resolving conflicts
3. Run the full test suite: `npm run preflight`
4. Update documentation if upstream changes affect fork-specific features

## Development Workflow

### Branch Strategy

- **main**: Primary branch, should stay relatively in sync with upstream
- **feature branches**: Use descriptive names (e.g.,
  `feature/custom-integration`)
- **hotfix branches**: For urgent fixes (e.g., `hotfix/critical-bug`)

### Before Making Changes

1. Sync with upstream to ensure you're working with the latest code
2. Create a feature branch from main
3. Follow the upstream contribution guidelines (see `CONTRIBUTING.md`)

### Testing

Always run tests before committing:

```bash
# Run all tests
npm run preflight

# Run specific test suites
npm run test
npm run test:e2e
npm run lint
```

## Custom Modifications

Document any significant deviations from upstream here:

### Current Customizations

- _(Add your custom modifications here as they are implemented)_

### Configuration Changes

- _(Document any configuration file changes specific to this fork)_

## Contributing to This Fork

### For Fork Contributors

1. Follow the same code standards as the upstream project
2. Keep commits atomic and well-documented
3. Reference related issues in commit messages
4. Ensure all tests pass before submitting PRs

### For Upstream Contributions

If you develop a feature in this fork that would benefit the upstream project:

1. Ensure it follows upstream contribution guidelines
2. Create a separate branch based on upstream/main
3. Submit a PR to the upstream repository
4. Reference the upstream PR in this fork for tracking

## Important Files

- `package.json`: Contains fork-specific version and repository information
- `CONTRIBUTING.md`: Upstream contribution guidelines (applies to this fork)
- `README.md`: Project documentation
- `ROADMAP.md`: Upstream project roadmap

## Maintenance Checklist

### Automated Tasks ✅

- [x] **Regularly sync with upstream** - Automated via GitHub Actions (weekly)
- [x] **Run preflight checks after sync** - Automated in sync workflow
- [x] **Create issues on sync failures** - Automated notifications

### Manual Tasks

- [ ] Keep dependencies up to date (consider enabling Dependabot)
- [ ] Monitor upstream releases for breaking changes
- [ ] Update fork-specific documentation when changes are made
- [ ] Review automated sync PRs/issues when conflicts occur

## Resources

- [Upstream Repository](https://github.com/google-gemini/gemini-cli)
- [Upstream Documentation](https://geminicli.com/docs/)
- [GitHub Fork Documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks)
- [Apache 2.0 License](https://github.com/google-gemini/gemini-cli/blob/main/LICENSE)

## Support

- For issues related to the core Gemini CLI functionality, check the
  [upstream issues](https://github.com/google-gemini/gemini-cli/issues)
- For fork-specific issues, use this repository's issue tracker
- Follow upstream community guidelines and code of conduct

## Notes

- This fork maintains compatibility with the upstream project's architecture
- Review upstream releases and changelogs regularly
- Document any breaking changes introduced in this fork
- Keep this document updated as the fork evolves
