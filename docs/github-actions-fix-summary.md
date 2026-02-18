# GitHub Actions 修復總結 / GitHub Actions Fix Summary

本文件總結了對 GitHub Actions 工作流程所做的所有修復和改進。

This document summarizes all fixes and improvements made to GitHub Actions workflows.

## 問題描述 / Problem Description

根據原始問題報告，GitHub Actions 工作流程存在以下問題：

According to the original issue report, there were the following problems with GitHub Actions workflows:

1. **權限問題** - 工作流程無法運行，因為使用了未經批准的 actions
   **Permission Issues** - Workflows could not run due to unapproved actions
2. **自定義 Runner** - 依賴不可移植的自定義 runners
   **Custom Runners** - Dependency on non-portable custom runners
3. **缺少自動化** - 缺乏完整的 CI/CD 自動化流程
   **Missing Automation** - Lack of complete CI/CD automation
4. **文件不足** - 缺少設定和故障排除文件
   **Insufficient Documentation** - Missing setup and troubleshooting documentation

## 解決方案 / Solutions

### 1. 修復現有工作流程 / Fixed Existing Workflows

#### 替換自定義 Runners / Replaced Custom Runners

所有自定義 runners 已替換為標準的 GitHub-hosted runners：

All custom runners have been replaced with standard GitHub-hosted runners:

- `gemini-cli-ubuntu-16-core` → `ubuntu-latest`
- `gemini-cli-windows-16-core` → `windows-latest`

**修復的文件 / Fixed Files:**

1. **`.github/workflows/ci.yml`** - 7 處替換
   - merge_queue_skipper job
   - lint job
   - test_linux job
   - codeql job
   - bundle_size job
   - test_windows job
   - ci job

2. **`.github/workflows/chained_e2e.yml`** - 10 處替換
   - merge_queue_skipper job
   - download_repo_name job
   - parse_run_context job
   - set_pending_status job
   - e2e_linux job
   - e2e_windows job
   - evals job
   - e2e job
   - set_workflow_status job

3. **`.github/workflows/deflake.yml`** - 2 處替換
   - deflake_e2e_linux job
   - deflake_e2e_windows job

4. **`.github/workflows/evals-nightly.yml`** - 2 處替換
   - evals job
   - aggregate-results job

5. **`.github/workflows/trigger_e2e.yml`** - 2 處替換
   - save_repo_name job
   - trigger_e2e job

#### 添加密鑰回退 / Added Secret Fallbacks

為所有可能不存在的密鑰添加了條件檢查：

Added conditional checks for all secrets that might not exist:

```yaml
# Before / 之前
with:
  secret: '${{ secrets.GEMINI_CLI_ROBOT_GITHUB_PAT }}'

# After / 之後
if: '${{ secrets.GEMINI_CLI_ROBOT_GITHUB_PAT != null }}'
with:
  secret: '${{ secrets.GEMINI_CLI_ROBOT_GITHUB_PAT }}'
```

### 2. 新建工作流程 / New Workflows Created

#### `.github/workflows/basic-ci.yml`

快速 CI 檢查工作流程，提供早期反饋：

Fast CI check workflow for early feedback:

- **觸發條件 / Triggers**: Push, Pull Request
- **功能 / Features**:
  - 基本檢查 (lockfile, type checking, linting, formatting)
  - 建置驗證
  - 單元測試
- **執行時間 / Duration**: 5-10 分鐘

#### `.github/workflows/auto-label.yml`

自動標記 PR 和 Issue 的工作流程：

Automatic labeling workflow for PRs and issues:

- **觸發條件 / Triggers**: PR opened/synchronized, Issue opened
- **功能 / Features**:
  - 根據文件路徑自動添加標籤 (pkg: cli, area: tests 等)
  - 根據 PR 大小添加標籤 (size/xs, size/s, size/m 等)
  - 根據標題和內容檢測 Issue 類型

#### `.github/workflows/auto-assign.yml`

自動分配審查者的工作流程：

Automatic reviewer assignment workflow:

- **觸發條件 / Triggers**: PR opened, ready for review
- **功能 / Features**:
  - 根據文件路徑分配審查者
  - 自動分配 PR 作者給自己的 PR

#### `.github/workflows/release.yml`

自動化發布管理工作流程：

Automated release management workflow:

- **觸發條件 / Triggers**: Manual dispatch only
- **功能 / Features**:
  - 版本自動升級 (patch/minor/major)
  - 自動生成 changelog
  - 創建 GitHub release
  - 發布到 npm (如果配置了 NPM_TOKEN)
  - 支援 dry-run 模式

### 3. 配置文件 / Configuration Files

#### `.github/labeler.yml`

自動標記規則配置：

Auto-labeling rules configuration:

- 文檔變更 → `type: documentation`
- 包變更 → `pkg: cli`, `pkg: core`, `pkg: vscode` 等
- 區域變更 → `area: ci-cd`, `area: tests`, `area: build` 等
- 依賴變更 → `area: dependencies`
- 安全變更 → `area: security`

### 4. 文檔 / Documentation

#### `docs/github-actions-setup.md`

完整的 GitHub Actions 設定指南：

Complete GitHub Actions setup guide:

**內容包括 / Contents include:**
- 必需和可選的密鑰說明
- 工作流程權限詳解
- Runner 配置指南
- 密鑰配置步驟
- 常見問題故障排除
- 最佳實踐建議

#### `docs/ci-cd-guide.md`

綜合的 CI/CD 工作流程指南：

Comprehensive CI/CD workflow guide:

**內容包括 / Contents include:**
- 所有工作流程概述
- 如何觸發不同的工作流程
- 如何理解工作流程結果
- 常見場景處理
- 性能優化建議
- 監控和告警設置

## 驗證結果 / Validation Results

### YAML 語法驗證 / YAML Syntax Validation

所有工作流程文件已通過 yamllint 驗證：

All workflow files passed yamllint validation:

```bash
✓ .github/workflows/ci.yml
✓ .github/workflows/chained_e2e.yml
✓ .github/workflows/deflake.yml
✓ .github/workflows/evals-nightly.yml
✓ .github/workflows/trigger_e2e.yml
✓ .github/workflows/basic-ci.yml
✓ .github/workflows/auto-label.yml
✓ .github/workflows/auto-assign.yml
✓ .github/workflows/release.yml
✓ .github/labeler.yml
```

### 符合所有要求 / All Requirements Met

✅ 1. 修復了權限問題 - 所有工作流程都有正確的 permissions 區塊
   Fixed permission issues - All workflows have correct permissions blocks

✅ 2. 使用標準 runners - 不再依賴自定義 runners
   Using standard runners - No longer dependent on custom runners

✅ 3. 添加了密鑰回退 - 優雅處理缺失的密鑰
   Added secret fallbacks - Gracefully handle missing secrets

✅ 4. 創建了完整的 CI/CD 自動化 - 包括 CI, labeling, assignment, release
   Created complete CI/CD automation - Including CI, labeling, assignment, release

✅ 5. 提供了完整的文檔 - 設定指南和故障排除
   Provided complete documentation - Setup guides and troubleshooting

✅ 6. 所有 YAML 文件語法正確 - 通過 yamllint 驗證
   All YAML files syntactically correct - Passed yamllint validation

## 使用說明 / Usage Instructions

### 本地測試工作流程 / Testing Workflows Locally

在推送前本地驗證更改：

Validate changes locally before pushing:

```bash
# 安裝依賴 / Install dependencies
npm ci

# 運行所有檢查 / Run all checks
npm run preflight

# 只運行 linting / Run linting only
npm run lint

# 只運行測試 / Run tests only
npm test

# 驗證 YAML 語法 / Validate YAML syntax
yamllint .github/workflows/*.yml
```

### 手動觸發工作流程 / Manually Trigger Workflows

使用 GitHub CLI：

Using GitHub CLI:

```bash
# 觸發 Basic CI
gh workflow run basic-ci.yml

# 觸發完整 CI
gh workflow run ci.yml

# 觸發發布 (dry run)
gh workflow run release.yml -f release_type=patch -f dry_run=true

# 觸發 E2E 測試
gh workflow run chained_e2e.yml
```

### 查看工作流程結果 / View Workflow Results

1. 前往 GitHub Actions 標籤頁
   Go to GitHub Actions tab
2. 選擇工作流程運行
   Select workflow run
3. 展開失敗的作業查看詳細日誌
   Expand failed jobs to see detailed logs

## 後續維護 / Ongoing Maintenance

### 定期檢查 / Regular Checks

- 檢查 Dependabot PR 並更新依賴
  Check Dependabot PRs and update dependencies
- 監控工作流程運行時間
  Monitor workflow execution times
- 審查失敗的工作流程並修復
  Review failed workflows and fix issues

### 添加新工作流程 / Adding New Workflows

創建新工作流程時遵循最佳實踐：

Follow best practices when creating new workflows:

1. 使用標準 runners (ubuntu-latest, macos-latest, windows-latest)
   Use standard runners
2. 釘選 action 版本 (使用 commit SHA)
   Pin action versions (use commit SHA)
3. 添加適當的 permissions 區塊
   Add appropriate permissions blocks
4. 為可選密鑰添加回退
   Add fallbacks for optional secrets
5. 添加 concurrency 控制以避免浪費資源
   Add concurrency control to avoid wasting resources

## 參考資源 / References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Project Setup Guide](./github-actions-setup.md)
- [CI/CD Guide](./ci-cd-guide.md)

## 聯繫支援 / Contact Support

如果遇到問題：

If you encounter issues:

1. 查看 [故障排除指南](./github-actions-setup.md#troubleshooting)
   Check [Troubleshooting Guide](./github-actions-setup.md#troubleshooting)
2. 查看現有的 GitHub Issues
   Review existing GitHub Issues
3. 創建新的 Issue 並提供詳細資訊
   Create new Issue with detailed information
