// Sample Counter Extension
// This is a demonstration extension for the Higsby extension system

const React = window.React;

const CounterExtension = () => {
  const [count, setCount] = React.useState(0);
  const [theme, setTheme] = React.useState('primary');

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  const themeStyles = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    success: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white'
    },
    warning: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white'
    }
  };

  const containerStyle = {
    padding: '2rem',
    textAlign: 'center',
    borderRadius: '12px',
    maxWidth: '400px',
    margin: '0 auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    ...themeStyles[theme]
  };

  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    margin: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  };

  const countStyle = {
    fontSize: '4rem',
    fontWeight: 'bold',
    margin: '1rem 0',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
  };

  const selectStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: '#333',
    padding: '0.5rem 1rem',
    margin: '1rem',
    borderRadius: '6px',
    fontSize: '0.875rem'
  };

  return React.createElement('div', { style: containerStyle },
    React.createElement('h2', { style: { margin: '0 0 1rem 0' } }, 'Counter Extension'),
    React.createElement('p', { style: { margin: '0 0 2rem 0', opacity: 0.9 } }, 
      'This is a sample extension demonstrating React components in the extension system.'
    ),
    
    React.createElement('div', { style: countStyle }, count),
    
    React.createElement('div', { style: { margin: '2rem 0' } },
      React.createElement('button', {
        style: buttonStyle,
        onClick: decrement,
        onMouseOver: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)',
        onMouseOut: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'
      }, '- Decrease'),
      
      React.createElement('button', {
        style: { ...buttonStyle, background: 'rgba(255, 255, 255, 0.3)' },
        onClick: reset,
        onMouseOver: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.4)',
        onMouseOut: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'
      }, 'Reset'),
      
      React.createElement('button', {
        style: buttonStyle,
        onClick: increment,
        onMouseOver: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)',
        onMouseOut: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'
      }, '+ Increase')
    ),
    
    React.createElement('div', { style: { marginTop: '2rem' } },
      React.createElement('label', { style: { display: 'block', marginBottom: '0.5rem' } }, 'Theme:'),
      React.createElement('select', {
        style: selectStyle,
        value: theme,
        onChange: (e) => setTheme(e.target.value)
      },
        React.createElement('option', { value: 'primary' }, 'Primary'),
        React.createElement('option', { value: 'success' }, 'Ocean'),
        React.createElement('option', { value: 'warning' }, 'Sunset')
      )
    ),
    
    React.createElement('div', { 
      style: { 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: '8px',
        fontSize: '0.875rem'
      } 
    },
      React.createElement('strong', null, 'Extension Info:'),
      React.createElement('br'),
      'Name: Sample Counter Extension',
      React.createElement('br'),
      'Version: 1.0.0',
      React.createElement('br'),
      'Clicks: ', count
    )
  );
};

// Export the component for the extension system
const module = { exports: {} };
module.exports = CounterExtension;

// Also provide as default export for ES6 compatibility
if (typeof exports !== 'undefined') {
  exports.default = CounterExtension;
}

// Make it available globally for dynamic loading
if (typeof window !== 'undefined') {
  window.CounterExtension = CounterExtension;
}
