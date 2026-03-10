# Release and Push Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish a new patch release by extracting git history since v1.19.35, updating version metadata, writing release notes, committing, and pushing via push.bat.

**Architecture:** Follow the project release workflow docs and release-and-push skill. Derive the release boundary from the last release tag or the last `release: v1.19.35` commit. Generate release notes and update the aggregated release summary and changelog, then commit and push on `main`.

**Tech Stack:** Git, Node metadata (`package.json`), release docs (`docs/release`), version metadata (`version.json`), Windows PowerShell + Python for UTF-8-safe writes.

---

### Task 1: Verify repository state and release boundary

**Files:**
- Modify: none

**Step 1: Check working tree is clean**

Run: `git status`  
Expected: clean working tree (no pending changes)

**Step 2: Identify release boundary**

Run: `git tag --list "v1.19.*" --sort=-v:refname`  
If `v1.19.35` exists, use that tag.  
If no tag, find last release commit:  
Run: `git log --oneline --grep "release: v1.19.35" -n 1`

**Step 3: Extract commit list**

Run (tag case): `git log v1.19.35..HEAD --oneline --no-merges`  
Run (commit hash case): `git log <release_commit>..HEAD --oneline --no-merges`  
Expected: list of commits to include in release notes

---

### Task 2: Bump version metadata to v1.19.36

**Files:**
- Modify: `package.json`
- Modify: `version.json`

**Step 1: Read current version**

Confirm `package.json` version is `1.19.35`

**Step 2: Update package.json**

Set `"version": "1.19.36"`

**Step 3: Update version.json**

- Increment `versionCode` and `buildNumber` by 1
- Set `versionName` to `1.19.36`
- Set `lastBuildDate` to current UTC ISO string

---

### Task 3: Create per-version release notes

**Files:**
- Create: `docs/release/RELEASE_NOTES_v1.19.36.md`

**Step 1: Draft release notes content**

Use the template in `docs/release/README.md`. Keep content aligned with existing release notes style and include the commit count from Task 1.

**Step 2: Ensure UTF-8 with BOM**

Write the file using UTF-8 with BOM (utf-8-sig).

---

### Task 4: Update release summary and changelog

**Files:**
- Modify: `docs/release/release-notes.md`
- Modify: `docs/version/CHANGELOG.md`

**Step 1: release-notes.md**

Add a new top section `## v1.19.36 (2026-03-10)` with a concise summary and the commit list.

**Step 2: CHANGELOG.md**

Add a new top section `## v1.19.36 (2026-03-10)` summarizing:
- Visual upgrades for Steve and weapons
- Visual upgrades for zombie, creeper, skeleton, spider
- Version metadata updated to 1.19.36 / build 88 (if applicable)

Ensure UTF-8 with BOM.

---

### Task 5: Commit release artifacts

**Files:**
- Stage: `package.json`
- Stage: `version.json`
- Stage: `docs/release/RELEASE_NOTES_v1.19.36.md`
- Stage: `docs/release/release-notes.md`
- Stage: `docs/version/CHANGELOG.md`

**Step 1: git add**

Run: `git add package.json version.json docs/release/RELEASE_NOTES_v1.19.36.md docs/release/release-notes.md docs/version/CHANGELOG.md`

**Step 2: git commit**

Run: `git commit -m "release: v1.19.36"`

---

### Task 6: Push via project script

**Files:**
- Modify: none

**Step 1: run push script**

Run: `./push.bat --yes --no-pause`  
Expected: push to remote and sync to main repo
