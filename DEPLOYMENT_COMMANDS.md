# Deployment Commands

## Pre-Deployment Checklist

1. ✅ All logo.png references changed to logo.svg
2. ✅ logo.png file deleted
3. ✅ Smart ad loading implemented
4. ✅ Environment variables configured

## Build the Project

```bash
npm run build
```

## Deploy to Firebase

### 1. Deploy Firestore Rules (Security)
```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Storage Rules (if needed)
```bash
firebase deploy --only storage:rules
```

### 3. Deploy Hosting (Frontend)
```bash
firebase deploy --only hosting
```

### 4. Deploy Everything
```bash
firebase deploy
```

## Push to GitHub

### 1. Check Status
```bash
git status
```

### 2. Add All Changes
```bash
git add .
```

### 3. Commit Changes
```bash
git commit -m "feat: Smart ad integration, logo fix, YouTube/scraper content mixing, Buy Me a Coffee, enhanced downloads, Netflix features"
```

### 4. Push to GitHub
```bash
git push origin main
```

Or if using master branch:
```bash
git push origin master
```

## Full Deployment Script

Run these commands in sequence:

```bash
# Build the project
npm run build

# Deploy Firestore rules first (important for security)
firebase deploy --only firestore:rules

# Deploy hosting
firebase deploy --only hosting

# Git operations
git add .
git commit -m "feat: Smart ad integration, logo fix, YouTube/scraper content mixing, Buy Me a Coffee, enhanced downloads, Netflix features"
git push origin main
```

## Verify Deployment

1. Check Firebase Hosting: https://streamlux-67a84.web.app
2. Check Firestore Rules in Firebase Console
3. Verify ads are loading correctly (check browser console)
4. Verify logo.svg is displaying correctly

## Notes

- Make sure `.env` file is NOT committed to GitHub (should be in .gitignore)
- Firestore rules deployment is critical for security
- Test the website after deployment to ensure everything works
