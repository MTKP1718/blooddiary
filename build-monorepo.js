const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, cwd) {
  console.log(`\n▶ [Executing]: ${command} in ${cwd}`);
  execSync(command, { cwd, stdio: 'inherit', env: { ...process.env, VITE_BASE_PATH: cwd.includes('admin') ? '/admin/' : '/' } });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const rootDir = __dirname;
const donorDir = path.join(rootDir, 'donor-web');
const adminDir = path.join(rootDir, 'admin-web');
const outDir = path.join(rootDir, 'dist');
const adminOutDir = path.join(outDir, 'admin');

console.log('====================================================');
console.log('🚀 Building BloodConnect for Vercel Deployment');
console.log('====================================================');

// 1. Build donor-web
console.log('\n[1/3] Building Donor Web Application...');
run('npm install', donorDir);
run('npm run build', donorDir);

// 2. Build admin-web
console.log('\n[2/3] Building Admin Web Portal...');
run('npm install', adminDir);
run('npm run build', adminDir);

// 3. Assemble unified output directory
console.log('\n[3/3] Assembling unified distribution directory...');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy donor-web dist to root of dist/
const donorDist = path.join(donorDir, 'dist');
if (fs.existsSync(donorDist)) {
  console.log(`Copying donor-web dist (${donorDist}) -> ${outDir}`);
  copyRecursiveSync(donorDist, outDir);
}

// Copy admin-web dist to dist/admin/
const adminDist = path.join(adminDir, 'dist');
if (fs.existsSync(adminDist)) {
  console.log(`Copying admin-web dist (${adminDist}) -> ${adminOutDir}`);
  copyRecursiveSync(adminDist, adminOutDir);
}

console.log('\n✅ Build completed successfully! Unified dist ready for Vercel.');
