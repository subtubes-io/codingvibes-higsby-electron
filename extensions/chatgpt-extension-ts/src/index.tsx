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
        model: 'gpt-3.5-turbo',
        maxTokens: 150
    });

    const [response, setResponse] = (useState as any)(null);
    const [isLoading, setIsLoading] = (useState as any)(false);
    const [timestamp, setTimestamp] = (useState as any)('');

    const models = [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-4',
        'gpt-4-turbo-preview',
        'gpt-4o',
        'gpt-4o-mini'
    ];

    useEffect(() => {
        const now = new Date();
        setTimestamp(now.toLocaleString());
    }, []);

    const handleInputChange = (field: keyof ChatGPTConfig, value: string | number): void => {
        setConfig((prev: ChatGPTConfig) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (): Promise<void> => {
        if (!config.userPrompt.trim()) {
            setResponse({
                success: false,
                error: 'User prompt is required'
            });
            return;
        }

        setIsLoading(true);
        setResponse(null);

        try {
            const result = await ChatGPTExtension.nodeFunction(config);
            setResponse(result);
        } catch (error) {
            setResponse({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = (): void => {
        setConfig({
            userPrompt: '',
            systemPrompt: 'You are a helpful assistant.',
            temperature: 0.7,
            model: 'gpt-3.5-turbo',
            maxTokens: 150
        });
        setResponse(null);
    };

    // Styles
    const containerStyle: React.CSSProperties = {
        padding: '2rem',
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        color: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '0 8px 32px rgba(30, 64, 175, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '2.5rem',
        margin: '0 0 2rem 0',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
    };

    const formGroupStyle: React.CSSProperties = {
        marginBottom: '1.5rem'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '1.1rem',
        fontWeight: '600'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontSize: '1rem',
        backdropFilter: 'blur(10px)',
        boxSizing: 'border-box'
    };

    const textareaStyle: React.CSSProperties = {
        ...inputStyle,
        minHeight: '100px',
        resize: 'vertical'
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        cursor: 'pointer'
    };

    const sliderContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    };

    const sliderStyle: React.CSSProperties = {
        flex: 1,
        height: '6px',
        borderRadius: '3px',
        background: 'rgba(255, 255, 255, 0.3)',
        outline: 'none',
        cursor: 'pointer'
    };

    const buttonStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
        padding: '12px 24px',
        margin: '0.5rem',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
    };

    const disabledButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        opacity: 0.5,
        cursor: 'not-allowed'
    };

    const responseBoxStyle: React.CSSProperties = {
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxHeight: '400px',
        overflowY: 'auto'
    };

    const infoBoxStyle: React.CSSProperties = {
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center'
    };

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>🤖 ChatGPT Configuration</h1>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                            <option key={model} value={model} style={{ background: '#1e40af', color: 'white' }}>
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
                    <small style={{ opacity: 0.8, fontSize: '0.85rem' }}>
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
                    <small style={{ opacity: 0.8, fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
                        Approximate: 1 token ≈ 0.75 words
                    </small>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        type="submit"
                        style={isLoading ? disabledButtonStyle : buttonStyle}
                        disabled={isLoading}
                    >
                        {isLoading ? '🔄 Processing...' : '🚀 Send to ChatGPT'}
                    </button>
                    <button
                        type="button"
                        style={buttonStyle}
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        🧹 Clear Form
                    </button>
                </div>
            </form>

            {response && (
                <div style={responseBoxStyle}>
                    <h3 style={{ marginTop: 0, color: response.success ? '#4ade80' : '#f87171' }}>
                        {response.success ? '✅ Response' : '❌ Error'}
                    </h3>

                    {response.success ? (
                        <div>
                            <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                {response.data?.choices?.[0]?.message?.content || 'No content received'}
                            </div>

                            {response.usage && (
                                <div style={{
                                    fontSize: '0.85rem',
                                    opacity: 0.8,
                                    borderTop: '1px solid rgba(255,255,255,0.2)',
                                    paddingTop: '0.5rem'
                                }}>
                                    <strong>Usage:</strong> {response.usage.prompt_tokens} prompt + {response.usage.completion_tokens} completion = {response.usage.total_tokens} total tokens
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ color: '#f87171' }}>
                            {response.error}
                        </div>
                    )}
                </div>
            )}

            <div style={infoBoxStyle}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <strong>🔧 Extension Info:</strong><br />
                    ChatGPT API Integration with TypeScript + React
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                    <strong>⏰ Loaded At:</strong><br />
                    {timestamp}
                </div>

                <div>
                    <strong>🔑 API Status:</strong><br />
                    <span style={{ color: '#4ade80' }}>
                        Ready to use with OPENAI_API_KEY environment variable
                    </span>
                </div>
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
