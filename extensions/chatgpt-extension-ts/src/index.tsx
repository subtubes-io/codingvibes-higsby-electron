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

// OpenAI Configuration Interface
interface ChatGPTConfig {
    userPrompt: string;
    systemPrompt: string;
    temperature: number;
    model: string;
    maxTokens: number;
}

// API Response Interface
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

// Define the interface for the component with static function
interface ChatGPTExtensionComponent extends React.FC {
    nodeFunction: (config: ChatGPTConfig) => Promise<ChatGPTResponse>;
}

const ChatGPTExtension: ChatGPTExtensionComponent = () => {
    const [config, setConfig] = (useState as any)({
        userPrompt: '',
        systemPrompt: 'You are a helpful assistant.',
        temperature: 0.7,
        model: 'gpt-4o',
        maxTokens: 1400
    });


    const models = [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-4',
        'gpt-4-turbo-preview',
        'gpt-4o',
        'gpt-4o-mini'
    ];

    const handleInputChange = (field: keyof ChatGPTConfig, value: string | number): void => {
        setConfig((prev: ChatGPTConfig) => ({
            ...prev,
            [field]: value
        }));
    };

    // Styles - Made responsive
    const containerStyle: React.CSSProperties = {
        padding: '1rem',
        color: '#1f2937',
        borderRadius: '8px',
        height: '100%',
        width: '100%',
        margin: '0',
        border: '1px solid #e5e7eb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: 'border-box',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '2.5rem',
        margin: '0 0 2rem 0',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
    };

    const formGroupStyle: React.CSSProperties = {
        marginBottom: '0.75rem',
        flex: '0 0 auto'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.25rem',
        fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
        fontWeight: '600'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: 'clamp(0.4rem, 1.5vw, 0.6rem)',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        background: '#ffffff',
        color: '#1f2937',
        fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
        boxSizing: 'border-box'
    };

    const textareaStyle: React.CSSProperties = {
        ...inputStyle,
        minHeight: 'clamp(60px, 15vh, 80px)',
        resize: 'vertical'
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        cursor: 'pointer'
    };

    const sliderContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(0.5rem, 2vw, 0.75rem)',
        fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)'
    };

    const sliderStyle: React.CSSProperties = {
        flex: 1,
        height: '4px',
        borderRadius: '2px',
        background: '#e5e7eb',
        outline: 'none',
        cursor: 'pointer'
    };



    return (
        <div style={containerStyle}>

            <div style={formGroupStyle}>
                <label style={labelStyle}>System Prompt:</label>
                <textarea
                    style={textareaStyle}
                    value={config.systemPrompt}
                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                    placeholder="Set the behavior and context for the AI assistant..."
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>User Prompt:</label>
                <textarea
                    style={textareaStyle}
                    value={config.userPrompt}
                    onChange={(e) => handleInputChange('userPrompt', e.target.value)}
                    placeholder="Enter your question or request here..."
                    required
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Model:</label>
                <select
                    style={selectStyle}
                    value={config.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                >
                    {models.map(model => (
                        <option key={model} value={model} style={{ background: '#ffffff', color: '#1f2937' }}>
                            {model}
                        </option>
                    ))}
                </select>
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>
                    Temperature: {config.temperature}
                </label>
                <div style={sliderContainerStyle}>
                    <span>0</span>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                        style={sliderStyle}
                    />
                    <span>2</span>
                </div>
                <small style={{ opacity: 0.8, fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)' }}>
                    Higher values make output more random, lower values more focused
                </small>
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Max Tokens:</label>
                <input
                    type="number"
                    style={inputStyle}
                    value={config.maxTokens}
                    onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value) || 150)}
                    min="1"
                    max="4000"
                    placeholder="Maximum response length (tokens)"
                />
                <small style={{ opacity: 0.8, fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', display: 'block', marginTop: '0.25rem' }}>
                    Approximate: 1 token ≈ 0.75 words
                </small>
            </div>

        </div>
    );
};

// Add static function that can be accessed before component is used
// This function will make the actual API call to ChatGPT
ChatGPTExtension.nodeFunction = async (config: ChatGPTConfig): Promise<ChatGPTResponse> => {
    console.log("ChatGPTExtension nodeFunction called with config:", config);

    try {
        // Get the API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return {
                success: false,
                error: 'OPENAI_API_KEY environment variable is not set'
            };
        }

        // Prepare the request payload
        const requestBody = {
            model: config.model,
            messages: [
                {
                    role: 'system',
                    content: config.systemPrompt
                },
                {
                    role: 'user',
                    content: config.userPrompt
                }
            ],
            temperature: config.temperature,
            max_tokens: config.maxTokens
        };

        console.log("Making OpenAI API request:", requestBody);

        // Make the API call to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: `OpenAI API Error (${response.status}): ${errorData.error?.message || response.statusText}`
            };
        }

        const data = await response.json();

        console.log("OpenAI API response:", data);

        return {
            success: true,
            data: data,
            usage: data.usage
        };

    } catch (error) {
        console.error("Error in ChatGPT nodeFunction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export default ChatGPTExtension;
