const path = require("path");
const { execSync } = require("child_process");

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

