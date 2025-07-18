declare module "virtual:__federation__" {
    export interface IRemoteConfig {
        url: string;
        format?: 'esm' | 'systemjs' | 'var';
        from?: 'vite' | 'webpack';
    }

    export function __federation_method_setRemote(name: string, config: IRemoteConfig): void;
    export function __federation_method_getRemote(name: string, expose: string): Promise<any>;
    export function __federation_method_unwrapDefault(module: any): Promise<any>;
    export function __federation_method_wrapDefault(module: any): Promise<any>;
    export function __federation_method_ensure(name: string): Promise<void>;
}
