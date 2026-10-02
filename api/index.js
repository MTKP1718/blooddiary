const fs = require('fs');
const path = require('path');

let appHandler = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function tryServeStatic(req, res) {
  const rootDist = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(rootDist)) return false;

  const urlPath = req.url.split('?')[0];

  // 1. Direct asset request (/assets/... or /admin/assets/...)
  let filePath = path.join(rootDist, urlPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.end(fs.readFileSync(filePath));
    return true;
  }

  // 2. Admin portal SPA fallback (/admin or /admin/...)
  if (urlPath === '/admin' || urlPath.startsWith('/admin/')) {
    const adminIndex = path.join(rootDist, 'admin', 'index.html');
    if (fs.existsSync(adminIndex)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(adminIndex));
      return true;
    }
  }

  // 3. Donor web SPA fallback (any other non-api route)
  if (!urlPath.startsWith('/api')) {
    const donorIndex = path.join(rootDist, 'index.html');
    if (fs.existsSync(donorIndex)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(donorIndex));
      return true;
    }
  }

  return false;
}

module.exports = async (req, res) => {
  try {
    // If request matches a frontend static file or SPA route, serve it directly
    if (tryServeStatic(req, res)) {
      return;
    }

    // Lazy load backend Express application
    if (!appHandler) {
      const app = require('../backend/src/app');
      const { initDb } = require('../backend/src/config/db');
      try {
        await initDb();
      } catch (dbErr) {
        console.warn('[Vercel Serverless] DB init warning:', dbErr.message);
      }
      appHandler = app;
    }

    return appHandler(req, res);
  } catch (error) {
    console.error('[Vercel Serverless Error]:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Serverless Function Execution Error',
      error: error.message
    }));
  }
};
