# Deploying StreamLux Backend on Render

If you see **Cannot find module '.../backend/dist/downloadProxy.js'**, the service is building/running from the **repo root** instead of the `backend/` folder. The backend must build and start from `backend/` so that `dist/downloadProxy.js` exists.

## Fix in Render dashboard

1. Open your **backend** Web Service → **Settings**.
2. Set **Root Directory** to: `backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Save and **Manual Deploy** → **Deploy latest commit**.

## Or use the Blueprint

Repo root contains `render.yaml`. When creating a new Web Service, use **Blueprint** and point it at this repo; it sets `rootDir: backend` and the correct build/start commands.
