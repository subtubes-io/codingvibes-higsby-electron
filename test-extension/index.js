import React, { useState } from 'react';

const HelloWorldExtension = () => {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('Hello from HTTP Extension!');

    return React.createElement('div', {
        style: { 
            padding: '20px', 
            border: '2px solid #667eea', 
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
        }
    }, [
        React.createElement('h2', { key: 'title' }, '🌟 Hello World Extension'),
        React.createElement('p', { key: 'subtitle' }, 'This extension was loaded dynamically via HTTP!'),
        React.createElement('div', { 
            key: 'message', 
            style: { margin: '20px 0', fontSize: '18px', fontWeight: 'bold' } 
        }, message),
        React.createElement('div', { key: 'counter', style: { margin: '20px 0' } }, [
            React.createElement('button', {
                key: 'count-btn',
                onClick: () => setCount(count + 1),
                style: {
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                }
            }, `Count: ${count}`),
            React.createElement('button', {
                key: 'reset-btn',
                onClick: () => {
                    setCount(0);
                    setMessage('Reset! 🎉');
                    setTimeout(() => setMessage('Hello from HTTP Extension!'), 2000);
                },
                style: {
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }
            }, 'Reset')
        ]),
        React.createElement('p', { 
            key: 'footer', 
            style: { fontSize: '14px', opacity: 0.8, marginTop: '20px' } 
        }, [
            React.createElement('strong', { key: 'tech' }, 'Tech: '),
            'React + HTTP Federation + Electron',
            React.createElement('br', { key: 'br' }),
            React.createElement('strong', { key: 'status' }, 'Status: '),
            '✅ Successfully Loaded!'
        ])
    ]);
};

export default HelloWorldExtension;
