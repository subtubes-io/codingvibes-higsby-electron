import React from 'react';
import './GraphControls.css';

interface GraphControlsProps {
    isPlaying: boolean;
    zoom: number;
    onPlay: () => void;
    onPause: () => void;
    onClearGraph: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomToFit: () => void;
    onImportGraph: () => void;
    onExportGraph: () => void;
    // Graph management props
    onSaveCurrentGraph: () => void;
    onSaveAsGraph?: () => void;
    onNewGraph?: () => void;
    currentGraphId?: string;
}

const GraphControls: React.FC<GraphControlsProps> = ({
    isPlaying,
    zoom,
    onPlay,
    onPause,
    onClearGraph,
    onZoomIn,
    onZoomOut,
    onZoomToFit,
    onImportGraph,
    onExportGraph,
    onSaveCurrentGraph,
    onSaveAsGraph,
    onNewGraph,
    currentGraphId
}) => {
    return (
        <div className="graph-controls">
            {/* Graph Management Section */}
            <div className="graph-controls-section">
                <button
                    className="graph-control-button graph-save-button"
                    onClick={onSaveCurrentGraph}
                    title={currentGraphId ? "Save Changes" : "Save Graph"}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17,21 17,13 7,13 7,21"></polyline>
                        <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    <span>{currentGraphId ? 'Save' : 'Save'}</span>
                </button>
                {onSaveAsGraph && (
                    <button
                        className="graph-control-button graph-save-button"
                        onClick={onSaveAsGraph}
                        title="Save As New Graph"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17,21 17,13 7,13 7,21"></polyline>
                            <polyline points="7,3 7,8 15,8"></polyline>
                            <line x1="12" y1="9" x2="12" y2="15"></line>
                            <line x1="9" y1="12" x2="15" y2="12"></line>
                        </svg>
                        <span>Save As</span>
                    </button>
                )}
                {onNewGraph && (
                    <button
                        className="graph-control-button graph-save-button"
                        onClick={onNewGraph}
                        title="Create New Graph (saves current graph automatically)"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        <span>New</span>
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="graph-controls-divider"></div>

            {/* Execution Controls Section */}
            <div className="graph-controls-section">
                <button
                    className={`graph-control-button ${isPlaying ? 'active' : ''}`}
                    title={isPlaying ? "Pause Execution" : "Play/Execute All Functions"}
                    onClick={isPlaying ? onPause : onPlay}
                >
                    {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="5,3 19,12 5,21"></polygon>
                        </svg>
                    )}
                </button>

                <button
                    className="graph-control-button"
                    title="Clear Graph"
                    onClick={onClearGraph}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>

            {/* Divider */}
            <div className="graph-controls-divider"></div>

            {/* View Controls Section */}
            <div className="graph-controls-section">
                <button className="graph-control-button" title="Center View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="m12 1 1.2 2.2L16 2l.8 1.6 2.2-1.2v2.4l2.2 1.2L20 8l1.6.8L20 11.2V16l-1.6.8L20 19.2l-2.2 1.2L16 22l-.8-1.6L12 23l-1.2-2.2L8 22l-.8-1.6L5 21.2V16l-2.2-1.2L4 12l-1.6-.8L4 8.8V4l2.2-1.2L8 2l.8 1.6z"></path>
                    </svg>
                </button>

                <button className="graph-control-button" title="Zoom to Fit" onClick={onZoomToFit}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                        <path d="M11 6v10"></path>
                        <path d="M6 11h10"></path>
                    </svg>
                </button>

                <button className="graph-control-button" title="Zoom In" onClick={onZoomIn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                        <path d="M11 6v10"></path>
                        <path d="M6 11h10"></path>
                    </svg>
                </button>

                <button className="graph-control-button" title="Zoom Out" onClick={onZoomOut}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                        <path d="M6 11h10"></path>
                    </svg>
                </button>

                <div className="zoom-indicator" title={`Zoom: ${Math.round(zoom * 100)}%`}>
                    {Math.round(zoom * 100)}%
                </div>
            </div>

            {/* Divider */}
            <div className="graph-controls-divider"></div>

            {/* File Operations Section */}
            <div className="graph-controls-section">
                <button className="graph-control-button" title="Import Graph" onClick={onImportGraph}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17,8 12,3 7,8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                </button>

                <button className="graph-control-button" title="Export Graph" onClick={onExportGraph}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default GraphControls;
