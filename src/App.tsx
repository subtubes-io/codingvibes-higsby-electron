import { useState } from 'react'
import { useSnapshot } from 'valtio'
import TopNavigation from './components/TopNavigation'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import { sidebarStore, sidebarActions } from './stores/sidebarStore'

function App() {
    const [activeMenuItem, setActiveMenuItem] = useState('dashboard')
    const sidebars = useSnapshot(sidebarStore)

    const handleMenuItemClick = (itemId: string) => {
        setActiveMenuItem(itemId)
    }

    return (
        <div className="w-screen h-screen m-0 p-0 bg-primary-gradient overflow-hidden">
            <TopNavigation
                onToggleSidebar={() => sidebarActions.toggleSidebar('main')}
                title="Higsby"
            />

            <Sidebar
                activeItem={activeMenuItem}
                onItemClick={handleMenuItemClick}
            />
            <MainContent
                isSidebarCollapsed={!sidebars.main}
                activeSection={activeMenuItem}
            />
        </div>
    )
}

export default App
