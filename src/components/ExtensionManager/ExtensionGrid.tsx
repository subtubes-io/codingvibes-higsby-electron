/**
 * ExtensionGrid Component
 * Grid layout for displaying extensions
 */

import React from 'react';
import { ExtensionCard } from './ExtensionCard';
import { ExtensionManifest } from '../../services/extensionService';

interface ExtensionGridProps {
    extensions: ExtensionManifest[];
    onToggle: (extension: ExtensionManifest) => void;
    onDelete: (extension: ExtensionManifest) => void;
}

export const ExtensionGrid: React.FC<ExtensionGridProps> = ({
    extensions,
    onToggle,
    onDelete
}) => {
    return (
        <div className="extension-grid">
            {extensions.map(extension => (
                <ExtensionCard
                    key={extension.id}
                    extension={extension}
                    onToggle={() => onToggle(extension)}
                    onDelete={() => onDelete(extension)}
                />
            ))}
        </div>
    );
};
