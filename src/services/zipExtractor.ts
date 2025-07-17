/**
 * Zip Extractor Service
 * Handles extraction and validation of extension zip files
 */

import AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ExtensionManifest } from '../types/extension';

export class ZipExtractor {
    private extensionsDir: string;

    constructor() {
        // Get the extensions directory relative to the app root
        this.extensionsDir = path.join(process.cwd(), 'extensions');
        this.ensureExtensionsDir();
    }

    /**
     * Ensure the extensions directory exists
     */
    private async ensureExtensionsDir(): Promise<void> {
        await fs.ensureDir(this.extensionsDir);
    }

    /**
     * Extract a zip file to the extensions directory
     */
    async extractExtension(zipBuffer: Buffer, extensionId: string): Promise<string> {
        try {
            const zip = new AdmZip(zipBuffer);
            const extractPath = path.join(this.extensionsDir, extensionId);

            // Ensure clean extraction (remove existing if exists)
            await fs.remove(extractPath);
            await fs.ensureDir(extractPath);

            // Extract all files
            zip.extractAllTo(extractPath, true);

            return extractPath;
        } catch (error) {
            throw new Error(`Failed to extract extension: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate zip file structure
     */
    async validateZipStructure(zipBuffer: Buffer): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            const zip = new AdmZip(zipBuffer);
            const entries = zip.getEntries();

            // Check if manifest.json exists
            const hasManifest = entries.some(entry =>
                entry.entryName === 'manifest.json' ||
                entry.entryName.endsWith('/manifest.json')
            );

            if (!hasManifest) {
                errors.push('Missing manifest.json file');
            }

            // Check for main entry point (will be validated later against manifest)
            const hasJsFiles = entries.some(entry =>
                entry.entryName.endsWith('.js') ||
                entry.entryName.endsWith('.jsx') ||
                entry.entryName.endsWith('.ts') ||
                entry.entryName.endsWith('.tsx')
            );

            if (!hasJsFiles) {
                errors.push('No JavaScript/TypeScript files found');
            }

            // Check file size limits (10MB per file)
            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            for (const entry of entries) {
                if (entry.header.size > MAX_FILE_SIZE) {
                    errors.push(`File ${entry.entryName} exceeds 10MB limit`);
                }
            }

            // Check for potentially dangerous files
            const dangerousExtensions = ['.exe', '.bat', '.sh', '.ps1', '.cmd'];
            for (const entry of entries) {
                const ext = path.extname(entry.entryName).toLowerCase();
                if (dangerousExtensions.includes(ext)) {
                    errors.push(`Potentially dangerous file type: ${entry.entryName}`);
                }
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        } catch (error) {
            errors.push(`Invalid zip file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                isValid: false,
                errors
            };
        }
    }

    /**
     * Read and validate manifest.json from extracted extension
     */
    async readManifest(extensionPath: string): Promise<ExtensionManifest> {
        const manifestPath = path.join(extensionPath, 'manifest.json');

        if (!await fs.pathExists(manifestPath)) {
            throw new Error('manifest.json not found');
        }

        try {
            const manifestContent = await fs.readJSON(manifestPath);
            return this.validateManifest(manifestContent);
        } catch (error) {
            throw new Error(`Invalid manifest.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate manifest.json structure
     */
    private validateManifest(manifest: any): ExtensionManifest {
        const required = ['name', 'version', 'description', 'author', 'main'];

        for (const field of required) {
            if (!manifest[field] || typeof manifest[field] !== 'string') {
                throw new Error(`Missing or invalid required field: ${field}`);
            }
        }

        // Validate version format (basic semver check)
        const versionRegex = /^\d+\.\d+\.\d+/;
        if (!versionRegex.test(manifest.version)) {
            throw new Error('Invalid version format. Use semantic versioning (e.g., 1.0.0)');
        }

        // Validate main file extension
        const validExtensions = ['.js', '.jsx', '.ts', '.tsx'];
        const mainExt = path.extname(manifest.main);
        if (!validExtensions.includes(mainExt)) {
            throw new Error('Main file must be a JavaScript or TypeScript file');
        }

        return {
            name: manifest.name,
            version: manifest.version,
            description: manifest.description,
            author: manifest.author,
            main: manifest.main,
            dependencies: manifest.dependencies || [],
            permissions: manifest.permissions || [],
            minAppVersion: manifest.minAppVersion,
            icon: manifest.icon,
            tags: manifest.tags || []
        };
    }

    /**
     * Cleanup failed extraction
     */
    async cleanup(extensionId: string): Promise<void> {
        const extractPath = path.join(this.extensionsDir, extensionId);
        await fs.remove(extractPath);
    }

    /**
     * Get the main file path for an extension
     */
    getMainFilePath(extensionPath: string, mainFile: string): string {
        return path.join(extensionPath, mainFile);
    }
}
