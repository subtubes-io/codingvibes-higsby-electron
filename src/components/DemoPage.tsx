import React, { useState } from 'react';
import reactLogo from '../assets/react.svg';
import electronLogo from '../assets/electron.svg';
import viteLogo from '/vite.svg';
import './DemoPage.css';

const DemoPage: React.FC = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="demo-page">
            <div className="demo-header">
                <h2>Demo Page</h2>
                <p>Original Vite + React + Electron demo functionality</p>
            </div>

            <div className="demo-content">
                <div className="logos-section">
                    <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
                        <img src={viteLogo} className="logo" alt="Vite logo" />
                    </a>
                    <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                        <img src={reactLogo} className="logo react" alt="React logo" />
                    </a>
                    <a href="https://www.electronjs.org" target="_blank" rel="noopener noreferrer">
                        <img src={electronLogo} className="logo electron" alt="Electron logo" />
                    </a>
                </div>

                <h1>Vite + React + Electron</h1>

                <div className="card">
                    <button onClick={() => setCount((count) => count + 1)}>
                        count is {count}
                    </button>
                    <p>
                        Edit <code>src/App.tsx</code> and save to test HMR
                    </p>
                </div>

                <p className="read-the-docs">
                    Click on the Vite, React, and Electron logos to learn more
                </p>

                <div className="feature-showcase">
                    <h3>Features Implemented:</h3>
                    <ul>
                        <li>✅ Collapsible sidebar navigation</li>
                        <li>✅ Top navigation bar with gradient design</li>
                        <li>✅ Multiple content sections (Dashboard, Projects, Tasks, etc.)</li>
                        <li>✅ Responsive design for mobile and desktop</li>
                        <li>✅ Modern UI with cards, buttons, and animations</li>
                        <li>✅ TypeScript for type safety</li>
                        <li>✅ Component-based architecture</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DemoPage;
