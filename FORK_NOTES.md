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

### Adding Upstream Remote

If not already configured, add the upstream repository:

```bash
git remote add upstream https://github.com/google-gemini/gemini-cli.git
git fetch upstream
```

### Syncing with Upstream

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

- [ ] Regularly sync with upstream (recommended: weekly or bi-weekly)
- [ ] Keep dependencies up to date
- [ ] Monitor upstream releases for breaking changes
- [ ] Update fork-specific documentation when changes are made
- [ ] Review and test upstream changes before merging

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
