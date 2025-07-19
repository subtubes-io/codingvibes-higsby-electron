# Debug Console Feature

This feature provides a dark-themed debug console that can be used to monitor application logs in real-time.

## Files

- `src/components/GraphView/DebugConsole/` - Debug console component
- `src/services/LoggingService.ts` - Logging service singleton

## Features

- **Collapsible console** - Click the header to expand/collapse
- **Color-coded logs** - Different colors for different log levels
- **Auto-scrolling** - Automatically scrolls to latest log entries
- **Copy functionality** - Copy all logs to clipboard
- **Clear functionality** - Clear all logs
- **Memory management** - Automatically limits to 1000 logs to prevent memory issues

## Log Types

- `debug` - Blue color, for debug information
- `info` - Green color, for informational messages
- `error` - Red color, for error messages
- `default` - White color, for general messages

## Usage

Import the logging service anywhere in your application:

```typescript
import loggingService from '../services/LoggingService';

// Log different types of messages
loggingService.debug('Debug message', { additionalData: 'value' });
loggingService.info('Information message');
loggingService.error('Error message', errorObject);
loggingService.log('General message');
```

## Integration

The DebugConsole component is automatically added to the GraphView and appears as a fixed element at the bottom of the screen. It starts collapsed and can be expanded by clicking on the header.

The console will automatically update with new log entries and maintain its position and scroll state.
