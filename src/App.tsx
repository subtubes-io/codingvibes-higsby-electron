import { useState } from 'react'
import TopNavigation from './components/TopNavigation'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'

function App() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [activeMenuItem, setActiveMenuItem] = useState('dashboard')

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed)
    }

    const handleMenuItemClick = (itemId: string) => {
        setActiveMenuItem(itemId)
    }

    return (
        <div className="w-screen h-screen m-0 p-0 bg-gray-50 overflow-hidden">
            <TopNavigation
                onToggleSidebar={toggleSidebar}
                title="CDV Electron"
            />

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                activeItem={activeMenuItem}
                onItemClick={handleMenuItemClick}
            />
            <MainContent
                isSidebarCollapsed={isSidebarCollapsed}
                activeSection={activeMenuItem}
            />
        </div>
    )
}

export default App
