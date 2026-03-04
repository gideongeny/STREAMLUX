# Update Vercel Deployment Names from Moonlight to StreamLux

## Issue
Vercel deployments are still showing "moonlight" in their names instead of "streamlux".

## Solution

### Step 1: Update Project Name in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project (currently named "moonlight-films" or similar)
3. Click on the project to open it
4. Go to **Settings** → **General**
5. Scroll down to **Project Name**
6. Change the name from `moonlight-films` to `streamlux` (or `streamlux-films`)
7. Click **Save**

### Step 2: Update Deployment Names (Optional)

Deployment names are automatically generated based on the project name. After updating the project name, new deployments will use "streamlux" instead of "moonlight".

**Note:** Old deployment names cannot be changed, but they won't affect functionality. New deployments will automatically use the updated project name.

### Step 3: Clear Vercel Cache (If Logo Still Shows Moonlight)

If the logo is still showing the old Moonlight logo after deployment:

1. Go to your project in Vercel Dashboard
2. Go to **Settings** → **General**
3. Scroll to **Build & Development Settings**
4. Click **Clear Build Cache**
5. Trigger a new deployment by:
   - Making a small commit and pushing to GitHub, OR
   - Going to **Deployments** tab and clicking **Redeploy** on the latest deployment

### Step 4: Verify Changes

1. Check that new deployments show "streamlux" in the name
2. Visit your live site and verify the StreamLux logo appears
3. Check that all branding shows "StreamLux" instead of "Moonlight"

## Important Notes

- **Old deployments will keep their names** - This is normal and doesn't affect functionality
- **New deployments will automatically use the new name** after you update the project name
- **GitHub contributors** - If you still see "fuocy" as a contributor, you may need to wait a few hours for GitHub to update the contributor list, or contact GitHub support

## Alternative: Create New Project (If Needed)

If you prefer a completely fresh start:

1. Create a new project in Vercel
2. Name it "streamlux"
3. Connect it to the same GitHub repository
4. Deploy
5. Update your custom domain to point to the new project (if applicable)

---

**Last Updated:** 2025

