// Get React from global scope (provided by host app)
declare global {
    interface Window {
        React: any;
        ReactDOM: any;
    }
}

// Use React from host app instead of importing
const React = window.React || (globalThis as any).React;
const { useState, useEffect } = React;

// Console Log Entry Interface
interface LogEntry {
    id: number;
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
}

// Console Configuration Interface
interface ConsoleConfig {
    maxEntries: number;
    showTimestamps: boolean;
    autoScroll: boolean;
}

// API Response Interface
interface ConsoleResponse {
    success: boolean;
    data?: any;
    error?: string;
}

// Define the interface for the component with static function
interface ConsoleExtensionComponent extends React.FC {
    nodeFunction?: (config: ConsoleConfig) => Promise<ConsoleResponse>;
}

const ConsoleExtension: ConsoleExtensionComponent = () => {
    const [logs, setLogs] = (useState as any)([
        {
            id: 1,
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: 'Console extension initialized'
        },
        {
            id: 2,
            timestamp: new Date().toLocaleTimeString(),
            level: 'debug',
            message: 'Debug mode enabled'
        },
        {
            id: 3,
            timestamp: new Date().toLocaleTimeString(),
            level: 'warn',
            message: 'This is a warning message'
        }
    ] as LogEntry[]);

    const [config, setConfig] = (useState as any)({
        maxEntries: 100,
        showTimestamps: true,
        autoScroll: true
    } as ConsoleConfig);

    // Styles following the simple, clean approach
    const containerStyle: React.CSSProperties = {
        padding: '2rem',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    };

    const headerStyle: React.CSSProperties = {
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        fontWeight: '600',
        margin: '0 0 0.5rem 0',
        color: '#1f2937'
    };

    const subtitleStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        color: '#6b7280',
        margin: 0
    };

    const consoleContainerStyle: React.CSSProperties = {
        flex: 1,
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        overflow: 'auto',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: '0.875rem',
        lineHeight: '1.5',
        minHeight: '200px',
        maxHeight: '300px'
    };

    const logEntryStyle = (level: string): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            padding: '0.25rem 0',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
        };

        const levelColors: Record<string, string> = {
            info: '#3b82f6',
            warn: '#f59e0b', 
            error: '#ef4444',
            debug: '#6b7280'
        };

        return {
            ...baseStyle,
            color: levelColors[level] || '#1f2937'
        };
    };

    const timestampStyle: React.CSSProperties = {
        color: '#9ca3af',
        fontSize: '0.75rem',
        minWidth: '80px',
        fontWeight: '500'
    };

    const levelBadgeStyle = (level: string): React.CSSProperties => {
        const levelStyles: Record<string, { bg: string; color: string }> = {
            info: { bg: '#dbeafe', color: '#1e40af' },
            warn: { bg: '#fef3c7', color: '#92400e' },
            error: { bg: '#fee2e2', color: '#991b1b' },
            debug: { bg: '#f3f4f6', color: '#374151' }
        };

        const style = levelStyles[level] || levelStyles.info;

        return {
            background: style.bg,
            color: style.color,
            padding: '0.125rem 0.5rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            minWidth: '50px',
            textAlign: 'center'
        };
    };

    const messageStyle: React.CSSProperties = {
        flex: 1,
        wordBreak: 'break-word'
    };

    const controlsStyle: React.CSSProperties = {
        marginTop: '1rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
    };

    const buttonStyle: React.CSSProperties = {
        padding: '0.5rem 1rem',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
    };

    const clearButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#ef4444'
    };

    // Add a new log entry
    const addLog = (level: LogEntry['level'], message: string) => {
        const newLog: LogEntry = {
            id: logs.length + 1,
            timestamp: new Date().toLocaleTimeString(),
            level,
            message
        };

        setLogs((prevLogs: LogEntry[]) => {
            const updatedLogs = [...prevLogs, newLog];
            // Keep only the last maxEntries
            if (updatedLogs.length > config.maxEntries) {
                return updatedLogs.slice(-config.maxEntries);
            }
            return updatedLogs;
        });
    };

    // Clear all logs
    const clearLogs = () => {
        setLogs([]);
    };

    // Sample actions
    const addInfoLog = () => addLog('info', `Info message at ${new Date().toLocaleTimeString()}`);
    const addWarningLog = () => addLog('warn', 'This is a warning message');
    const addErrorLog = () => addLog('error', 'An error has occurred');
    const addDebugLog = () => addLog('debug', `Debug info: ${Math.random().toString(36).substr(2, 9)}`);

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={titleStyle}>Console Output</h2>
                <p style={subtitleStyle}>System logs and debugging information</p>
            </div>

            <div style={consoleContainerStyle}>
                {logs.length === 0 ? (
                    <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                        No log entries yet
                    </div>
                ) : (
                    logs.map((log: LogEntry) => (
                        <div key={log.id} style={logEntryStyle(log.level)}>
                            {config.showTimestamps && (
                                <span style={timestampStyle}>{log.timestamp}</span>
                            )}
                            <span style={levelBadgeStyle(log.level)}>{log.level}</span>
                            <span style={messageStyle}>{log.message}</span>
                        </div>
                    ))
                )}
            </div>

            <div style={controlsStyle}>
                <button onClick={addInfoLog} style={buttonStyle}>
                    Add Info
                </button>
                <button onClick={addWarningLog} style={{ ...buttonStyle, backgroundColor: '#f59e0b' }}>
                    Add Warning
                </button>
                <button onClick={addErrorLog} style={{ ...buttonStyle, backgroundColor: '#ef4444' }}>
                    Add Error
                </button>
                <button onClick={addDebugLog} style={{ ...buttonStyle, backgroundColor: '#6b7280' }}>
                    Add Debug
                </button>
                <button onClick={clearLogs} style={clearButtonStyle}>
                    Clear All
                </button>
            </div>
        </div>
    );
};

// Add static function for server-side operations (optional)
ConsoleExtension.nodeFunction = async (config: ConsoleConfig): Promise<ConsoleResponse> => {
    console.log("ConsoleExtension nodeFunction called with config:", config);

    try {
        // Example server-side operation - could be used for log management
        return {
            success: true,
            data: {
                message: "Console configuration updated",
                config: config,
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error("Error in Console nodeFunction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export default ConsoleExtension;
