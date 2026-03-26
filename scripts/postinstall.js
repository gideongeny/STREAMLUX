const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

try {
  // Ensure vite is executable on Linux/Mac/Vercel environments regardless of package-lock.json corruption
  const vitePath = path.join(__dirname, "..", "node_modules", ".bin", "vite");
  if (fs.existsSync(vitePath)) {
    fs.chmodSync(vitePath, '755');
    console.log("[postinstall] Successfully set executable permissions for vite binary");
  }
} catch(e) {
  console.warn("[postinstall] Warning: Could not chmod vite binary:", e.message);
}

// On Vercel we only build the frontend, so skip backend dependency install.
if (process.env.VERCEL) {
  process.exit(0);
}

// Allow CI/build systems to skip backend install explicitly.
if (process.env.SKIP_BACKEND_INSTALL === "1") {
  process.exit(0);
}

try {
  execSync("npm install", {
    stdio: "inherit",
    cwd: path.join(__dirname, "..", "backend"),
  });
} catch (e) {
  // Don't fail the whole install if backend deps can't be installed.
  // Frontend can still build/deploy independently.
  console.warn("[postinstall] Backend dependency install failed; continuing.");
}

