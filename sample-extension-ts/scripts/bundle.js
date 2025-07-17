const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

async function createExtensionZip() {
  const outputPath = path.join(__dirname, '../hello-world-extension-ts.zip');
  const distPath = path.join(__dirname, '../dist');
  const manifestPath = path.join(__dirname, '../manifest.json');

  // Check if dist folder exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Check if manifest exists
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found.');
    process.exit(1);
  }

  // Remove existing zip file
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  // Create a file to stream archive data to
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInKB = (archive.pointer() / 1024).toFixed(2);
      console.log(`✅ Extension bundled successfully!`);
      console.log(`📦 File: ${path.basename(outputPath)}`);
      console.log(`📏 Size: ${sizeInKB} KB`);
      console.log(`📁 Location: ${outputPath}`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('❌ Error creating zip:', err);
      reject(err);
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add manifest.json
    archive.file(manifestPath, { name: 'manifest.json' });

    // Add the compiled JavaScript file
    const indexPath = path.join(distPath, 'index.js');
    if (fs.existsSync(indexPath)) {
      archive.file(indexPath, { name: 'index.js' });
    } else {
      console.error('❌ index.js not found in dist folder');
      reject(new Error('index.js not found'));
      return;
    }

    // Add any TypeScript declaration files (optional)
    const declarationPath = path.join(distPath, 'index.d.ts');
    if (fs.existsSync(declarationPath)) {
      archive.file(declarationPath, { name: 'index.d.ts' });
    }

    // Finalize the archive
    archive.finalize();
  });
}

// Run the bundling
createExtensionZip().catch(console.error);
