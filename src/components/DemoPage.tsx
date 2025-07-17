import React, { useState } from 'react';
import reactLogo from '../assets/react.svg';
import electronLogo from '../assets/electron.svg';
import viteLogo from '/vite.svg';

const DemoPage: React.FC = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="p-0">
            <div className="mb-8">
                <h2 className="text-gray-800 text-3xl font-bold mb-2 m-0">Demo Page</h2>
                <p className="text-gray-600 text-lg m-0">Original Vite + React + Electron demo functionality</p>
            </div>

            <div className="text-center p-5">
                <div className="my-8">
                    <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" className="inline-block">
                        <img
                            src={viteLogo}
                            className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
                            alt="Vite logo"
                        />
                    </a>
                    <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="inline-block">
                        <img
                            src={reactLogo}
                            className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] motion-safe:animate-spin motion-safe:animation-duration-[20s] motion-safe:animation-iteration-count-infinite motion-safe:animation-timing-function-linear"
                            alt="React logo"
                        />
                    </a>
                    <a href="https://www.electronjs.org" target="_blank" rel="noopener noreferrer" className="inline-block">
                        <img
                            src={electronLogo}
                            className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#9feaf9aa]"
                            alt="Electron logo"
                        />
                    </a>
                </div>

                <h1 className="text-5xl leading-tight my-5 bg-gradient-to-br from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    Vite + React + Electron
                </h1>

                <div className="p-8 bg-gray-100 rounded-xl my-8 mx-auto max-w-md shadow-sm border border-gray-200">
                    <button
                        onClick={() => setCount((count) => count + 1)}
                        className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-none px-6 py-3 text-lg font-semibold rounded-lg cursor-pointer transition-all duration-200 mb-4 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.3)] border-transparent"
                    >
                        count is {count}
                    </button>
                    <p className="text-gray-600 m-0 leading-relaxed">
                        Edit <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">src/App.tsx</code> and save to test HMR
                    </p>
                </div>

                <p className="text-gray-500 my-5">
                    Click on the Vite, React, and Electron logos to learn more
                </p>

                <div className="bg-gray-100 rounded-xl p-8 my-10 mx-auto max-w-2xl text-left shadow-sm border border-gray-200">
                    <h3 className="text-gray-800 m-0 mb-5 text-xl text-center">Features Implemented:</h3>
                    <ul className="list-none p-0 m-0">
                        <li className="py-2 text-gray-700 text-lg leading-relaxed">✅ Collapsible sidebar navigation</li>
                        <li className="py-2 text-gray-700 text-lg leading-relaxed">✅ Top navigation bar with gradient design</li>
                        <li className="py-2 text-gray-700 text-lg leading-relaxed">✅ Multiple content sections (Dashboard, Projects, Tasks, etc.)</li>
                        <li className="py-2 text-gray-700 text-lg leading-relaxed">✅ Responsive design for mobile and desktop</li>
                        <li className="py-2 text-gray-700 text-lg leading-relaxed">✅ Modern UI with cards, buttons, and animations</li>
                        <li className="py-2 text-gray-700 text-lg leading-relaxed">✅ TypeScript for type safety</li>
                        <li className="py-2 text-gray-700 text-lg leading-relaxed">✅ Component-based architecture</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DemoPage;
