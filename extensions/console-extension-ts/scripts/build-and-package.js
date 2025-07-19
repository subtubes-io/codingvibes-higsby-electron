#!/usr/bin/env node

/**
 * Build and Package Extension Script
 * 
 * This script automates the complete build process for the Console extension:
 * 1. Builds the extension with Vite and federation
 * 2. Copies all federation assets to the root dist folder
 * 3. Creates a zip package with all necessary files
 * 
 * The script ensures all federation dependencies are included in the package
 * so the extension can be loaded properly by the host application.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Console extension build and packaging process...\n');

try {
    // Step 1: Clean previous build
    console.log('🧹 Cleaning previous build...');
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    console.log('✅ Build directory cleaned\n');

    // Step 2: Build the extension
    console.log('🔨 Building extension with Vite...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Extension built successfully\n');

    // Step 3: Copy federation assets to root
    console.log('📦 Copying federation assets to root...');
    const assetsDir = path.join(__dirname, '../dist/assets');
    const distDir = path.join(__dirname, '../dist');
    
    if (fs.existsSync(assetsDir)) {
        const assets = fs.readdirSync(assetsDir);
        let copiedCount = 0;
        
        assets.forEach(asset => {
            const assetPath = path.join(assetsDir, asset);
            const targetPath = path.join(distDir, asset);
            
            // Only copy files, not directories
            if (fs.statSync(assetPath).isFile()) {
                fs.copyFileSync(assetPath, targetPath);
                console.log(`  📄 Copied: ${asset}`);
                copiedCount++;
            }
        });
        
        console.log(`✅ Copied ${copiedCount} federation assets\n`);
    } else {
        console.warn('⚠️  Assets directory not found, skipping copy step\n');
    }

    // Step 4: Create the zip package
    console.log('📦 Creating extension package...');
    execSync('npm run zip', { stdio: 'inherit' });
    
    // Step 5: Display final results
    const zipPath = path.join(__dirname, '../console-extension-ts.zip');
    if (fs.existsSync(zipPath)) {
        const stats = fs.statSync(zipPath);
        const sizeInKB = (stats.size / 1024).toFixed(2);
        
        console.log('\n🎉 Console extension packaging completed successfully!');
        console.log('📦 Package details:');
        console.log(`   📄 File: console-extension-ts.zip`);
        console.log(`   📏 Size: ${sizeInKB} KB`);
        console.log(`   📁 Location: ${zipPath}`);
        console.log('\n✨ Ready to upload and test in the graph editor!');
        console.log('\n🖥️  Console extension provides clean log display and debugging capabilities');
    } else {
        throw new Error('Zip file was not created');
    }

} catch (error) {
    console.error('\n❌ Build and packaging failed:');
    console.error(error.message);
    process.exit(1);
}
