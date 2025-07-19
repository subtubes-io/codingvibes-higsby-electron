import React, { useState, useEffect, useRef } from 'react';
import loggingService, { LogEntry } from '../../../services/LoggingService';
import './DebugConsole.css';

const DebugConsole: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const consoleContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to logging service
    const unsubscribe = loggingService.subscribe((newLogs: LogEntry[]) => {
      setLogs(newLogs);
    });

    // Initialize with existing logs
    setLogs(loggingService.getLogs());

    return unsubscribe;
  }, []);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (consoleContentRef.current && !isCollapsed) {
      consoleContentRef.current.scrollTop = consoleContentRef.current.scrollHeight;
    }
  }, [logs, isCollapsed]);

  const handleToggle = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    loggingService.clear();
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    try {
      const text = loggingService.getLogsAsText();
      await navigator.clipboard.writeText(text);
      loggingService.info('Logs copied to clipboard');
    } catch (err) {
      loggingService.error('Failed to copy logs to clipboard', err);
    }
  };

  const formatLogMessage = (log: LogEntry): string => {
    let message = log.message;
    if (log.data) {
      try {
        const dataStr = typeof log.data === 'string'
          ? log.data
          : JSON.stringify(log.data, null, 2);
        message += ` ${dataStr}`;
      } catch (err) {
        message += ` [Complex Object]`;
      }
    }
    return message;
  };

  return (
    <div className={`debug-console ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="debug-console-header" onClick={handleToggle}>
        <h3 className="debug-console-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e57373" strokeWidth="2">
            <path d="M8 2v4"></path>
            <path d="M16 2v4"></path>
            <circle cx="12" cy="11" r="2"></circle>
            <path d="M12 19.5V16.5"></path>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
          </svg>
          Debug Console
          <span className="debug-console-toggle">▲</span>
        </h3>
        <div className="debug-console-actions">
          <button
            className="debug-console-btn"
            onClick={handleCopy}
            title="Copy logs to clipboard"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
          <button
            className="debug-console-btn"
            onClick={handleClear}
            title="Clear all logs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Clear
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="debug-console-content" ref={consoleContentRef}>
          {logs.length === 0 ? (
            <div className="debug-log-entry default">
              <span className="debug-log-message">No logs yet...</span>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`debug-log-entry ${log.type}`}>
                <span className="debug-log-timestamp">{log.timestamp}</span>
                <span className="debug-log-type">{log.type}</span>
                <span className="debug-log-message">{formatLogMessage(log)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DebugConsole;
