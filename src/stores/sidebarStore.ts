import { proxy } from 'valtio';

export interface SidebarState {
    plugins: boolean;
    graphs: boolean;
    main: boolean;
}

// Create the store with Valtio proxy
export const sidebarStore = proxy<SidebarState>({
    plugins: false,
    graphs: false,
    main: false,
});

// Store actions as separate functions
export const sidebarActions = {
    toggleSidebar: (sidebar: keyof SidebarState) => {
        sidebarStore[sidebar] = !sidebarStore[sidebar];
    },

    openSidebar: (sidebar: keyof SidebarState) => {
        sidebarStore[sidebar] = true;
    },

    closeSidebar: (sidebar: keyof SidebarState) => {
        sidebarStore[sidebar] = false;
    },

    closeAll: () => {
        sidebarStore.plugins = false;
        sidebarStore.graphs = false;
        sidebarStore.main = false;
    },

    openAll: () => {
        sidebarStore.plugins = true;
        sidebarStore.graphs = true;
        sidebarStore.main = true;
    },

    isAnySidebarOpen: (): boolean => {
        return Object.values(sidebarStore).some(isOpen => isOpen);
    }
};
