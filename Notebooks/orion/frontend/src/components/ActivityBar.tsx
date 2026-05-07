import { FolderTree, Bot, ScrollText, History, Terminal, MessageSquare } from 'lucide-react'
import useStore from '../store/useStore'

const navItems = [
  { view: 'files' as const, icon: FolderTree, label: 'Explorer' },
  { view: 'agent' as const, icon: Bot, label: 'Agent' },
  { view: 'rules' as const, icon: ScrollText, label: 'Rules' },
  { view: 'timetravel' as const, icon: History, label: 'Time Travel' },
] as const

export default function ActivityBar() {
  const { sidebarView, setSidebarView, toggleTerminal, toggleChatPanel, sidebarOpen, toggleSidebar } = useStore()

  const handleNavClick = (view: typeof navItems[number]['view']) => {
    if (sidebarView === view && sidebarOpen) {
      toggleSidebar()
    } else {
      setSidebarView(view)
      if (!sidebarOpen) toggleSidebar()
    }
  }

  return (
    <div className="w-12 bg-orion-bg-activity flex flex-col items-center py-2 gap-1 flex-shrink-0">
      {navItems.map(({ view, icon: Icon, label }) => {
        const isActive = sidebarView === view && sidebarOpen
        return (
          <button
            key={view}
            onClick={() => handleNavClick(view)}
            title={label}
            className={`w-full flex items-center justify-center h-12 cursor-pointer transition-colors ${
              isActive
                ? 'text-white border-l-2 border-orion-accent-blue'
                : 'text-orion-text-secondary hover:text-white border-l-2 border-transparent'
            }`}
          >
            <Icon size={22} />
          </button>
        )
      })}

      <div className="w-8 border-t border-orion-border my-2" />

      <button
        onClick={toggleTerminal}
        title="Toggle Terminal"
        className="w-full flex items-center justify-center h-12 cursor-pointer text-orion-text-secondary hover:text-white transition-colors"
      >
        <Terminal size={22} />
      </button>
      <button
        onClick={toggleChatPanel}
        title="Toggle Chat"
        className="w-full flex items-center justify-center h-12 cursor-pointer text-orion-text-secondary hover:text-white transition-colors"
      >
        <MessageSquare size={22} />
      </button>
    </div>
  )
}
