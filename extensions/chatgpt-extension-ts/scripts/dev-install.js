#!/usr/bin/env node

/**
 * Development Install Script
 * 
 * This script automates the development workflow:
 * 1. Removes the existing extension from the server
 * 2. Builds and packages the extension
 * 3. Uploads the new version via the API
 * 
 * Usage: npm run dev-install
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:8888';
const EXTENSION_ID = 'ChatGPTExtension';
const ZIP_FILE_NAME = 'chatgpt-extension-ts.zip';

console.log('🚀 Starting ChatGPT extension development install...\n');

async function removeExistingExtension() {
    try {
        console.log('🗑️  Removing existing extension...');
        const response = await fetch(`${API_BASE_URL}/api/extensions/${EXTENSION_ID}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Extension removed:', result.message);
        } else if (response.status === 404) {
            console.log('ℹ️  Extension not found (this is OK for first install)');
        } else {
            console.log('⚠️  Failed to remove extension:', response.statusText);
        }
    } catch (error) {
        console.log('⚠️  Error removing extension:', error.message);
        console.log('   (This might be OK if the extension wasn\'t installed)');
    }
    console.log();
}

function buildAndPackage() {
    try {
        console.log('🔨 Building and packaging extension...');
        execSync('npm run package', { stdio: 'inherit' });
        console.log('✅ Extension built and packaged successfully\n');
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

async function uploadExtension() {
    try {
        console.log('📤 Uploading extension...');
        
        const zipPath = path.join(__dirname, '..', ZIP_FILE_NAME);
        
        if (!fs.existsSync(zipPath)) {
            throw new Error(`Zip file not found: ${zipPath}`);
        }
        
        const form = new FormData();
        form.append('extension', fs.createReadStream(zipPath));
        
        const response = await fetch(`${API_BASE_URL}/api/extensions/upload`, {
            method: 'POST',
            body: form
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Extension uploaded successfully!');
            console.log(`   Extension ID: ${result.extensionId}`);
            console.log(`   Message: ${result.message}`);
        } else {
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        process.exit(1);
    }
}

async function checkServerConnection() {
    try {
        console.log('🔍 Checking server connection...');
        const response = await fetch(`${API_BASE_URL}/api/extensions`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        console.log('✅ Server is running and accessible\n');
        return true;
    } catch (error) {
        console.error('❌ Cannot connect to server:', error.message);
        console.error('   Make sure the development server is running on port 8888');
        console.error('   Try: cd example-server && npm start');
        process.exit(1);
    }
}

async function main() {
    try {
        // Check if server is running
        await checkServerConnection();
        
        // Remove existing extension
        await removeExistingExtension();
        
        // Build and package
        buildAndPackage();
        
        // Upload new version
        await uploadExtension();
        
        console.log('\n🎉 Development install completed successfully!');
        console.log('💡 The extension is now ready to use in the graph editor');
        
    } catch (error) {
        console.error('\n❌ Development install failed:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
