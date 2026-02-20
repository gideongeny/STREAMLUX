# Vercel Deployment Guide for StreamLux (formerly Moonlight)

## Steps to Update Your Vercel Project After Renaming

### 1. Update Project Name in Vercel Dashboard

1. **Log in to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Navigate to your dashboard

2. **Access Project Settings:**
   - Click on your project (currently named "moonlight-films" or similar)
   - Go to **Settings** tab
   - Scroll to **General** section

3. **Rename the Project:**
   - Find the **Project Name** field
   - Change it from "moonlight-films" to "streamlux" (or "streamlux-films")
   - Click **Save**

### 2. Update Environment Variables (if any reference the old name)

1. **Check Environment Variables:**
   - In the same **Settings** tab
   - Go to **Environment Variables** section
   - Review all variables to see if any reference "moonlight"
   - Update any that do (though typically not needed)

### 3. Update Domain Settings (if using custom domain)

1. **Check Domain Configuration:**
   - Go to **Settings** → **Domains**
   - If you have a custom domain, verify it's still configured correctly
   - The domain settings are independent of the project name

### 4. Verify GitHub Integration

1. **Check Git Repository:**
   - Go to **Settings** → **Git**
   - Verify your GitHub repository is still connected
   - The repository URL should be: `https://github.com/gideongeny/moonlight-films.git`
   - This doesn't need to change unless you rename the GitHub repo

### 5. Trigger a New Deployment

After renaming, Vercel will automatically:
- Keep all existing deployments
- Continue deploying from your GitHub repository
- Maintain all environment variables and settings

**To force a new deployment:**
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment, OR
- Push a new commit to your GitHub repository (which will auto-deploy)

### 6. Update Build Settings (if needed)

1. **Verify Build Configuration:**
   - Go to **Settings** → **General**
   - Check **Build Command**: Should be `npm run build` (default)
   - Check **Output Directory**: Should be `build` (default for Create React App)
   - Check **Install Command**: Should be `npm install` (default)

### 7. Update Vercel Analytics (if enabled)

If you're using Vercel Analytics:
- The analytics will continue working automatically
- No changes needed

### 8. Update Preview URLs

After renaming, your preview URLs will change:
- **Old**: `moonlight-films-xyz.vercel.app`
- **New**: `streamlux-xyz.vercel.app` (or whatever you named it)

Update any external references to the old preview URL.

## Important Notes

✅ **What Changes:**
- Project name in Vercel dashboard
- Preview deployment URLs (if you renamed)
- Project URL slug

✅ **What Stays the Same:**
- All deployments and history
- Environment variables
- Domain settings
- GitHub integration
- Build settings
- Analytics data

## Troubleshooting

### If deployments fail after renaming:

1. **Check Build Logs:**
   - Go to **Deployments** tab
   - Click on the failed deployment
   - Review the build logs for errors

2. **Verify Environment Variables:**
   - Ensure all required environment variables are set
   - Check if any reference the old project name

3. **Clear Build Cache:**
   - Go to **Settings** → **General**
   - Scroll to **Build & Development Settings**
   - Click **Clear Build Cache** if needed

### If you need to update the GitHub repository name:

If you also want to rename your GitHub repository:

1. **On GitHub:**
   - Go to repository settings
   - Rename the repository (e.g., to `streamlux-films`)
   - Update the remote URL locally:
     ```bash
     git remote set-url origin https://github.com/gideongeny/streamlux-films.git
     ```

2. **On Vercel:**
   - Go to **Settings** → **Git**
   - Disconnect and reconnect the repository
   - Or update the repository URL manually

## Quick Checklist

- [ ] Renamed project in Vercel dashboard
- [ ] Verified environment variables
- [ ] Checked domain settings
- [ ] Verified GitHub integration
- [ ] Triggered new deployment
- [ ] Updated any external references to old URLs
- [ ] Tested the new deployment

## Support

If you encounter any issues:
1. Check Vercel's [documentation](https://vercel.com/docs)
2. Review build logs in the Vercel dashboard
3. Check the [Vercel community forum](https://github.com/vercel/vercel/discussions)

---

**Note:** The project name change is cosmetic and doesn't affect functionality. Your site will continue working exactly as before, just with a new name that matches your rebranding to StreamLux.

