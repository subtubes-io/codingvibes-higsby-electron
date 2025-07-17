/**
 * Dynamic Import Utility
 * Handles dynamic loading of React components with error boundaries
 */

import React, { Suspense, ComponentType } from 'react';

/**
 * Dynamically import a React component with lazy loading
 */
export const createDynamicComponent = (
    importFn: () => Promise<{ default: ComponentType<any> }>
): ComponentType<any> => {
    return React.lazy(importFn);
};

/**
 * Higher-order component that wraps dynamic components with error boundary and suspense
 */
export const withDynamicLoading = <P extends object>(
    Component: ComponentType<P>,
    fallback?: React.ReactNode,
    errorFallback?: React.ReactNode
) => {
    return React.forwardRef<any, P>((props, ref) =>
        React.createElement(DynamicComponentWrapper, {
            component: Component,
            componentProps: props,
            fallback: fallback,
            errorFallback: errorFallback,
            ref: ref
        })
    );
};

interface DynamicComponentWrapperProps {
    component: ComponentType<any>;
    componentProps: any;
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
}

const DynamicComponentWrapper = React.forwardRef<any, DynamicComponentWrapperProps>(
    ({ component: Component, componentProps, fallback, errorFallback }, ref) => {
        const defaultFallback = React.createElement('div',
            { className: 'dynamic-component-loading' },
            React.createElement('div', { className: 'loading-spinner' }),
            React.createElement('span', null, 'Loading extension...')
        );

        const defaultErrorFallback = React.createElement('div',
            { className: 'dynamic-component-error' },
            React.createElement('span', null, 'Failed to load extension component')
        );

        return React.createElement(DynamicErrorBoundary,
            {
                fallback: errorFallback || defaultErrorFallback,
                children: React.createElement(Suspense,
                    { fallback: fallback || defaultFallback },
                    React.createElement(Component, { ...componentProps, ref })
                )
            }
        );
    }
);

DynamicComponentWrapper.displayName = 'DynamicComponentWrapper';

/**
 * Error boundary specifically for dynamic components
 */
interface DynamicErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class DynamicErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    DynamicErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): DynamicErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Dynamic component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

/**
 * Create a safe wrapper for potentially unsafe dynamic components
 */
export const createSafeComponent = (
    component: ComponentType<any>,
    extensionId: string
): ComponentType<any> => {
    const SafeComponent = (props: any) => {
        try {
            return React.createElement(component, {
                ...props,
                // Pass extension context
                extensionId,
                // Add safety props
                __extensionContext: {
                    id: extensionId,
                    sandboxed: true
                }
            });
        } catch (error) {
            console.error(`Error rendering extension ${extensionId}:`, error);
            return React.createElement('div',
                { className: 'extension-render-error' },
                React.createElement('h3', null, 'Extension Error'),
                React.createElement('p', null, `Failed to render extension component: ${extensionId}`),
                React.createElement('pre', null, error instanceof Error ? error.message : 'Unknown error')
            );
        }
    };

    SafeComponent.displayName = `SafeExtension_${extensionId}`;
    return SafeComponent;
};

/**
 * Validate that an imported module is a valid React component
 */
export const validateComponent = (module: any, extensionId: string): ComponentType<any> => {
    const component = module.default || module;

    if (typeof component !== 'function') {
        throw new Error(`Extension ${extensionId} does not export a valid React component`);
    }

    // Additional validation could be added here
    // e.g., checking for required props, validating component structure, etc.

    return component;
};

/**
 * Preload a dynamic component (useful for better UX)
 */
export const preloadComponent = async (
    importFn: () => Promise<{ default: ComponentType<any> }>
): Promise<ComponentType<any>> => {
    try {
        const module = await importFn();
        return module.default;
    } catch (error) {
        console.error('Failed to preload component:', error);
        throw error;
    }
};
