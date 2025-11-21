# Release Process

This document describes how to create and publish releases for the BulletBase Firefox extension.

## Overview

Releases are automatically created when you push to the `main` branch with an updated version number. The release includes:

- Git tag (e.g., `v1.0.3`)
- GitHub release with changelog
- Versioned zip file in `releases/` folder
- Attached extension.zip for download

---

## Automatic Release (Recommended)

### Step 1: Update Version

Edit `package.json`:

```json
{
  "version": "1.0.3"
}
```

### Step 2: Update Changelog

Edit `CHANGELOG.md`:

```markdown
## [1.0.3] - 2024-11-22

### Added

- New feature description

### Fixed

- Bug fix description

### Changed

- Change description
```

### Step 3: Commit and Push

```bash
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.3"
git push origin main
```

### Step 4: Automatic Process

GitHub Actions will automatically:

1. ✅ Run all tests
2. ✅ Build the extension
3. ✅ Create `releases/v1.0.3.zip`
4. ✅ Create Git tag `v1.0.3`
5. ✅ Generate changelog from commits
6. ✅ Create GitHub release
7. ✅ Attach zip files to release
8. ✅ Upload build artifacts

### Step 5: Verify Release

1. Go to GitHub repository
2. Click "Releases"
3. Verify new release `v1.0.3` exists
4. Download and test the attached zip file

---

## Manual Release (Local)

For testing or creating local releases:

### Create Versioned Release

```bash
npm run release
```

This creates:

- `releases/v{version}.zip` - Versioned release
- `extension.zip` - Copy for convenience

### Create Simple Zip

```bash
npm run zip
```

This creates only `extension.zip` in the root directory.

---

## Release Workflow Details

### GitHub Actions Workflow

Located at `.github/workflows/release.yml`

**Triggers:**

- Push to `main` branch

**Steps:**

1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests (must pass)
5. Build extension
6. Get version from package.json
7. Create releases directory
8. Create versioned zip: `releases/v{version}.zip`
9. Check if tag exists
10. Create Git tag (if new version)
11. Generate changelog
12. Create GitHub release
13. Attach zip files
14. Upload artifacts

**Artifacts:**

- Retained for 90 days
- Includes versioned zip, extension.zip, and dist folder

---

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Examples:

- `1.0.0` → `1.0.1` - Bug fix
- `1.0.1` → `1.1.0` - New feature
- `1.1.0` → `2.0.0` - Breaking change

---

## Release Checklist

Before creating a release:

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No type errors (`npm run type-check`)
- [ ] Code formatted (`npm run format`)

### Documentation

- [ ] CHANGELOG.md updated
- [ ] README.md updated (if needed)
- [ ] Version number updated in package.json

### Testing

- [ ] Extension builds successfully (`npm run build`)
- [ ] Extension loads in Firefox
- [ ] Core features tested:
  - [ ] SMS sync working
  - [ ] Send push working
  - [ ] Device list loading
  - [ ] Push history working

### Commit

- [ ] Changes committed with conventional commit message
- [ ] Pushed to main branch

---

## Release Files

### Structure

```
releases/
├── README.md           # This file
├── v1.0.0.zip         # Version 1.0.0
├── v1.0.1.zip         # Version 1.0.1
├── v1.0.2.zip         # Version 1.0.2
└── v1.0.3.zip         # Version 1.0.3 (latest)
```

### File Contents

Each zip file contains:

```
popup.js              # Main UI bundle
index.html            # Popup HTML
background.js         # Background script
icon.svg              # Extension icon
manifest.json         # Extension manifest
assets/
  └── popup-*.css     # Styles
```

---

## Troubleshooting

### Release Not Created

**Problem**: Pushed to main but no release created

**Solutions:**

1. Check GitHub Actions tab for errors
2. Verify version in package.json changed
3. Check if tag already exists
4. Review workflow logs

### Tests Failing

**Problem**: Release workflow fails at test step

**Solutions:**

1. Run tests locally: `npm test`
2. Fix failing tests
3. Commit and push fixes
4. Workflow will retry automatically

### Build Failing

**Problem**: Build step fails in workflow

**Solutions:**

1. Run build locally: `npm run build`
2. Check for TypeScript errors
3. Verify all dependencies installed
4. Fix errors and push

### Tag Already Exists

**Problem**: Tag `v1.0.3` already exists

**Solutions:**

1. Increment version to `1.0.4`
2. Or delete existing tag:
   ```bash
   git tag -d v1.0.3
   git push origin :refs/tags/v1.0.3
   ```
3. Push again

---

## Publishing to Firefox Add-ons

After creating a release:

### Step 1: Download Release

1. Go to GitHub Releases
2. Download `v{version}.zip`
3. Extract the zip file

### Step 2: Submit to Mozilla

1. Go to https://addons.mozilla.org/developers/
2. Click "Submit a New Add-on"
3. Upload the extracted files or zip
4. Fill in listing details:
   - Name: BulletBase - Pushbullet Client
   - Summary: SMS mirroring and push notifications
   - Description: (from README)
   - Categories: Communication, Productivity
   - Support email/website
5. Submit for review

### Step 3: Review Process

- Mozilla reviews typically take 1-7 days
- You'll receive email notifications
- Address any review comments
- Once approved, extension goes live

### Step 4: Updates

For subsequent versions:

1. Create new release (follow process above)
2. Go to Add-on dashboard
3. Upload new version
4. Submit for review

---

## Best Practices

### Commit Messages

Use conventional commits:

```bash
feat: add new feature
fix: resolve bug
docs: update documentation
chore: bump version to 1.0.3
```

### Testing

Always test before release:

```bash
npm test                 # Run all tests
npm run test:coverage    # Check coverage
npm run build            # Verify build
```

### Versioning

- Increment PATCH for bug fixes
- Increment MINOR for new features
- Increment MAJOR for breaking changes
- Update CHANGELOG.md for every release

### Documentation

Keep these updated:

- CHANGELOG.md - Version history
- README.md - Installation and usage
- Package.json - Version number

---

## Quick Reference

### Create Release

```bash
# 1. Update version in package.json
# 2. Update CHANGELOG.md
# 3. Commit and push
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.3"
git push origin main
# 4. GitHub Actions creates release automatically
```

### Local Testing

```bash
npm run release          # Create versioned release
npm run zip              # Create simple zip
npm test                 # Run tests
npm run build            # Build extension
```

### Verify Release

```bash
ls -lh releases/         # Check releases folder
unzip -l releases/v*.zip # List zip contents
```

---

## Support

For questions or issues:

- Open an issue on GitHub
- Check GitHub Actions logs
- Review this documentation

---

Last updated: 2024-11-21
