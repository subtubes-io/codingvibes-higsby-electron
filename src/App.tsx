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
        <div className="w-screen h-screen m-0 p-0 bg-primary-gradient overflow-hidden">
            <TopNavigation
                onToggleSidebar={toggleSidebar}
                title="Higsby"
            />

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                activeItem={activeMenuItem}
                onItemClick={handleMenuItemClick}
                onToggleSidebar={toggleSidebar}
            />
            <MainContent
                isSidebarCollapsed={isSidebarCollapsed}
                activeSection={activeMenuItem}
            />
        </div>
    )
}

export default App
