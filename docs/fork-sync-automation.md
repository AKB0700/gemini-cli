# Upstream Sync Automation - Quick Reference

## Overview

This fork automatically syncs with the upstream repository using GitHub Actions.

## Workflow Details

- **File:** `.github/workflows/sync-upstream.yml`
- **Schedule:** Weekly on Mondays at 2:00 UTC
- **Trigger:** Can be manually triggered from GitHub Actions UI

## What Happens During Sync

1. **Fetch upstream changes** from `google-gemini/gemini-cli`
2. **Check for updates** - counts commits behind
3. **Attempt automatic merge**
4. **Run preflight checks** - build, lint, and tests
5. **Push to fork** if all checks pass
6. **Create issue** if problems occur

## Manual Trigger

1. Go to repository on GitHub
2. Navigate to **Actions** tab
3. Select **Sync with Upstream** workflow
4. Click **Run workflow** button
5. Optional: Enable **dry-run mode** to test without pushing

## Issue Labels

The workflow creates issues with these labels:

- `upstream-sync` - All sync-related issues
- `maintenance` - Merge conflicts requiring manual intervention
- `help wanted` - Merge conflicts needing help
- `bug` - Test/build failures after merge
- `tests` - Preflight check failures

## Monitoring

Check the **Actions** tab regularly for:

- Workflow run status
- Merge success/failure
- Test results
- Any created issues

## Troubleshooting

### If merge conflicts occur

1. Check for new issue labeled `upstream-sync`
2. Follow instructions in the issue
3. See `FORK_NOTES.md` for detailed steps

### If tests fail after merge

1. Check for new issue labeled `upstream-sync`, `bug`, `tests`
2. Review workflow logs for error details
3. Fix failing tests locally
4. Push the fixes to main branch

### Manual sync required

See `FORK_NOTES.md` section "Manual Sync (When Needed)"

## Benefits

✅ **Automated weekly syncs** - No manual git commands needed  
✅ **Automatic testing** - Ensures quality before pushing  
✅ **Conflict detection** - Creates issues when manual intervention needed  
✅ **Dry-run mode** - Test sync process safely  
✅ **Detailed logging** - Easy troubleshooting

## Maintenance

The workflow itself requires minimal maintenance:

- Review created issues when sync fails
- Update workflow if upstream changes repository structure
- Adjust schedule if different timing preferred

## Related Documentation

- `FORK_NOTES.md` - Complete fork maintenance guide
- `.github/workflows/sync-upstream.yml` - Workflow source code
- GitHub Actions documentation
