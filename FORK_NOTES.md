# Fork Configuration Notes / 分支配置說明

## English

### Why These Changes Are Necessary

This repository is a fork of the original
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
repository. The following configuration changes have been made to properly
reflect this fork relationship:

#### 1. Repository URL Update (package.json)

**Changed:** `repository.url` from
`git+https://github.com/google-gemini/gemini-cli.git` to
`git+https://github.com/AKB0700/gemini-cli.git`

**Reason:**

- The repository URL in package.json must point to the actual source repository
  where this code resides
- This ensures that npm, GitHub, and other tools correctly identify the source
  of the package
- Links generated from package metadata (e.g., issue reports, documentation)
  will correctly point to this fork
- Enables proper fork attribution and tracking in the npm ecosystem

#### 2. Maintaining Upstream References

**Note:** Many documentation files and internal references still point to the
original `google-gemini/gemini-cli` repository. This is intentional because:

- Documentation links should point to the official documentation at the upstream
  repository
- Users benefit from accessing the most up-to-date official documentation
- Issue templates, community guidelines, and roadmap discussions occur in the
  upstream repository
- The fork maintains compatibility with the upstream project

#### 3. Fork Relationship

This fork may contain:

- Custom modifications or features
- Experimental changes
- Personal development branches
- Testing or evaluation purposes

While based on the official Google Gemini CLI, this fork operates independently
and should be clearly identified as such in package metadata.

---

## 中文

### 為什麼需要更改這些配置

此存儲庫是原始
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
存儲庫的分支（fork）。為了正確反映這種分支關係，已進行以下配置更改：

#### 1. 存儲庫 URL 更新 (package.json)

**更改內容：** 將 `repository.url` 從
`git+https://github.com/google-gemini/gemini-cli.git` 改為
`git+https://github.com/AKB0700/gemini-cli.git`

**更改原因：**

- package.json 中的存儲庫 URL 必須指向此程式碼實際所在的源存儲庫
- 這確保 npm、GitHub 和其他工具能夠正確識別套件的來源
- 從套件元數據生成的連結（例如問題報告、文檔）將正確指向此分支
- 在 npm 生態系統中啟用正確的分支歸屬和追蹤

#### 2. 保留上游引用

**注意：** 許多文檔文件和內部引用仍然指向原始的 `google-gemini/gemini-cli`
存儲庫。這是有意為之，因為：

- 文檔連結應指向上游存儲庫的官方文檔
- 用戶可以從訪問最新的官方文檔中受益
- 問題模板、社群指南和路線圖討論發生在上游存儲庫中
- 分支與上游專案保持兼容性

#### 3. 分支關係

此分支可能包含：

- 自定義修改或功能
- 實驗性更改
- 個人開發分支
- 測試或評估目的

雖然基於官方的 Google Gemini CLI，但此分支獨立運作，應在套件元數據中清楚標識。

---

## Technical Impact / 技術影響

### Files Modified / 修改的文件

1. **package.json** - Repository URL updated to reflect fork location
2. **FORK_NOTES.md** (this file) - Documentation of fork relationship and
   configuration rationale

### Upstream Compatibility / 上游兼容性

This fork maintains compatibility with the upstream project. Merging updates
from the upstream repository should work smoothly, as these changes only affect
repository metadata, not functionality.

此分支與上游專案保持兼容性。從上游存儲庫合併更新應該能夠順利進行，因為這些更改僅影響存儲庫元數據，而不影響功能。
