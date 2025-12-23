# How to Update Vercel Domain to StreamLux

## Option 1: Rename Project in Vercel (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in to your account
   - Navigate to your project

2. **Rename the Project:**
   - Click on **Settings** tab
   - Scroll to **General** section
   - Find **Project Name** field
   - Change from `moonlight-films` to `streamlux` (or `streamlux-films`)
   - Click **Save**

3. **Result:**
   - Your new URL will be: `https://streamlux-xxxxx.vercel.app`
   - Old URL will redirect to new one automatically
   - All deployments and settings remain intact

## Option 2: Add Custom Domain

If you want a custom domain like `streamlux.com`:

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter your domain (e.g., `streamlux.com`)
   - Follow DNS configuration instructions

2. **Update DNS Records:**
   - Add the CNAME or A record as instructed by Vercel
   - Wait for DNS propagation (can take up to 48 hours)

## Option 3: Keep Current Domain

The current domain `moonlight-films-kzf9.vercel.app` will continue working. 
You can:
- Keep it as is
- Add a custom domain alongside it
- Both will work simultaneously

## Important Notes

- **GitHub Repository Name:** You don't need to rename your GitHub repo. Vercel will continue working with `moonlight-films` repository name.
- **Environment Variables:** No changes needed
- **Build Settings:** No changes needed
- **Deployments:** All existing deployments remain accessible

## For Google Search Console

After updating the domain:

1. **Add New Property:**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add the new Vercel URL as a property
   - Verify ownership (Vercel provides meta tag verification)

2. **Submit Sitemap:**
   - Submit your sitemap URL (if you have one)
   - Request indexing for important pages

3. **Update Old Property:**
   - Keep the old property for redirect tracking
   - Add the new property for indexing

## Quick Steps Summary

1. ✅ Rename project in Vercel Settings → General → Project Name
2. ✅ Wait for new deployment (automatic)
3. ✅ Update Google Search Console with new URL
4. ✅ Test the new URL
5. ✅ Update any external links/bookmarks

---

**Note:** The project name change is instant and doesn't affect functionality. Your site will be accessible at the new URL immediately after renaming.

