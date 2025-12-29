# StreamLux Deployment Sync Guide

To ensure all your Vercel domains (`streamlux.vercel.app`, `moonlight-films-five.vercel.app`, etc.) match the "complete" version at `moonlight-films-kzf9.vercel.app`, follow these steps in your Vercel Dashboard:

## 1. Verify Project Settings
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. For EACH project (`STREAMLUX`, `moonlight-films-five`, etc.):
   - Click on the project name.
   - Go to **Settings** > **Git**.
   - Ensure the **Production Branch** is set to `main`.
   - Ensure **Framework Preset** is set to `Create React App`.

## 2. Sync Domains
If you want multiple domains to point to the SAME project:
1. Choose one project as your "Master" (e.g., `moonlight-films-kzf9`).
2. Go to **Settings** > **Domains**.
2. Go to **Settings** > **Domains`.
3. Add your other domains (`streamlux.vercel.app`, etc.) here.
4. Remove those domains from the other "duplicate" projects in Vercel to avoid conflicts.

## 3. Trigger a Fresh Deployment
If they are already pointing to the same project but look different:
1. Go to the **Deployments** tab of the project.
2. Click the three dots `...` on the latest deployment (the one I just pushed).
3. Select **Redeploy**.
4. This will force Vercel to rebuild using the latest code and assets.

> [!TIP]
> The easiest way to keep them consistent is to have **ONE** Vercel project and add **ALL** your domains to it under the Domains settings.
