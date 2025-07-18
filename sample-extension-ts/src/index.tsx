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

// Define the interface for the component with static function
interface HelloWorldExtensionComponent extends React.FC {
    nodeFunction: () => any;
}

const HelloWorldExtension: HelloWorldExtensionComponent = () => {
    const [greeting, setGreeting] = useState('Hello, World!');
    const [timestamp, setTimestamp] = useState('');
    const [clickCount, setClickCount] = useState(0);

    useEffect(() => {
        const now = new Date();
        setTimestamp(now.toLocaleString());
    }, []);

    const handleGreetingChange = (): void => {
        const greetings = [
            'Hello, World! 👋',
            'Hello from TypeScript! 🎯',
            'Greetings from the Extension! 🚀',
            'TypeScript + React = ❤️',
            'Dynamic Loading Success! ✨'
        ];

        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setGreeting(randomGreeting);
        setClickCount((prev: number) => prev + 1);
    };

    const containerStyle: React.CSSProperties = {
        padding: '2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        margin: '0 auto',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '2.5rem',
        margin: '0 0 1rem 0',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
    };

    const greetingStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        margin: '1.5rem 0',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    };

    const buttonStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
        padding: '12px 24px',
        margin: '1rem',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
    };

    const infoBoxStyle: React.CSSProperties = {
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    };

    const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
    };

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>🎉 Hello World Extension</h1>

            <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9 }}>
                Built with TypeScript + React + Webpack
            </p>

            <div style={greetingStyle}>
                {greeting}
            </div>

            <button
                style={buttonStyle}
                onClick={handleGreetingChange}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                type="button"
            >
                Change Greeting
            </button>

            <div style={infoBoxStyle}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <strong>🔧 Tech Stack:</strong><br />
                    TypeScript + React + Webpack + UMD
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                    <strong>⏰ Loaded At:</strong><br />
                    {timestamp}
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                    <strong>👆 Interactions:</strong><br />
                    {clickCount} clicks
                </div>

                <div>
                    <strong>🚀 Status:</strong><br />
                    <span style={{ color: '#4ade80' }}>✅ Successfully Loaded!</span>
                </div>
            </div>
        </div>
    );
};

// Add static function that can be accessed before component is used
HelloWorldExtension.nodeFunction = () => {
    console.log("HelloWorldExtension nodeFunction called");
    return {
        name: "hello-world-extension",
        version: "1.0.0",
        capabilities: ["greeting", "interaction-counter"],
        initialize: () => {
            console.log("HelloWorldExtension initialized");
        },
        cleanup: () => {
            console.log("HelloWorldExtension cleanup");
        }
    };
};

export default HelloWorldExtension;
