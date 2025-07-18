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

    // Add all files from dist folder (for federation modules)
    const distFiles = fs.readdirSync(distPath);
    for (const file of distFiles) {
      const filePath = path.join(distPath, file);
      const stat = fs.statSync(filePath);
      
      // Only add files, not directories
      if (stat.isFile()) {
        archive.file(filePath, { name: file });
        console.log(`📄 Adding: ${file}`);
      }
    }

    // Finalize the archive
    archive.finalize();
  });
}

// Run the bundling
createExtensionZip().catch(console.error);
