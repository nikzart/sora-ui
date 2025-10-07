# Creating a Release

This guide explains how to create a new release with automated builds for Windows, macOS, and Linux.

---

## ⚙️ One-Time Setup: GitHub Secrets

**IMPORTANT:** Before creating your first release, you must configure GitHub Secrets with your Azure API credentials.

### Setting Up Secrets

1. **Go to your GitHub repository**
2. **Click Settings → Secrets and variables → Actions**
3. **Click "New repository secret" and add each of these:**

   | Secret Name | Value (from your `.env` file) |
   |------------|-------------------------------|
   | `VITE_AZURE_ENDPOINT` | Your Azure endpoint URL |
   | `VITE_AZURE_API_KEY` | Your Azure API key |
   | `VITE_API_VERSION` | `preview` |
   | `VITE_O4_MINI_ENDPOINT` | Your o4-mini endpoint URL |
   | `VITE_O4_MINI_DEPLOYMENT` | `o4-mini` |
   | `VITE_O4_MINI_API_VERSION` | `2024-12-01-preview` |

4. **Click "Add secret" for each one**

### Example format (use your actual values from `.env`):

```env
# Copy these values to GitHub Secrets (replace with your actual credentials)
VITE_AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com
VITE_AZURE_API_KEY=your_actual_azure_api_key_here
VITE_API_VERSION=preview
VITE_O4_MINI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
VITE_O4_MINI_DEPLOYMENT=o4-mini
VITE_O4_MINI_API_VERSION=2024-12-01-preview
```

**Why?** GitHub Actions doesn't have access to your local `.env` file. The workflow will create a `.env` file during build using these secrets.

---

## 🚀 Quick Release Process

### 1. Prepare the Release

1. **Update version in `package.json`:**
   ```json
   {
     "version": "0.1.0"  // Update this
   }
   ```

2. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Release v0.1.0"
   ```

3. **Push to GitHub:**
   ```bash
   git push origin main
   ```

### 2. Create a Git Tag

```bash
# Create and push a version tag
git tag v0.1.0
git push origin v0.1.0
```

**That's it!** GitHub Actions will automatically:
- Build installers for Windows, macOS, and Linux
- Create a GitHub Release
- Upload all installers to the release
- Generate release notes

---

## 📦 What Gets Built

GitHub Actions will create:

- **Windows:**
  - `Sora Video Generation-Setup-0.1.0.exe` (NSIS installer)
  - Unpacked app folder

- **macOS:**
  - `Sora Video Generation-0.1.0.dmg` (disk image)

- **Linux:**
  - `Sora Video Generation-0.1.0.AppImage` (portable app)

---

## 🔍 Monitoring the Build

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Find the running workflow "Build Electron App"
4. Watch the build progress (takes ~5-10 minutes)

---

## ✅ After Build Completes

1. Go to "Releases" tab on GitHub
2. Your new release will be there with all installers attached
3. Share the release link with users!

---

## 🛠️ Manual Trigger (Optional)

You can also trigger builds manually without creating a tag:

1. Go to GitHub → Actions
2. Select "Build Electron App" workflow
3. Click "Run workflow"
4. Choose branch (usually `main`)
5. Click "Run workflow"

**Note:** Manual runs create artifacts but don't create a release. Use tags for releases.

---

## 📝 Version Numbering

Follow semantic versioning (semver):

- **Major** (X.0.0) - Breaking changes
- **Minor** (0.X.0) - New features
- **Patch** (0.0.X) - Bug fixes

Examples:
- `v0.0.1` - Initial release
- `v0.1.0` - Added prompt enhancement feature
- `v1.0.0` - First stable release

---

## 🔧 Troubleshooting

### Build Fails

1. **Check workflow logs:**
   - Actions tab → Failed workflow → Click on job → View logs

2. **Common issues:**
   - **Missing GitHub Secrets**: Most common! Verify all 6 secrets are configured (see "One-Time Setup" above)
   - Missing dependencies: Check `package.json`
   - TypeScript errors: Run `npm run build` locally
   - Icon missing: Check `build/` directory
   - Environment variables undefined: Check GitHub Secrets are named exactly as shown (case-sensitive)

3. **Fix and re-tag:**
   ```bash
   # Delete tag locally and remotely
   git tag -d v0.1.0
   git push origin :refs/tags/v0.1.0

   # Fix issue, commit, and re-tag
   git commit -m "Fix build issue"
   git tag v0.1.0
   git push origin main --tags
   ```

### Release Not Created

- Ensure tag starts with `v` (e.g., `v0.1.0`, not `0.1.0`)
- Check GitHub Actions workflow permissions (Settings → Actions → Workflow permissions)

---

## 🎯 Best Practices

1. **Test before tagging:**
   ```bash
   # Build locally first
   npm run electron:build:win
   npm run electron:build:mac
   npm run electron:build:linux
   ```

2. **Update CHANGELOG:**
   - Keep a CHANGELOG.md with release notes
   - List new features, bug fixes, breaking changes

3. **Version consistency:**
   - Ensure `package.json` version matches git tag

4. **Pre-release for testing:**
   ```bash
   git tag v0.1.0-beta.1
   git push origin v0.1.0-beta.1
   ```

---

## 📊 Release Checklist

### First Release Only:
- [ ] Configure GitHub Secrets (see "One-Time Setup" above)

### Every Release:
- [ ] Update version in `package.json`
- [ ] Test build locally
- [ ] Update CHANGELOG.md (if exists)
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Create and push git tag
- [ ] Monitor GitHub Actions build
- [ ] Verify release created with all files
- [ ] Test installers on target platforms
- [ ] Announce release!

---

## 🎉 First Release

For your first release (v0.0.1), just run:

```bash
# Make sure everything is committed
git add .
git commit -m "Initial release"
git push origin main

# Create first release
git tag v0.0.1
git push origin v0.0.1
```

Then check GitHub Actions!

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [electron-builder Documentation](https://www.electron.build/)

---

**Happy releasing! 🚀**
