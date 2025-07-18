import React from 'react';
import { ExtensionManifest } from '../../../types/extension';

// Add interface for extension components
interface ExtensionComponent extends React.FC {
    nodeFunction?: (params: any) => any;
}

interface NodeContentProps {
    plugin?: ExtensionManifest;
    loadedExtensions: Record<string, ExtensionComponent>;
}

const NodeContent: React.FC<NodeContentProps> = ({
    plugin,
    loadedExtensions
}) => {
    if (plugin && loadedExtensions[plugin.componentName]) {
        return (
            <div className="extension-container">
                {React.createElement(loadedExtensions[plugin.componentName])}
            </div>
        );
    }

    if (plugin) {
        return (
            <div className="extension-loading">
                <div>Loading {plugin.name}...</div>
                <div className="plugin-info">
                    <small>v{plugin.version} by {plugin.author}</small>
                </div>
                {plugin.description && (
                    <div className="plugin-description">
                        {plugin.description}
                    </div>
                )}

            </div>

        );
    }

    return (
        <div className="node-plugin-info">
            <div>No plugin data available</div>
        </div>
    );
};

export default NodeContent;
