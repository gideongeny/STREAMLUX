# 📸 Upload Release Images to GitHub

This guide will help you upload the phone screenshots to your GitHub release.

## Step 1: Prepare Images

1. **Save your phone screenshots** with these names:
   - `movies-section.png` - Movies section screenshot
   - `tv-shows-section.png` - TV Shows section screenshot  
   - `search-page.png` - Search page screenshot
   - `sign-in-page.png` - Sign In page screenshot

2. **Create folder structure:**
   ```
   Images/
     Android/
       movies-section.png
       tv-shows-section.png
       search-page.png
       sign-in-page.png
   ```

## Step 2: Upload to GitHub

### Option A: Using GitHub Web Interface

1. **Go to your repository** on GitHub
2. **Click "Add file"** → **"Upload files"**
3. **Navigate to** `Images/Android/` folder (create it if it doesn't exist)
4. **Drag and drop** all 4 images
5. **Commit** with message: "Add Android app screenshots"
6. **Push** to main branch

### Option B: Using Git Commands

```bash
# Create Android folder in Images
mkdir -p Images/Android

# Copy your screenshots to Images/Android/
# (Rename them to match the names above)

# Add to git
git add Images/Android/

# Commit
git commit -m "Add Android app screenshots for release"

# Push
git push origin main
```

## Step 3: Update GitHub Release

1. **Go to your repository** → **Releases**
2. **Click on your release** (or create a new one)
3. **Click "Edit"** on the release
4. **In the description**, add the images using this format:

```markdown
## 📸 Screenshots

### Movies Section
![Movies Section](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Android/movies-section.png)

### TV Shows Section
![TV Shows Section](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Android/tv-shows-section.png)

### Search Page
![Search Page](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Android/search-page.png)

### Sign In Page
![Sign In Page](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Android/sign-in-page.png)
```

5. **Copy the full release description** from `GITHUB_RELEASE_DESCRIPTION.md`
6. **Paste it** into the release description
7. **Click "Update release"**

## Step 4: Verify

1. **Check the release page** - Images should display correctly
2. **Test image URLs** - Click on images to verify they load
3. **Check README** - The README should also show the images

## Image URLs Format

After uploading, your images will be available at:
- `https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Android/movies-section.png`
- `https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Android/tv-shows-section.png`
- `https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Android/search-page.png`
- `https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Android/sign-in-page.png`

## Quick Checklist

- [ ] Screenshots saved with correct names
- [ ] Images uploaded to `Images/Android/` folder
- [ ] Images committed and pushed to GitHub
- [ ] Release description updated with images
- [ ] Images display correctly on release page
- [ ] README updated with Android app section

---

**Note:** Make sure image file names match exactly (case-sensitive) and use `.png` extension for best compatibility.

