# ChatGPT Extension for Electron App

A comprehensive ChatGPT configuration and API integration extension built with TypeScript and React. This extension provides a user-friendly interface for configuring ChatGPT parameters and making API calls directly from within the application.

## Features

### 🎛️ Configuration Interface
- **System Prompt**: Configure the AI assistant's behavior and context
- **User Prompt**: Input area for questions and requests
- **Model Selection**: Dropdown for choosing between different GPT models:
  - gpt-3.5-turbo
  - gpt-3.5-turbo-16k
  - gpt-4
  - gpt-4-turbo-preview
  - gpt-4o
  - gpt-4o-mini
- **Temperature Slider**: Adjust creativity/randomness (0-2 range)
- **Max Tokens**: Control response length with input validation

### 🚀 API Integration
- **Node Function**: Server-side API calls to OpenAI
- **Environment Variable Support**: Secure API key handling via `OPENAI_API_KEY`
- **Error Handling**: Comprehensive error reporting and user feedback
- **Usage Tracking**: Token usage information display

### 🎨 User Experience
- **Modern UI**: Gradient background with glassmorphism effects
- **Real-time Feedback**: Loading states and response display
- **Form Validation**: Input validation and user guidance
- **Responsive Design**: Works on various screen sizes

## Setup Instructions

### 1. Environment Variables
Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

### 2. Install Dependencies
```bash
cd chatgpt-extension-ts
npm install
```

### 3. Build the Extension
```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Build and package as zip
npm run package
```

### 4. Load in Application
1. Build the extension using `npm run package`
2. Upload the generated `chatgpt-extension-ts.zip` file to your application
3. The extension will be available as a component

## Development

### Project Structure
```
chatgpt-extension-ts/
├── src/
│   └── index.tsx          # Main React component
├── scripts/
│   ├── build-and-package.js
│   └── bundle.js
├── dist/                  # Build output
├── manifest.json          # Extension metadata
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html            # Development testing
```

### Key Technologies
- **TypeScript**: Type-safe development
- **React**: Component-based UI
- **Vite**: Fast build tool with federation
- **Module Federation**: Dynamic loading capability
- **OpenAI API**: ChatGPT integration

### API Function

The extension exposes a `nodeFunction` that can be called with configuration:

```typescript
interface ChatGPTConfig {
    userPrompt: string;
    systemPrompt: string;
    temperature: number;
    model: string;
    maxTokens: number;
}

// Usage
const result = await ChatGPTExtension.nodeFunction(config);
```

### Response Format
```typescript
interface ChatGPTResponse {
    success: boolean;
    data?: any;
    error?: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
```

## Usage Tips

1. **System Prompt**: Use this to set the AI's personality and behavior
2. **Temperature**: 
   - Lower values (0-0.3): More focused and deterministic
   - Medium values (0.4-0.8): Balanced creativity
   - Higher values (0.9-2): More creative and random
3. **Max Tokens**: Remember that 1 token ≈ 0.75 words
4. **Model Selection**: Choose based on your needs:
   - gpt-3.5-turbo: Fast and cost-effective
   - gpt-4: More capable but slower and more expensive

## Security Notes

- API keys are handled securely through environment variables
- No API keys are stored in the extension code
- All API calls are made server-side through the node function

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY environment variable is not set"**
   - Ensure you've set the environment variable
   - Restart the application after setting the variable

2. **"Network Error"**
   - Check your internet connection
   - Verify API key is valid
   - Check OpenAI service status

3. **Build Errors**
   - Run `npm install` to ensure dependencies are installed
   - Clear dist folder and rebuild: `npm run clean && npm run build`

## License

MIT License - See LICENSE file for details
