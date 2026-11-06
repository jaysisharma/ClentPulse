const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, 'dist')
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

const srcHtml = path.join(__dirname, 'src', 'ui.html')
const destHtml = path.join(distDir, 'ui.html')

fs.copyFileSync(srcHtml, destHtml)
console.log('✓ Copied src/ui.html -> dist/ui.html')

